const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment

const pageLimit = 10

const restController = {
  getRestaurants: (req, res, callback) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['categoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return callback({
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      //判斷是否被使用者加到收藏
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      //判斷是否被使用者按Like
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      //計算瀏覽次數
      restaurant.increment('viewCounts')
      callback({
        restaurant: restaurant.toJSON(),
        isFavorited: isFavorited,
        isLiked: isLiked
      })
    })
  },
  getFeeds: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    })
      .then(restaurants => {
        return Comment.findAll({
          raw: true,
          nest: true,
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [Restaurant, User]
        })
          .then(comments => {
            callback({
              restaurants,
              comments
            })
          })
      })
  },
  getDashboard: (req, res, callback) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category, Comment]
    })
      .then((restaurant => {
        const totalComment = restaurant.Comments.length
        callback({
          restaurant: restaurant.toJSON(),
          totalComment
        })
      }))
  },
  getTopRestaurants: (req, res, callback) => {
    Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurants => {
        //console.log('rrrr', restaurants[0].dataValues)
        //console.log('dddd:', restaurants[0].dataValues.description)
        //console.log('dddd50:', restaurants[0].dataValues.description.substring(0, 50)) ---這可以成功

        restaurants = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description,
          //之前可以成功，但現在不知道為何不能用substring(0,50)?
          favoriteCount: restaurant.dataValues.FavoritedUsers.length,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
        }))
        restaurants = restaurants.sort((a, b) => b.favoriteCount - a.favoriteCount).slice(0, 10)
        callback({ restaurants })
      })
  }
}

module.exports = restController
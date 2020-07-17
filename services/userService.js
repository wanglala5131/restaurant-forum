const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const fs = require('fs')
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const user = require('../models/user')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同')
      return res.redirect('signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複')
          return res.redirect('signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
          }).then(() => {
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, callback) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then((pageUser) => {
        //取出所有的Comment對應到的餐廳id
        const allCommentRestaurant = pageUser.Comments.map(d => (d.dataValues.RestaurantId))
        //用set將重複餐廳id去除，並轉成陣列
        const uniqueRestaurantId = [...new Set(allCommentRestaurant)]
        //根據已經過濾過的id去尋找餐廳
        Restaurant.findAll({ where: { id: uniqueRestaurantId } })
          .then(restaurant => {
            callback({
              pageUser: pageUser.toJSON(),
              commentRestaurants: restaurant.map(restaurant => restaurant.dataValues),
              followers: pageUser.dataValues.Followers.map(d => d.dataValues),
              followings: pageUser.dataValues.Followings.map(d => d.dataValues),
              favoritedRestaurants: pageUser.dataValues.FavoritedRestaurants.map(d => d.dataValues)
            })
          })
      })
  },
  editUser: (req, res, callback) => {
    //若非本人就導回本人的頁面
    if (req.user.id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.user.id}/edit`)
    }
    User.findByPk(req.params.id)
      .then((user) => {
        callback({ user })
      })
  },
  putUser: (req, res, callback) => {
    //若非本人就導回本人的頁面
    if (req.user.id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.user.id}/edit`)
    }
    if (!req.body.name) {
      callback({ status: 'error', message: 'Please enter your name' })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: img.data.link
            })
              .then((user) => {
                callback({ status: 'success', message: 'user was successfully to update' })
              })
          })
      })
    }
    else
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image
          })
            .then((user) => {
              callback({ status: 'success', message: 'user was successfully to update' })
            })
        })
  },
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        callback({ status: 'success', message: 'add favorite' })
      })
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: 'remove favorite' })
          })
      })
  },
  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant => {
        callback({ status: 'success', message: 'add like' })
      }))
  },
  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: 'remove like' })
          })
      })
  },
  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      callback({ users: users })
    })
  },
  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        callback({ status: 'success', message: 'add following' })
      })
  },
  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            callback({ status: 'success', message: 'remove following' })
          })
      })
  }
}

module.exports = userController
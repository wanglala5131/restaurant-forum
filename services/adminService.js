const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] }).then(restaurant => {
      callback({ restaurant: restaurant })
    })
  },
  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hour: req.body.opening_hour,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
      })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hour: req.body.opening_hour,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        callback({ status: 'success', message: 'restaurant was successfully created' })
      })
    }
  },
  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ stauts: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hour: req.body.opening_hour,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                callback({ stauts: 'success', message: 'restaurant was successfully to update' })
              })
          })
      })
    }
    else
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hour: req.body.opening_hour,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then((restaurant) => {
              callback({ stauts: 'success', message: 'restaurant was successfully to update' })
            })
        })
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      })
  },
  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true }).then(users => {
      callback({ users, user: req.user })
    })
  },
  putUsers: (req, res, callback) => {
    //users.handlebars有將root@example.com鎖住不能改admin，避免全部都被改成user
    return User.findByPk(req.params.id).then((user) => {
      if (user.dataValues.email === 'root@example.com') {
        callback({ status: 'error', message: 'root@example.com cannot be updated' })
      } else {
        if (user.dataValues.isAdmin) {
          return user.update({
            isAdmin: false,
            updatedAt: new Date() //更新時間
          }).then(() => {
            callback({ status: 'success', message: 'User was successfully to update as a user' })
          })
        } else {
          return user.update({
            isAdmin: true,
            updatedAt: new Date()  //更新時間
          }).then(() => {
            callback({ status: 'success', message: 'User was successfully to update as a admin' })
          })
        }
      }
    })
  }
}
module.exports = adminService
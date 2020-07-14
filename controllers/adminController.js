const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  // 新增
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/create', { categories: categories })
    })
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['massage'])
        return res.redirect('back')
      }
      req.flash('success_messages', 'restaurant was successfully created')
      return res.redirect('/admin/restaurants')
    })
  },
  //餐廳詳細資料
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      Category.findAll({ raw: true }).then(categories => {
        return res.render('admin/create', { restaurant: restaurant, categories: categories })
      })
    })
  },
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
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
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: (req, res) => {
    return User.findAll({ raw: true }).then(users => {
      //更改isAdmin的顯示
      for (let i = 0; i < users.length; i++) {

        if (users[i].isAdmin) {
          users[i].isAdmin = 'admin'
          users[i].setAs = 'set as user'
        } else {
          users[i].isAdmin = 'user'
          users[i].setAs = 'set as admin'
        }
      }
      return res.render('admin/users', { users, user: req.user, isAuthenticated: req.isAuthenticated })
    })
  },
  putUsers: (req, res) => {
    //users.handlebars有將root@example.com鎖住不能改admin，避免全部都被改成user
    return User.findByPk(req.params.id).then((user) => {
      if (user.isAdmin) {
        return user.update({
          isAdmin: false,
          updatedAt: new Date() //更新時間
        }).then(() => {
          req.flash('success_messages', 'User was successfully to update')
          res.redirect('/admin/users')
        })
      } else {
        return user.update({
          isAdmin: true,
          updatedAt: new Date()  //更新時間
        }).then(() => {
          req.flash('success_messages', 'User was successfully to update')
          res.redirect('/admin/users')
        })
      }
    })
  }
}

module.exports = adminController
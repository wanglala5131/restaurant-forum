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
  putRestaurant: (req, res,) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
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
    adminService.getUsers(req, res, (data) => {
      for (let i = 0; i < data.users.length; i++) {
        if (data.users[i].isAdmin) {
          data.users[i].isAdmin = 'admin'
          data.users[i].setAs = 'set as user'
        } else {
          data.users[i].isAdmin = 'user'
          data.users[i].setAs = 'set as admin'
        }
      }
      return res.render('admin/users', { users: data.users, user: req.user, isAuthenticated: req.isAuthenticated })
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
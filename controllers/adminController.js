const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants: restaurants, user: req.user, isAuthenticated: req.isAuthenticated })
    })
  },

  // 新增這個
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  }
}

module.exports = adminController
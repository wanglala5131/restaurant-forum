const db = require('../models')
const User = db.User

const adminController = {
  getRestaurants: (req, res) => {
    return res.render('admin/restaurants')
  }
}

module.exports = adminController
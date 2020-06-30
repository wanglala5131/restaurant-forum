const db = require('../models')
const User = db.User

const restController = {
  getRestaurants: (req, res) => {
    return res.render('restaurants')
  }
}

module.exports = restController
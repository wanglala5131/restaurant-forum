const db = require('../models')
const Category = db.Category
let categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            callback({
              categories: categories,
              category: category.toJSON()
            })
          })
      } else {
        callback({ categories: categories })
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ stauts: 'error', message: "name didn\'t exist" })
    } else {
      return Category.create({
        name: req.body.name
      }).then((category) => {
        callback({ stauts: 'success', message: "category was successfully created" })
      })
    }
  },
}
module.exports = categoryService
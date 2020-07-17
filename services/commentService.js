const db = require('../models')
const Comment = db.Comment
let commentController = {
  postComment: (req, res, callback) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then(comment => {
        callback({ stauts: 'success', message: 'add comment' })
      })
  },
  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            callback({ stauts: 'success', message: 'remove comment', RestaurantId: comment.RestaurantId })
          })
      })
  },
}
module.exports = commentController
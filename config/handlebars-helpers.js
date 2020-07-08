const moment = require('moment')

module.exports = {
  //不能用箭頭函式
  ifEqual: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    } else {
      console.log(this)
      return options.inverse(this)
    }
  },
  moment: function (a) {
    return moment(a).fromNow()
  }
}
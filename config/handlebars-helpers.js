module.exports = {
  ifEqual: (a, b, options) => {
    if (a === b) {
      return options.fn(this)
    } else {
      console.log(this)
      return options.inverse(this)
    }
  }
}
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')

module.exports = (app, passport) => {
  //驗證是否為已註冊的使用者
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  //驗證是否為管理員
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  //前台
  app.get('/', authenticated, (req, res) => { res.redirect('/restaurants') })
  app.get('/restaurants', restController.getRestaurants)

  //後台
  app.get('/admin', authenticatedAdmin, (req, res) => { res.redirect('/admin/restaurants') })
  app.get('/admin/restaurants', adminController.getRestaurants)

  //註冊
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  //登入與登出
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}
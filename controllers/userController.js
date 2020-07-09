const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同')
      return res.redirect('signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複')
          return res.redirect('signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
          }).then(() => {
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    User.findByPk(req.params.id)
      .then((pageUser) => {
        return res.render('profile', { pageUser: pageUser.toJSON() })
      })
  },
  editUser: (req, res) => {
    //若非本人就導回本人的頁面
    if (req.user.id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.user.id}/edit`)
    }
    User.findByPk(req.params.id)
      .then((user) => {
        return res.render('editUser')
      })
  },
  putUser: (req, res) => {
    //若非本人就導回本人的頁面
    if (req.user.id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.user.id}/edit`)
    }
    if (!req.body.name) {
      req.flash('error_messages', "Please enter your name")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: img.data.link
            })
              .then((user) => {
                req.flash('success_messages', 'user was successfully to update')
                res.redirect(`/users/${user.id}`)
              })
          })
      })
    }
    else
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image
          })
            .then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
        })
  }
}

module.exports = userController
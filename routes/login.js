const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');



router.get('/users/show/:id', checkAuthenticated, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.render('users/show', { user: user });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });
  

router.use(function(req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.username = req.user ? req.user.username : null;
  next();
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})
router.get('/register', checkNotAuthenticated , (req,res) => {
    res.render('register.ejs')
})


router.post('/register', checkNotAuthenticated,  async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        contact: req.body.contact,
        address: req.body.address
      });
      await user.save();
        
      console.log('New user registered:')
      console.log(user)

      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.redirect('/register');
    }
  });

  router.delete('/users/:id', checkAuthenticated, async (req, res) => {
    const userId = req.params.id;
  
    try {
      await User.findByIdAndRemove(userId);
      console.log('User deleted:')
      console.log(userId)
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.redirect('/users/show/' + userId);
    }
  });
  
  router.delete('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      console.log('User has Logged Out')
      res.redirect('/login');
    });
  });

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
      return next()
    }
    res.redirect('/login')
  }


function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
module.exports = router;

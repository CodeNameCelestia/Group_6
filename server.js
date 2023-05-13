if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')


const initializePassport = require('./public/javascripts/passport-config')
initializePassport(
  passport, 
  email => User.findOne({ email }),
  id => User.findOne({ _id: id })
)



const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const userRouter = require('./routes/users')

const { parse } = require('dotenv')







app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))



app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))



mongoose.connect(
    'mongodb+srv://Group6:' + process.env.MONGO_ATLAS_PW + '@cluster0.unbj9ol.mongodb.net/myDatabase?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connection Successful' + '\n' + 'Connected to MongoDB' + '\n' + 'Welcome Alejandro'));


function passLoggedIn(req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.loggedInUser = req.user;
  next();
}

app.use(passLoggedIn);

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.use('/users', userRouter)

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

app.get('/', (req, res) => {
  res.render('layout', { loggedIn: req.isAuthenticated(), username: res.locals.username });
});



app.use(function(req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.username = req.user ? req.user.username : null;
  next();
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})
app.get('/register', checkNotAuthenticated , (req,res) => {
    res.render('register.ejs')
})

const User = require('./models/user');
app.post('/register', checkNotAuthenticated,  async (req, res) => {
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
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.redirect('/register');
    }
  });

  app.delete('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
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

app.listen(process.env.PORT || 3000)



// Commands Shown:
// Get-ExecutionPolicy -List
// Set-ExecutionPolicy Unrestricted
// Set-ExecutionPolicy Unrestricted -Force
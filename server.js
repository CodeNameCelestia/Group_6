if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


const methodOverride = require('method-override')

//password bcrypt
const bcrypt = require('bcrypt')

// for login session
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

app.use(bodyParser.urlencoded({ limit: '11mb', extended: false }))

app.use(express.json());

const initializePassport = require('./public/javascripts/passport-config')
initializePassport(
passport, 
email => User.findOne({ email }),
id => User.findOne({ _id: id })
)


// using routes to connect our API
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const userRouter = require('./routes/users')
const apiRouter = require('./routes/api')
const loginRouter = require('./routes/login')
const User = require('./models/user');
const { parse } = require('dotenv')
const passLoggedIn = require('./public/javascripts/passLoggedIn')


app.use('/api', apiRouter);



app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)



app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
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

app.use(passLoggedIn);


//connection to database (MongoDB)
mongoose.connect(
  'mongodb+srv://Group6:' + process.env.MONGO_ATLAS_PW + '@cluster0.unbj9ol.mongodb.net/myDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connection Successful' + '\n' + 'Connected to MongoDB'));






app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.use('/users', userRouter)
app.use('/', loginRouter)




app.listen(process.env.PORT || 3000)



//To use this program type: " npm run devStart"


// Commands Shown:
// Get-ExecutionPolicy -List
// Set-ExecutionPolicy Unrestricted
// Set-ExecutionPolicy Unrestricted -Force
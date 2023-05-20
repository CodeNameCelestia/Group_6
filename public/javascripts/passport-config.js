const User = require('C:/Users/Alejandro/Desktop/Group_6/models/user');
const bcrypt = require('bcrypt')

const LocalStrategy = require('passport-local').Strategy;

function initializePassport(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
  
      if (!user) {
        return done(null, false, { message: 'No user with that email' });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (isPasswordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      console.log(err);
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  });
}

module.exports = initializePassport;
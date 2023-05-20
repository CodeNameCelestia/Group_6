function passLoggedIn(req, res, next) {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.loggedInUser = req.user;
    next();
  }
  
  module.exports = passLoggedIn;
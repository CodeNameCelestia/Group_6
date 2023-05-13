const express = require('express');
const router = express.Router();

// Assuming you have the User model imported
const User = require('../models/user');

router.get('/account', checkAuthenticated, (req, res) => {
  const user = req.user; // Get the currently logged-in user

  res.render('users/show', { user: user });
});


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Route handler for user details page
router.get('/show/:id?', checkAuthenticated, async (req, res) => {
  try {
    // Determine the user ID to query
    const userId = req.params.id || req.user.id;

    // Fetch the user from the database using the provided user ID
    const user = await User.findById(userId);

    // Render the 'users/show' template and pass the user object or null
    res.render('users/show', { user: user || null });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.render('error'); // Render an error page
  }
});
// ...


module.exports = router;

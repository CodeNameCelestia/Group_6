const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Assuming you have the User model imported

// GET user edit form
router.get('/:id/edit', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      // Handle case where user is not found
      return res.redirect('/account');
    }

    res.render('users/edit', { user: user });
  } catch (error) {
    console.error(error);
    res.render('error'); // Render an error page
  }
});

// POST user update
router.put('/:id', checkAuthenticated, async (req, res) => {
  const userId = req.params.id;

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const updatedUser = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      contact: req.body.contact,
      address: req.body.address
    };

    await User.findByIdAndUpdate(userId, updatedUser);

    const user = await User.findById(userId);

    res.render('users/show', { user: user });
    console.log('User updated:', user);
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${userId}/edit`);
  }
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
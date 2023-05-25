const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Author = require('../models/author');

// Get all authors
router.get('/authors', async (req, res) => {
  console.log('GET request received for /authors');
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific author
router.get('/authors/:id', async (req, res) => {
  console.log(`GET request received for /authors/${req.params.id}`);
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new author
router.post('/authors', async (req, res) => {
  console.log('POST request received for /authors');
  try {
    // Add the logic to create a new author
    // ...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  console.log('GET request received for /users');
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific user
router.get('/users/:id', async (req, res) => {
  console.log(`GET request received for /users/${req.params.id}`);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new user
router.post('/users', async (req, res) => {
  console.log('POST request received for /users');
  try {
    const { username, email, password, name, contact, address } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      contact,
      address,
    });

    const createdUser = await newUser.save();
    console.log('User created:', createdUser);
    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating user' });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  console.log(`PUT request received for /users/${req.params.id}`);
  console.log('Request Body:', req.body);
  try {
    const { password, ...userData } = req.body;

    // Hash the new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User updated:', user);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error updating user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  console.log(`DELETE request received for /users/${req.params.id}`);
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User deleted:', user);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting user' });
  }
});

//login system
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, return an error
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Authentication successful
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;  
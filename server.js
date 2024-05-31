const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/user');
const Image = require('./models/image');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure express-session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Route for the root URL
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    // Save the user to the database
    await user.save();

    // Send success response
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Successful login
    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Route to save generated image
app.post('/api/image', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { imageUrl } = req.body;
    const image = new Image({
      userId: userId,
      imageUrl: imageUrl,
      createdAt: new Date()
    });

    await image.save();
    res.status(201).json({ message: 'Image saved successfully' });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get user's images
app.get('/api/images', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const images = await Image.find({ userId: userId });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete an image
app.delete('/api/image/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const imageId = req.params.id;
    const image = await Image.findOneAndDelete({ _id: imageId, userId: userId });

    if (!image) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app; // Export app for testing purposes

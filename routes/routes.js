const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Image = require('../models/image');
const authenticateToken = require('../middleware/authenticate');

// Route for handling user signup
router.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for saving an image
router.post('/image', authenticateToken, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const image = new Image({ imageUrl, userId: req.user.userId });
        await image.save();
        res.status(201).json({ message: 'Image saved successfully' });
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for retrieving images by user ID
router.get('/images', authenticateToken, async (req, res) => {
    try {
        const images = await Image.find({ userId: req.user.userId });
        res.status(200).json(images);
    } catch (error) {
        console.error('Error retrieving images:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to delete an image
router.delete('/image/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
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

module.exports = router;

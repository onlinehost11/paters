import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Register
router.post('/register', async(req, res) => {
    try {
        const { email, password, name, role = 'member' } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        // Check if email exists
        const existing = await usersCollection.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await usersCollection.insertOne({
            email,
            password: hashedPassword,
            name,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Generate token
        const token = jwt.sign({ id: result.insertedId.toString(), email, name, role },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertedId, email, name, role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        // Find user
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', authenticate, async(req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
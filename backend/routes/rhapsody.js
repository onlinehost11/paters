import express from 'express';
import multer from 'multer';
import { getDB } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif',
        'audio/mpeg', 'audio/wav',
        'video/mp4', 'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Get all devotionals
router.get('/', async(req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const db = getDB();
        const rhapsodyCollection = db.collection('rhapsody');

        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { scripture: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const posts = await rhapsodyCollection
            .find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await rhapsodyCollection.countDocuments(query);

        res.json({
            data: posts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single post
router.get('/:id', async(req, res) => {
    try {
        const db = getDB();
        const rhapsodyCollection = db.collection('rhapsody');

        const post = await rhapsodyCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create devotional (admin only)
router.post('/', authenticate, authorize(['admin']), upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async(req, res) => {
    try {
        const { title, scripture, message, author = 'Man of God' } = req.body;

        if (!title || !scripture || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const rhapsodyCollection = db.collection('rhapsody');

        const postData = {
            title,
            scripture,
            message,
            author,
            date: new Date(),
            createdBy: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            media: {}
        };

        // Handle file uploads
        if (req.files.image) {
            postData.media.image = `/uploads/${req.files.image[0].filename}`;
        }
        if (req.files.audio) {
            postData.media.audio = `/uploads/${req.files.audio[0].filename}`;
        }
        if (req.files.video) {
            postData.media.video = `/uploads/${req.files.video[0].filename}`;
        }

        const result = await rhapsodyCollection.insertOne(postData);

        res.status(201).json({
            message: 'Devotional created successfully',
            id: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update devotional
router.put('/:id', authenticate, authorize(['admin']), upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async(req, res) => {
    try {
        const { title, scripture, message, author } = req.body;
        const db = getDB();
        const rhapsodyCollection = db.collection('rhapsody');

        // Get existing post
        const existingPost = await rhapsodyCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const updateData = {
            title,
            scripture,
            message,
            author,
            updatedAt: new Date(),
            media: existingPost.media || {}
        };

        // Handle new file uploads
        if (req.files.image) {
            updateData.media.image = `/uploads/${req.files.image[0].filename}`;
        }
        if (req.files.audio) {
            updateData.media.audio = `/uploads/${req.files.audio[0].filename}`;
        }
        if (req.files.video) {
            updateData.media.video = `/uploads/${req.files.video[0].filename}`;
        }

        await rhapsodyCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

        res.json({ message: 'Devotional updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete devotional
router.delete('/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const db = getDB();
        const rhapsodyCollection = db.collection('rhapsody');

        // Get post to delete files
        const post = await rhapsodyCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (post && post.media) {
            // Delete associated files
            ['image', 'audio', 'video'].forEach(mediaType => {
                if (post.media[mediaType]) {
                    const filePath = path.join(__dirname, '..', post.media[mediaType]);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        }

        const result = await rhapsodyCollection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Devotional deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
import express from 'express';
import { getDB } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all groups
router.get('/', async(req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const db = getDB();
        const groupsCollection = db.collection('groups');

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { leader: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const groups = await groupsCollection
            .find(query)
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await groupsCollection.countDocuments(query);

        res.json({
            data: groups,
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

// Get single group
router.get('/:id', async(req, res) => {
    try {
        const db = getDB();
        const groupsCollection = db.collection('groups');

        const group = await groupsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create group (admin & cell leaders)
router.post('/', authenticate, authorize(['admin', 'cell_leader']), async(req, res) => {
    try {
        const { name, leader, description, location, meetingTime, members } = req.body;

        if (!name || !leader || !location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const groupsCollection = db.collection('groups');

        const result = await groupsCollection.insertOne({
            name,
            leader,
            description,
            location,
            meetingTime,
            members: members || [],
            memberCount: members ? members.length : 0,
            createdBy: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            message: 'Group created successfully',
            id: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update group
router.put('/:id', authenticate, authorize(['admin', 'cell_leader']), async(req, res) => {
    try {
        const { name, leader, description, location, meetingTime } = req.body;
        const db = getDB();
        const groupsCollection = db.collection('groups');

        const result = await groupsCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
            $set: {
                name,
                leader,
                description,
                location,
                meetingTime,
                updatedAt: new Date()
            }
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete group
router.delete('/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const db = getDB();
        const groupsCollection = db.collection('groups');

        const result = await groupsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Join group
router.post('/:id/join', async(req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const groupsCollection = db.collection('groups');

        const result = await groupsCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
            $push: {
                members: {
                    _id: new ObjectId(),
                    name,
                    email,
                    phone,
                    joinedAt: new Date()
                }
            },
            $inc: { memberCount: 1 }
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(201).json({ message: 'Joined group successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
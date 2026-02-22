import express from 'express';
import { getDB } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all events (public)
router.get('/', async(req, res) => {
    try {
        const { type, search, page = 1, limit = 10 } = req.query;
        const db = getDB();
        const eventsCollection = db.collection('events');

        let query = {};
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const events = await eventsCollection
            .find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await eventsCollection.countDocuments(query);

        res.json({
            data: events,
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

// Get single event
router.get('/:id', async(req, res) => {
    try {
        const db = getDB();
        const eventsCollection = db.collection('events');

        const event = await eventsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create event (admin only)
router.post('/', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const { title, description, date, time, location, type } = req.body;

        if (!title || !date || !location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const eventsCollection = db.collection('events');

        const result = await eventsCollection.insertOne({
            title,
            description,
            date: new Date(date),
            time,
            location,
            type: type || 'upcoming',
            createdBy: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            registrations: []
        });

        res.status(201).json({
            message: 'Event created successfully',
            id: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update event
router.put('/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const { title, description, date, time, location, type } = req.body;
        const db = getDB();
        const eventsCollection = db.collection('events');

        const result = await eventsCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
            $set: {
                title,
                description,
                date: new Date(date),
                time,
                location,
                type,
                updatedAt: new Date()
            }
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete event
router.delete('/:id', authenticate, authorize(['admin']), async(req, res) => {
    try {
        const db = getDB();
        const eventsCollection = db.collection('events');

        const result = await eventsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register for event
router.post('/:id/register', async(req, res) => {
    try {
        const { name, email, phone, guests = 1 } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = getDB();
        const eventsCollection = db.collection('events');

        const result = await eventsCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
            $push: {
                registrations: {
                    _id: new ObjectId(),
                    name,
                    email,
                    phone,
                    guests: parseInt(guests),
                    registeredAt: new Date()
                }
            }
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
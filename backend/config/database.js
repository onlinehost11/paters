import { MongoClient, ServerApiVersion } from 'mongodb';

let db = null;

export async function connectDB() {
    try {
        const client = new MongoClient(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/paters-group', {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            }
        );

        await client.connect();
        db = client.db('paters-group');

        // Create indexes
        await createIndexes();

        console.log('✓ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('✗ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
}

async function createIndexes() {
    try {
        // Users indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });

        // Events indexes
        await db.collection('events').createIndex({ date: -1 });
        await db.collection('events').createIndex({ createdBy: 1 });

        // Groups indexes
        await db.collection('groups').createIndex({ name: 1 });
        await db.collection('groups').createIndex({ createdBy: 1 });

        // Rhapsody indexes
        await db.collection('rhapsody').createIndex({ date: -1 });
        await db.collection('rhapsody').createIndex({ createdBy: 1 });

        console.log('✓ Database indexes created');
    } catch (error) {
        console.error('Index creation error:', error.message);
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
}
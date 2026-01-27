
import fs from 'fs';
import path from 'path';
import { IUser } from '@/lib/models/User';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper to read local users
const getLocalUsers = (): any[] => {
    try {
        const fileData = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
};

// Helper to write local users
const saveLocalUsers = (users: any[]) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const UserRepository = {
    async findByEmail(email: string): Promise<IUser | null> {
        // Try MongoDB first
        const db = await connectToDatabase();
        if (db) {
            // console.log('🔍 Searching user in MongoDB...');
            return await User.findOne({ email });
        }

        // Fallback to local file
        const users = getLocalUsers();
        // Mimic Mongoose Document structure roughly
        const user = users.find(u => u.email === email);
        if (!user) return null;

        // Add minimal Mongoose-like properties if needed by NextAuth
        return {
            ...user,
            _id: user.id || user._id,
        } as unknown as IUser;
    },

    async create(userData: Partial<IUser>): Promise<IUser> {
        const db = await connectToDatabase();
        if (db) {
            console.log('📝 Creating user in MongoDB...');
            return await User.create(userData);
        }

        // Fallback to local file
        const users = getLocalUsers();

        // Check duplicate
        if (users.find(u => u.email === userData.email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            ...userData,
            _id: Date.now().toString(), // Simple ID generation
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        users.push(newUser);
        saveLocalUsers(users);

        return newUser as unknown as IUser;
    }
};

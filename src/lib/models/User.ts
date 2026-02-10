
import mongoose, { Schema, Model, Document } from 'mongoose';

export type UserRole = 'user' | 'teacher' | 'admin';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: UserRole;
    emailVerified?: Date;

    // Student Specific
    progress?: number;
    grade?: string;
    points?: number;
    streak?: number;
    achievements?: string[]; // IDs of unlocked achievements
    completedModules?: string[]; // IDs of completed modules
    totalTimeSpent?: number; // in minutes

    // Relationships
    teacherId?: mongoose.Types.ObjectId; // For students
    childrenIds?: mongoose.Types.ObjectId[]; // For parents

    // Accessibility Preferences
    settings?: {
        theme?: 'light' | 'dark' | 'high-contrast';
        fontSize?: 'small' | 'medium' | 'large';
        textToSpeech?: boolean;
        speechToText?: boolean;
        language?: string;
    };

    createdAt: Date;
    updatedAt: Date;
    lastActive?: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ['user', 'teacher', 'admin'], default: 'user' },
    emailVerified: { type: Date },

    // Gamification & Progress
    progress: { type: Number, default: 0 },
    grade: { type: String },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    achievements: [{ type: String }],
    completedModules: [{ type: String }],
    totalTimeSpent: { type: Number, default: 0 },

    // Relationships
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    childrenIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Settings
    settings: {
        theme: { type: String, default: 'light' },
        fontSize: { type: String, default: 'medium' },
        textToSpeech: { type: Boolean, default: false },
        speechToText: { type: Boolean, default: false },
        language: { type: String, default: 'en' },
    },
    lastActive: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Prevent model recompilation error in Next.js hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

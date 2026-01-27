
import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'module' | 'quiz' | 'achievement' | 'practice';
    title: string;
    points?: number;
    meta?: Record<string, any>; // Extra data like moduleId, quizScore etc.
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['module', 'quiz', 'achievement', 'practice'], required: true },
    title: { type: String, required: true },
    points: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

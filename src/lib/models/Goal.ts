
import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    current: number;
    target: number;
    completed: boolean;
    color: string; // Hex code or tailwind class for UI
    deadline?: Date;
    createdAt: Date;
}

const GoalSchema = new Schema<IGoal>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    current: { type: Number, default: 0 },
    target: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    color: { type: String, default: 'blue' },
    deadline: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

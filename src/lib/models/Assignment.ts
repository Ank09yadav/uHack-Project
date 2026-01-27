
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignment extends Document {
    title: string;
    description?: string;
    subject: string;
    dueDate: Date;
    assignedBy: mongoose.Types.ObjectId; // Teacher ID
    assignedTo: mongoose.Types.ObjectId[]; // Student IDs
    status: 'pending' | 'completed' | 'graded';
    score?: number;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['pending', 'completed', 'graded'], default: 'pending' },
    score: { type: Number },
}, {
    timestamps: true
});

const Assignment: Model<IAssignment> = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;

import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    authorName: string;
    type: 'tip' | 'achievement' | 'resource' | 'story';
    content: string;
    upvotes: mongoose.Types.ObjectId[]; // Array of user IDs who upvoted
    downvotes: mongoose.Types.ObjectId[]; // Array of user IDs who downvoted
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    type: {
        type: String,
        enum: ['tip', 'achievement', 'resource', 'story'],
        default: 'tip'
    },
    content: { type: String, required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

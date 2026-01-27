
import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Avoid recompiling model in Next.js hot reload
export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);

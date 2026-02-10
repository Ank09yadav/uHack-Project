import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { postId, action } = await req.json(); // action: 'upvote' | 'downvote'
        await dbConnect();

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const userId = session.user.id;

        // Reset previous vote by this user
        post.upvotes = post.upvotes.filter((id: any) => id.toString() !== userId);
        post.downvotes = post.downvotes.filter((id: any) => id.toString() !== userId);

        if (action === 'upvote') {
            post.upvotes.push(userId);
        } else if (action === 'downvote') {
            post.downvotes.push(userId);
        }

        await post.save();
        return NextResponse.json(post);
    } catch (error) {
        console.error("Vote error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

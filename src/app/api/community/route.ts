import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const posts = await Post.find().sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Fetch posts error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { content, type } = await req.json();
        await dbConnect();

        const post = await Post.create({
            userId: session.user.id,
            authorName: session.user.name,
            content,
            type: type || 'tip',
            upvotes: [],
            downvotes: []
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, content, type } = await req.json();
        await dbConnect();

        const post = await Post.findOne({ _id: id, userId: session.user.id });
        if (!post) {
            return NextResponse.json({ message: 'Post not found or unauthorized' }, { status: 404 });
        }

        if (content !== undefined) post.content = content;
        if (type !== undefined) post.type = type;

        await post.save();
        return NextResponse.json(post);
    } catch (error) {
        console.error("Update post error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await dbConnect();
        const result = await Post.deleteOne({ _id: id, userId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Post not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete post error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

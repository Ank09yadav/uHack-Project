import { NextResponse } from 'next/server';

import { UserRepository } from '@/lib/user-repository';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Use Repository (handles DB or File fallback)
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await UserRepository.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
        });

        return NextResponse.json(
            { message: 'User created successfully', user: { email: newUser.email, name: newUser.name, role: newUser.role } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

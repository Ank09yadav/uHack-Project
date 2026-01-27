import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { UserRepository } from '@/lib/user-repository';
import { verifyPassword } from '@/lib/password';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                // Use Repository (handles DB or File fallback)
                const user = await UserRepository.findByEmail(credentials.email);

                if (!user) {
                    throw new Error('User not found');
                }

                if (!user.password) { // Handle OAuth users who don't have a password
                    throw new Error('Please login with your social account');
                }

                const isValid = await verifyPassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth',
        error: '/auth', // Error code passed in query string as ?error=
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getTursoClient } from '@/lib/db/client';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            await getTursoClient().execute({
                sql: `INSERT OR IGNORE INTO users (id, email, name, image, createdAt)
                      VALUES (?, ?, ?, ?, ?)`,
                args: [
                    user.id ?? user.email!,
                    user.email!,
                    user.name ?? '',
                    user.image ?? '',
                    new Date().toISOString(),
                ],
            });
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.sub!;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) token.sub = user.id ?? user.email!;
            return token;
        },
    },
    pages: {
        signIn: '/api/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
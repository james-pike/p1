// src/lib/auth.ts
import { QwikAuth$ } from '@auth/qwik';
import Google from '@auth/core/providers/google';
import type { Provider } from '@auth/core/providers';
import { tursoClient, createUser, getUserByEmail } from './turso';
import type { Session } from 'next-auth';

export const authOptions = {
  secret: process.env.AUTH_SECRET!,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }) as Provider,
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      try {
        const client = await tursoClient({ env: { get: (key: string) => process.env[key] } });
        if (!user.email) {
          console.error('Sign-in failed: User email is missing');
          return false;
        }
        const existingUser = await getUserByEmail(client, user.email);
        if (!existingUser) {
          await createUser(client, user.email, user.name ?? undefined);
        }
        return true;
      } catch (error) {
        console.error('Sign-in callback error:', error);
        return false;
      }
    },
    async session({ session, token }: { session: Session; token: any }) {
      try {
        const client = await tursoClient({ env: { get: (key: string) => process.env[key] } });
        if (!session.user || !session.user.email) {
          console.error('Session callback error: User or user email is missing');
          return session;
        }
        const dbUser = await getUserByEmail(client, session.user.email);
        if (dbUser && dbUser.id !== undefined) {
          session.user.id = String(dbUser.id);
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
};

export const { onRequest, useSignIn, useSignOut, useSession } = QwikAuth$(({ env }) => ({
  secret: env.get('AUTH_SECRET')!,
  trustHost: true,
  providers: [
    Google({
      clientId: env.get('GOOGLE_CLIENT_ID')!,
      clientSecret: env.get('GOOGLE_CLIENT_SECRET')!,
    }) as Provider,
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const client = await tursoClient({ env });
        if (!user.email) {
          console.error('Sign-in failed: User email is missing');
          return false;
        }
        const existingUser = await getUserByEmail(client, user.email);
        if (!existingUser) {
          await createUser(client, user.email, user.name ?? undefined);
        }
        return true;
      } catch (error) {
        console.error('Sign-in callback error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        const client = await tursoClient({ env });
        if (!session.user || !session.user.email) {
          console.error('Session callback error: User or user email is missing');
          return session;
        }
        const dbUser = await getUserByEmail(client, session.user.email);
        if (dbUser && dbUser.id !== undefined) {
          session.user.id = String(dbUser.id);
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
}));
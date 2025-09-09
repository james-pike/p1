// src/types/next-auth.d.ts
import { Session as NextAuthSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends NextAuthSession {
    user: {
      id: string;
      name?: string | null;
      email: string; // Make email non-optional since you require it
      image?: string | null;
    };
  }
}
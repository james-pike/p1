// src/routes/(login)/login/index.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { Session } from 'next-auth';
import { signIn } from 'next-auth/react';

export const useSessionLoader = routeLoader$(async ({ sharedMap }) => {
  const session = sharedMap.get('session') as Session | null;
  if (!session || !session.user) {
    return null;
  }
  throw new Response(null, { status: 302, headers: { Location: '/gallery' } });
});

export default component$(() => {
  const error = useSignal('');

  const handleGoogleSignIn = server$(async () => {
    try {
      await signIn('google', { callbackUrl: '/gallery' });
      return { success: true };
    } catch (err) {
      const signInError = err as Error;
      console.error('Google sign-in error:', signInError);
      error.value = 'Failed to sign in with Google';
      return { success: false, error: signInError.message };
    }
  });

  return (
    <div class="max-w-md mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      {error.value && (
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          {error.value}
        </div>
      )}
      <button
        onClick$={async () => await handleGoogleSignIn()}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        Sign in with Google
      </button>
    </div>
  );
});
// /vercel/path0/src/routes/(login)/login/index.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { useSession, signIn } from '~/lib/auth';

export const useSessionLoader = routeLoader$(async ({ redirect, resolveValue }) => {
  const session = await resolveValue(useSession); // Correctly resolve useSession
  if (session?.user) {
    throw redirect(302, '/gallery'); // Redirect authenticated users
  }
  return null; // No session, allow access to login page
});

export default component$(() => {
  const error = useSignal('');

  const handleGoogleSignIn = server$(async () => {
    try {
      await signIn('google', { callbackUrl: '/gallery' });
      return { success: true };
    } catch (err) {
      console.error('Google sign-in error:', err);
      error.value = 'Failed to sign in with Google';
      return { success: false, error: err.message };
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
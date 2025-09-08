// src/routes/login/index.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { signIn, useSession } from '~/lib/auth';

export const useSessionLoader = routeLoader$(async ({ redirect }) => {
  const session = await useSession();
  if (session.value?.user) {
    throw redirect(302, '/gallery'); // Redirect authenticated users
  }
  return null;
});

export default component$(() => {
  const session = useSessionLoader();
  const error = useSignal('');

  const handleGoogleSignIn = server$(async () => {
    try {
      await signIn('google', { callbackUrl: '/gallery' });
    } catch (err) {
      console.error('Google sign-in error:', err);
      error.value = 'Failed to sign in with Google';
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
        onClick$={handleGoogleSignIn}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        Sign in with Google
      </button>
    </div>
  );
});
// src/routes/api/auth/[...nextauth]/index.tsx
import { onRequest as authOnRequest } from '~/lib/auth';
import type { RequestHandler } from '@builder.io/qwik-city';
export const onRequest: RequestHandler = authOnRequest;
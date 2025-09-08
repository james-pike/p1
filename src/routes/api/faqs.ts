// src/routes/api/faqs.ts
import { server$ } from '@builder.io/qwik-city';
import { tursoClient, getFaqs } from '~/lib/turso';

export const onGet = server$(async (event) => {
  const client = tursoClient(event);
  return await getFaqs(client);
});

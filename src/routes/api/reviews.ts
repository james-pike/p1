// src/routes/api/reviews.ts
import { server$ } from '@builder.io/qwik-city';
import { tursoClient, getReviews, createReview, updateReview, deleteReview } from '~/lib/turso';

export const onGet = server$(async (event) => {
  const client = await tursoClient(event);
  return await getReviews(client);
});

export const onPost = server$(async (event) => {
  const { name, review, rating, date, role } = await event.request.json();
  const client = await tursoClient(event);
  const id = await createReview(client, name, review, rating, date, role);
  return { id };
});

export const onPut = server$(async (event) => {
  const { id, name, review, rating, date, role } = await event.request.json();
  const client = await tursoClient(event);
  await updateReview(client, id, name, review, rating, date, role);
  return { success: true };
});

export const onDelete = server$(async (event) => {
  const { id } = await event.request.json();
  const client = await tursoClient(event);
  await deleteReview(client, id);
  return { success: true };
});

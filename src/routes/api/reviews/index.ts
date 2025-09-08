// src/routes/api/reviews/index.tsx
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getReviews, createReview, updateReview, deleteReview } from '~/lib/turso';

// GET /api/reviews
export const onGet: RequestHandler = async ({ json, env }) => {
  console.log('GET /api/reviews - Request received');
  try {
    console.log('GET /api/reviews - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('GET /api/reviews - Client created, calling getReviews...');
    const reviews = await getReviews(client);
    console.log('GET /api/reviews - Retrieved reviews:', reviews);

    json(200, reviews);
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    console.error('GET /api/reviews error stack:', error.stack);
    json(500, { error: 'Failed to fetch reviews', details: error.message });
  }
};

// POST /api/reviews
export const onPost: RequestHandler = async ({ request, json, env }) => {
  console.log('POST /api/reviews - Request received');
  try {
    const body = await request.json();
    console.log('POST /api/reviews - Request body:', body);
    const { name, review, rating, date } = body;

    if (!name || !review || !rating || !date) {
      console.log('POST /api/reviews - Missing required fields:', { name, review, rating, date });
      json(400, { error: 'Name, review, rating, and date are required' });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      console.log('POST /api/reviews - Invalid rating:', { rating });
      json(400, { error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    console.log('POST /api/reviews - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('POST /api/reviews - Client created, calling createReview...');
    const id = await createReview(client, name, review, rating, date);
    console.log('POST /api/reviews - Review created with ID:', id);

    json(201, { id, name, review, rating, date });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    console.error('POST /api/reviews error stack:', error.stack);
    json(500, { error: 'Failed to create review', details: error.message });
  }
};

// PUT /api/reviews
export const onPut: RequestHandler = async ({ request, json, env }) => {
  console.log('PUT /api/reviews - Request received');
  try {
    const body = await request.json();
    console.log('PUT /api/reviews - Request body:', body);
    const { id, name, review, rating, date } = body;

    if (!id || !name || !review || !rating || !date) {
      console.log('PUT /api/reviews - Missing required fields:', { id, name, review, rating, date });
      json(400, { error: 'ID, name, review, rating, and date are required' });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      console.log('PUT /api/reviews - Invalid rating:', { rating });
      json(400, { error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    console.log('PUT /api/reviews - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('PUT /api/reviews - Client created, calling updateReview...');
    await updateReview(client, id, name, review, rating, date);
    console.log('PUT /api/reviews - Review updated with ID:', id);

    json(200, { id, name, review, rating, date });
  } catch (error) {
    console.error('PUT /api/reviews error:', error);
    console.error('PUT /api/reviews error stack:', error.stack);
    json(500, { error: 'Failed to update review', details: error.message });
  }
};

// DELETE /api/reviews
export const onDelete: RequestHandler = async ({ request, json, env }) => {
  console.log('DELETE /api/reviews - Request received');
  try {
    const body = await request.json();
    console.log('DELETE /api/reviews - Request body:', body);
    const { id } = body;

    if (!id) {
      console.log('DELETE /api/reviews - Missing ID:', { id });
      json(400, { error: 'ID is required' });
      return;
    }

    console.log('DELETE /api/reviews - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('DELETE /api/reviews - Client created, calling deleteReview...');
    await deleteReview(client, id);
    console.log('DELETE /api/reviews - Review deleted with ID:', id);

    json(200, { success: true });
  } catch (error) {
    console.error('DELETE /api/reviews error:', error);
    console.error('DELETE /api/reviews error stack:', error.stack);
    json(500, { error: 'Failed to delete review', details: error.message });
  }
};
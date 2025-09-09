// src/routes/api/gallery_images/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '~/lib/turso';
import type { Session } from 'next-auth';

export const onGet: RequestHandler = async ({ json, sharedMap, env }) => {
  console.log('GET /api/gallery_images - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('GET /api/gallery_images - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('GET /api/gallery_images - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const client = await tursoClient({ env });
    const images = await getGalleryImages(client);
    console.log('GET /api/gallery_images - Retrieved images:', images.map(i => ({ ...i, image: `base64(...${i.image.slice(-20)})` })));
    json(200, images);
  } catch (err) {
    const error = err as Error;
    console.error('GET /api/gallery_images error stack:', error.stack);
    json(500, { error: 'Failed to fetch gallery images', details: error.message });
  }
};

export const onPost: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('POST /api/gallery_images - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('POST /api/gallery_images - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('POST /api/gallery_images - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    console.log('POST /api/gallery_images - Request body:', { ...body, image: `base64(...${body.image?.slice(-20)})` });
    const { image, filename } = body;

    if (!image || !filename) {
      console.log('POST /api/gallery_images - Missing required fields:', { image, filename });
      json(400, { error: 'Image and filename are required' });
      return;
    }

    if (!image.startsWith('data:image/')) {
      console.log('POST /api/gallery_images - Invalid image format:', { image: `base64(...${image.slice(-20)})` });
      json(400, { error: 'Image must be a valid base64-encoded image' });
      return;
    }

    const client = await tursoClient({ env });
    const id = await createGalleryImage(client, image, filename);
    console.log('POST /api/gallery_images - Image created with ID:', id);
    json(201, { id, image, filename });
  } catch (err) {
    const error = err as Error;
    console.error('POST /api/gallery_images error stack:', error.stack);
    json(500, { error: 'Failed to create gallery image', details: error.message });
  }
};

export const onPut: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('PUT /api/gallery_images - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('PUT /api/gallery_images - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('PUT /api/gallery_images - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    console.log('PUT /api/gallery_images - Request body:', { ...body, image: `base64(...${body.image?.slice(-20)})` });
    const { id, image, filename } = body;

    if (!id || !image || !filename) {
      console.log('PUT /api/gallery_images - Missing required fields:', { id, image, filename });
      json(400, { error: 'ID, image, and filename are required' });
      return;
    }

    if (!image.startsWith('data:image/')) {
      console.log('PUT /api/gallery_images - Invalid image format:', { image: `base64(...${image.slice(-20)})` });
      json(400, { error: 'Image must be a valid base64-encoded image' });
      return;
    }

    const client = await tursoClient({ env });
    await updateGalleryImage(client, id, image, filename);
    console.log('PUT /api/gallery_images - Image updated with ID:', id);
    json(200, { id, image, filename });
  } catch (err) {
    const error = err as Error;
    console.error('PUT /api/gallery_images error stack:', error.stack);
    json(500, { error: 'Failed to update gallery image', details: error.message });
  }
};

export const onDelete: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('DELETE /api/gallery_images - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('DELETE /api/gallery_images - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('DELETE /api/gallery_images - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      console.log('DELETE /api/gallery_images - Missing ID');
      json(400, { error: 'ID is required' });
      return;
    }

    const client = await tursoClient({ env });
    await deleteGalleryImage(client, id);
    console.log('DELETE /api/gallery_images - Image deleted with ID:', id);
    json(200, { message: 'Gallery image deleted' });
  } catch (err) {
    const error = err as Error;
    console.error('DELETE /api/gallery_images error stack:', error.stack);
    json(500, { error: 'Failed to delete gallery image', details: error.message });
  }
};
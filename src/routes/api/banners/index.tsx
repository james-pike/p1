// src/routes/api/banners/index.tsx
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getBanners, createBanner, updateBanner, deleteBanner } from '~/lib/turso';

// GET /api/banners
export const onGet: RequestHandler = async ({ json, env }) => {
  console.log('GET /api/banners - Request received');
  try {
    console.log('GET /api/banners - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('GET /api/banners - Client created, calling getBanners...');
    const banners = await getBanners(client);
    console.log('GET /api/banners - Retrieved banners:', banners);
    
    json(200, banners);
  } catch (error) {
    console.error('GET /api/banners error:', error);
    console.error('GET /api/banners error stack:', error.stack);
    json(500, { error: 'Failed to fetch banners', details: error.message });
  }
};

// POST /api/banners
export const onPost: RequestHandler = async ({ request, json, env }) => {
  console.log('POST /api/banners - Request received');
  try {
    const body = await request.json();
    console.log('POST /api/banners - Request body:', body);
    const { title, subtitle, message } = body;
    
    if (!title || !subtitle || !message) {
      console.log('POST /api/banners - Missing required fields:', { title, subtitle, message });
      json(400, { error: 'Title, subtitle, and message are required' });
      return;
    }
    
    console.log('POST /api/banners - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('POST /api/banners - Client created, calling createBanner...');
    const id = await createBanner(client, title, subtitle, message);
    console.log('POST /api/banners - Banner created with ID:', id);
    
    json(201, { id, title, subtitle, message });
  } catch (error) {
    console.error('POST /api/banners error:', error);
    console.error('POST /api/banners error stack:', error.stack);
    json(500, { error: 'Failed to create banner', details: error.message });
  }
};

// PUT /api/banners
export const onPut: RequestHandler = async ({ request, json, env }) => {
  console.log('PUT /api/banners - Request received');
  try {
    const body = await request.json();
    console.log('PUT /api/banners - Request body:', body);
    const { id, title, subtitle, message } = body;
    
    if (!id || !title || !subtitle || !message) {
      console.log('PUT /api/banners - Missing required fields:', { id, title, subtitle, message });
      json(400, { error: 'ID, title, subtitle, and message are required' });
      return;
    }
    
    console.log('PUT /api/banners - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('PUT /api/banners - Client created, calling updateBanner...');
    await updateBanner(client, id, title, subtitle, message);
    console.log('PUT /api/banners - Banner updated with ID:', id);
    
    json(200, { id, title, subtitle, message });
  } catch (error) {
    console.error('PUT /api/banners error:', error);
    console.error('PUT /api/banners error stack:', error.stack);
    json(500, { error: 'Failed to update banner', details: error.message });
  }
};

// DELETE /api/banners
export const onDelete: RequestHandler = async ({ request, json, env }) => {
  console.log('DELETE /api/banners - Request received');
  try {
    const body = await request.json();
    console.log('DELETE /api/banners - Request body:', body);
    const { id } = body;
    
    if (!id) {
      console.log('DELETE /api/banners - Missing ID:', { id });
      json(400, { error: 'ID is required' });
      return;
    }
    
    console.log('DELETE /api/banners - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('DELETE /api/banners - Client created, calling deleteBanner...');
    await deleteBanner(client, id);
    console.log('DELETE /api/banners - Banner deleted with ID:', id);
    
    json(200, { success: true });
  } catch (error) {
    console.error('DELETE /api/banners error:', error);
    console.error('DELETE /api/banners error stack:', error.stack);
    json(500, { error: 'Failed to delete banner', details: error.message });
  }
};
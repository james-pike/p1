// src/routes/api/classes/index.tsx
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getClasses, createClass, updateClass, deleteClass } from '~/lib/turso';

// GET /api/classes
export const onGet: RequestHandler = async ({ json, env }) => {
  console.log('GET /api/classes - Request received');
  try {
    console.log('GET /api/classes - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('GET /api/classes - Client created, calling getClasses...');
    const classes = await getClasses(client);
    console.log('GET /api/classes - Retrieved classes:', classes.map(c => ({ ...c, image: `base64(...${c.image.slice(-20)})` })));

    json(200, classes);
  } catch (error) {
    console.error('GET /api/classes error:', error);
    console.error('GET /api/classes error stack:', error.stack);
    json(500, { error: 'Failed to fetch classes', details: error.message });
  }
};

// POST /api/classes
export const onPost: RequestHandler = async ({ request, json, env }) => {
  console.log('POST /api/classes - Request received');
  try {
    const body = await request.json();
    console.log('POST /api/classes - Request body:', { ...body, image: `base64(...${body.image?.slice(-20)})` });
    const { name, description, url, image, isActive } = body;

    if (!name || !description || !url || !image || isActive === undefined) {
      console.log('POST /api/classes - Missing required fields:', { name, description, url, image, isActive });
      json(400, { error: 'Name, description, url, image, and isActive are required' });
      return;
    }

    if (!Number.isInteger(isActive) || isActive < 0 || isActive > 1) {
      console.log('POST /api/classes - Invalid isActive:', { isActive });
      json(400, { error: 'isActive must be 0 or 1' });
      return;
    }

    if (!image.startsWith('data:image/')) {
      console.log('POST /api/classes - Invalid image format:', { image: `base64(...${image.slice(-20)})` });
      json(400, { error: 'Image must be a valid base64-encoded image (data:image/*;base64,...)' });
      return;
    }

    console.log('POST /api/classes - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('POST /api/classes - Client created, calling createClass...');
    const id = await createClass(client, name, description, url, image, isActive);
    console.log('POST /api/classes - Class created with ID:', id);

    json(201, { id, name, description, url, image, isActive });
  } catch (error) {
    console.error('POST /api/classes error:', error);
    console.error('POST /api/classes error stack:', error.stack);
    json(500, { error: 'Failed to create class', details: error.message });
  }
};

// PUT /api/classes
export const onPut: RequestHandler = async ({ request, json, env }) => {
  console.log('PUT /api/classes - Request received');
  try {
    const body = await request.json();
    console.log('PUT /api/classes - Request body:', { ...body, image: `base64(...${body.image?.slice(-20)})` });
    const { id, name, description, url, image, isActive } = body;

    if (!id || !name || !description || !url || !image || isActive === undefined) {
      console.log('PUT /api/classes - Missing required fields:', { id, name, description, url, image, isActive });
      json(400, { error: 'ID, name, description, url, image, and isActive are required' });
      return;
    }

    if (!Number.isInteger(isActive) || isActive < 0 || isActive > 1) {
      console.log('PUT /api/classes - Invalid isActive:', { isActive });
      json(400, { error: 'isActive must be 0 or 1' });
      return;
    }

    if (!image.startsWith('data:image/')) {
      console.log('PUT /api/classes - Invalid image format:', { image: `base64(...${image.slice(-20)})` });
      json(400, { error: 'Image must be a valid base64-encoded image (data:image/*;base64,...)' });
      return;
    }

    console.log('PUT /api/classes - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('PUT /api/classes - Client created, calling updateClass...');
    await updateClass(client, id, name, description, url, image, isActive);
    console.log('PUT /api/classes - Class updated with ID:', id);

    json(200, { id, name, description, url, image, isActive });
  } catch (error) {
    console.error('PUT /api/classes error:', error);
    console.error('PUT /api/classes error stack:', error.stack);
    json(500, { error: 'Failed to update class', details: error.message });
  }
};

// DELETE /api/classes
export const onDelete: RequestHandler = async ({ request, json, env }) => {
  console.log('DELETE /api/classes - Request received');
  try {
    const body = await request.json();
    console.log('DELETE /api/classes - Request body:', body);
    const { id } = body;

    if (!id) {
      console.log('DELETE /api/classes - Missing ID:', { id });
      json(400, { error: 'ID is required' });
      return;
    }

    console.log('DELETE /api/classes - Creating Turso client...');
    const client = await tursoClient({ env });
    console.log('DELETE /api/classes - Client created, calling deleteClass...');
    await deleteClass(client, id);
    console.log('DELETE /api/classes - Class deleted with ID:', id);

    json(200, { success: true });
  } catch (error) {
    console.error('DELETE /api/classes error:', error);
    console.error('DELETE /api/classes error stack:', error.stack);
    json(500, { error: 'Failed to delete class', details: error.message });
  }
};
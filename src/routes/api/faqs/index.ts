// src/routes/api/faqs/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getFaqs, createFaq, updateFaq, deleteFaq } from '~/lib/turso';
import type { Session } from 'next-auth';

// Helper function to trigger webhook
const triggerWebhook = async (data: any, env: { get: (key: string) => string | undefined }) => {
  try {
    const webhookToken = env.get('WEBHOOK_TOKEN');
    if (!webhookToken) {
      console.error('Webhook token not configured');
      return;
    }
    await fetch('https://e9-eight.vercel.app/api/webhook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${webhookToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log('Webhook triggered successfully');
  } catch (e) {
    console.error('Webhook failed:', e);
  }
};

// ---- GET route (for fetching FAQs) ----
export const onGet: RequestHandler = async ({ json, sharedMap, env }) => {
  console.log('GET /api/faqs - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('GET /api/faqs - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('GET /api/faqs - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const client = await tursoClient({ env });
    const faqs = await getFaqs(client);
    console.log('GET /api/faqs - Retrieved faqs:', faqs);
    json(200, faqs);
  } catch (err) {
    const error = err as Error;
    console.error('GET /api/faqs error stack:', error.stack);
    json(500, { error: 'Failed to fetch faqs', details: error.message });
  }
};

// ---- POST route (create FAQ + trigger webhook) ----
export const onPost: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('POST /api/faqs - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('POST /api/faqs - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('POST /api/faqs - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    console.log('POST /api/faqs - Request body:', body);
    const { question, answer } = body;

    if (!question || !answer) {
      console.log('POST /api/faqs - Missing required fields:', { question, answer });
      json(400, { error: 'Question and answer are required' });
      return;
    }

    const client = await tursoClient({ env });
    const newId = await createFaq(client, question, answer);
    console.log('POST /api/faqs - FAQ created with ID:', newId);

    // Fire-and-forget webhook
    triggerWebhook({ id: newId, question, answer, action: 'create' }, env);

    json(201, { id: newId, question, answer });
  } catch (err) {
    const error = err as Error;
    console.error('POST /api/faqs error stack:', error.stack);
    json(500, { error: 'Failed to create FAQ', details: error.message });
  }
};

// ---- PUT route (update FAQ + webhook) ----
export const onPut: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('PUT /api/faqs - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('PUT /api/faqs - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('PUT /api/faqs - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    console.log('PUT /api/faqs - Request body:', body);
    const { id, question, answer } = body;

    if (!id || !question || !answer) {
      console.log('PUT /api/faqs - Missing required fields:', { id, question, answer });
      json(400, { error: 'ID, question, and answer are required' });
      return;
    }

    const client = await tursoClient({ env });
    await updateFaq(client, id, question, answer);
    console.log('PUT /api/faqs - FAQ updated with ID:', id);

    // Fire-and-forget webhook
    triggerWebhook({ id, question, answer, action: 'update' }, env);

    json(200, { id, question, answer });
  } catch (err) {
    const error = err as Error;
    console.error('PUT /api/faqs error stack:', error.stack);
    json(500, { error: 'Failed to update FAQ', details: error.message });
  }
};

// ---- DELETE route (delete FAQ + webhook) ----
export const onDelete: RequestHandler = async ({ request, json, sharedMap, env }) => {
  console.log('DELETE /api/faqs - Request received');
  const session = sharedMap.get('session') as Session | null;
  console.log('DELETE /api/faqs - session:', session); // Debug log
  if (!session || !session.user) {
    console.log('DELETE /api/faqs - Unauthorized access');
    throw new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      console.log('DELETE /api/faqs - Missing ID');
      json(400, { error: 'ID is required' });
      return;
    }

    const client = await tursoClient({ env });
    await deleteFaq(client, id);
    console.log('DELETE /api/faqs - FAQ deleted with ID:', id);

    // Fire-and-forget webhook
    triggerWebhook({ id, action: 'delete' }, env);

    json(200, { message: 'FAQ deleted' });
  } catch (err) {
    const error = err as Error;
    console.error('DELETE /api/faqs error stack:', error.stack);
    json(500, { error: 'Failed to delete FAQ', details: error.message });
  }
};
// src/routes/api/faqs/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';
import { tursoClient, getFaqs, createFaq, updateFaq, deleteFaq, type Faq } from '~/lib/turso';

// Helper function to trigger webhook
const triggerWebhook = async (data: any) => {
  try {
    await fetch('https://e9-eight.vercel.app/api/webhook', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer 3f9b8d2e-7c1a-4f5b-a1d0-9e6f2c7b8a4d',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data),
    });
    console.log('Webhook triggered successfully');
  } catch (e) {
    console.error('Webhook failed:', e);
  }
};

// ---- GET route (for fetching FAQs) ----
export const onGet: RequestHandler = async (event) => {
  try {
    const client = tursoClient(event);
    const faqs = await getFaqs(await client);
    return Response.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    return Response.json([]);
  }
};

// ---- POST route (create FAQ + trigger webhook) ----
export const onPost: RequestHandler = async (event) => {
  try {
    const client = tursoClient(event);
    const body = await event.request.json();
    const { question, answer } = body;

    if (!question || !answer) return;

    const newId = await createFaq(await client, question, answer);

    // Fire-and-forget webhook
    triggerWebhook({ 
      id: newId, 
      question, 
      answer, 
      action: 'create' 
    });

  } catch (err) {
    console.error('Error creating FAQ:', err);
  }
};

// ---- PUT route (update FAQ + webhook) ----
export const onPut: RequestHandler = async (event) => {
  try {
    const client = tursoClient(event);
    const body = await event.request.json();
    const { id, question, answer } = body;

    if (!id || !question || !answer) return;

    await updateFaq(await client, id, question, answer);

    // Fire-and-forget webhook
    triggerWebhook({ 
      id, 
      question, 
      answer, 
      action: 'update' 
    });

  } catch (err) {
    console.error('Error updating FAQ:', err);
  }
};

// ---- DELETE route (delete FAQ + webhook) ----
export const onDelete: RequestHandler = async (event) => {
  try {
    const client = tursoClient(event);
    const body = await event.request.json();
    const { id } = body;

    if (!id) return;

    await deleteFaq(await client, id);

    // Fire-and-forget webhook
    triggerWebhook({ 
      id, 
      action: 'delete' 
    });

  } catch (err) {
    console.error('Error deleting FAQ:', err);
  }
};
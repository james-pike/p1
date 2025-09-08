// src/routes/api/triggerWebhook.ts
import { server$ } from '@builder.io/qwik-city';

export const triggerVercelWebhook = server$(async () => {
  const webhookUrl = process.env.VERCEL_WEBHOOK_URL;
  const token = process.env.VERCEL_WEBHOOK_TOKEN;
  if (!webhookUrl || !token) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source: 'faq-crud' }),
  });
});

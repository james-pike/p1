// src/lib/turso.ts
import { createClient, type Client } from '@libsql/client';
import type { RequestEventBase } from '@builder.io/qwik-city';

export interface Faq {
  id?: number;
  question: string;
  answer: string;
  isHtml?: boolean;
}

interface EnvGetter {
  get: (key: string) => string | undefined;
}

// Create Turso client
export function tursoClient(event: RequestEventBase | { env: EnvGetter }): Client {
  const env = 'env' in event ? event.env : event;
  const url = env.get('PRIVATE_TURSO_DATABASE_URL')?.trim();
  const authToken = env.get('PRIVATE_TURSO_AUTH_TOKEN')?.trim();

  if (!url) throw new Error('PRIVATE_TURSO_DATABASE_URL is not defined');
  if (!authToken && !url.includes('file:')) throw new Error('PRIVATE_TURSO_AUTH_TOKEN is not defined');

  return createClient({ url, authToken });
}

// CRUD functions
export async function getFaqs(client: Client): Promise<Faq[]> {
  const res = await client.execute('SELECT * FROM faqs ORDER BY id ASC');
  return res.rows.map((r: any) => ({
    id: Number(r.id),
    question: String(r.question),
    answer: String(r.answer),
    isHtml: String(r.answer).includes('<'),
  }));
}

export async function createFaq(client: Client, question: string, answer: string): Promise<number> {
  const res = await client.execute({
    sql: 'INSERT INTO faqs (question, answer) VALUES (?, ?)',
    args: [question, answer],
  });
  return res.lastInsertRowid as unknown as number;
}

export async function updateFaq(client: Client, id: number, question: string, answer: string): Promise<void> {
  await client.execute({
    sql: 'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
    args: [question, answer, id],
  });
}

export async function deleteFaq(client: Client, id: number): Promise<void> {
  await client.execute({
    sql: 'DELETE FROM faqs WHERE id = ?',
    args: [id],
  });
}
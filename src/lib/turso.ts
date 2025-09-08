// src/lib/turso.ts
import type { RequestEventBase } from '@builder.io/qwik-city';

// Dynamic import — server-only
let _libsql: typeof import('@libsql/client') | undefined;

async function loadLibSQL() {
  if (!_libsql) {
    _libsql = await import('@libsql/client');
  }
  return _libsql;
}

export interface Faq {
  id?: number;
  question: string;
  answer: string;
  isHtml?: boolean;
}

export interface Review {
  id?: number;
  name: string;
  review_text: string;
  rating: number;
  date: string;
  role: string;
}

interface EnvGetter {
  get: (key: string) => string | undefined;
}

// Create Turso client (server-only)
export async function tursoClient(event: RequestEventBase | { env: EnvGetter }) {
  const { createClient } = await loadLibSQL();

  const env = 'env' in event ? event.env : event;
  const url = env.get('PRIVATE_TURSO_DATABASE_URL')?.trim();
  const authToken = env.get('PRIVATE_TURSO_AUTH_TOKEN')?.trim();

  if (!url) throw new Error('PRIVATE_TURSO_DATABASE_URL is not defined');
  if (!authToken && !url.includes('file:')) throw new Error('PRIVATE_TURSO_AUTH_TOKEN is not defined');

  // TypeScript automatically infers the return type of createClient
  return createClient({ url, authToken });
}

// FAQ CRUD functions
export async function getFaqs(client: Awaited<ReturnType<typeof tursoClient>>) {
  const res = await client.execute('SELECT * FROM faqs ORDER BY id ASC');
  return res.rows.map((r: any) => ({
    id: Number(r.id),
    question: String(r.question),
    answer: String(r.answer),
    isHtml: String(r.answer).includes('<'),
  }));
}

export async function createFaq(
  client: Awaited<ReturnType<typeof tursoClient>>,
  question: string,
  answer: string
): Promise<number> {
  const res = await client.execute({
    sql: 'INSERT INTO faqs (question, answer) VALUES (?, ?)',
    args: [question, answer],
  });

  if (res.lastInsertRowid === undefined) {
    throw new Error('Failed to get last insert row ID');
  }

  // Convert bigint to number safely
  const rowIdNum = Number(res.lastInsertRowid);
  if (!Number.isSafeInteger(rowIdNum)) {
    throw new Error('lastInsertRowid is too large to convert safely to number');
  }

  return rowIdNum;
}

export async function updateFaq(client: Awaited<ReturnType<typeof tursoClient>>, id: number, question: string, answer: string) {
  await client.execute({
    sql: 'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
    args: [question, answer, id],
  });
}

export async function deleteFaq(client: Awaited<ReturnType<typeof tursoClient>>, id: number) {
  await client.execute({
    sql: 'DELETE FROM faqs WHERE id = ?',
    args: [id],
  });
}

// Review CRUD functions
export async function getReviews(client: Awaited<ReturnType<typeof tursoClient>>) {
  const res = await client.execute('SELECT * FROM reviews ORDER BY id ASC');
  return res.rows.map((r: any) => ({
    id: Number(r.id),
    name: String(r.name),
    review_text: String(r.review_text),
    rating: Number(r.rating),
    date: String(r.date),
    role: String(r.role),
  }));
}

export async function createReview(
  client: Awaited<ReturnType<typeof tursoClient>>,
  name: string,
  review_text: string,
  rating: number,
  date: string,
  role: string
): Promise<number> {
  const res = await client.execute({
    sql: 'INSERT INTO reviews (name, review_text, rating, date, role) VALUES (?, ?, ?, ?, ?)',
    args: [name, review_text, rating, date, role],
  });

  if (res.lastInsertRowid === undefined) {
    throw new Error('Failed to get last insert row ID');
  }

  const rowIdNum = Number(res.lastInsertRowid);
  if (!Number.isSafeInteger(rowIdNum)) {
    throw new Error('lastInsertRowid is too large to convert safely to number');
  }

  return rowIdNum;
}

export async function updateReview(
  client: Awaited<ReturnType<typeof tursoClient>>,
  id: number,
  name: string,
  review_text: string,
  rating: number,
  date: string,
  role: string
) {
  await client.execute({
    sql: 'UPDATE reviews SET name = ?, review_text = ?, rating = ?, date = ?, role = ? WHERE id = ?',
    args: [name, review_text, rating, date, role, id],
  });
}

export async function deleteReview(client: Awaited<ReturnType<typeof tursoClient>>, id: number) {
  await client.execute({
    sql: 'DELETE FROM reviews WHERE id = ?',
    args: [id],
  });
}
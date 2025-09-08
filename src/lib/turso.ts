// src/lib/turso.ts
import type { RequestEventBase } from '@builder.io/qwik-city';
import type { Client } from '@libsql/client';

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

export interface Banner {
  id?: number;
  title: string;
  subtitle: string;
  message: string;
  isHtml?: boolean;
}

export interface Review {
  id?: number;
  name: string;
  review: string; // Simplified to string, as database uses TEXT and Qwik can render strings
  rating: number;
  date: string;
  role: string;
}

interface EnvGetter {
  get: (key: string) => string | undefined;
}

// Create Turso client (server-only)
export async function tursoClient(event: RequestEventBase | { env: EnvGetter }): Promise<Client> {
  const { createClient } = await loadLibSQL();
  const env = 'env' in event ? event.env : event;
  const url = env.get('PRIVATE_TURSO_DATABASE_URL')?.trim();
  const authToken = env.get('PRIVATE_TURSO_AUTH_TOKEN')?.trim();

  if (!url) throw new Error('PRIVATE_TURSO_DATABASE_URL is not defined');
  if (!authToken && !url.includes('file:')) throw new Error('PRIVATE_TURSO_AUTH_TOKEN is not defined');

  const client = createClient({ url, authToken });
  await initializeDatabase(client); // Initialize tables
  return client;
}

// Initialize database tables
async function initializeDatabase(client: Client) {
  try {
    // Create faqs table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      )
    `);

    // Create banners table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        message TEXT NOT NULL
      )
    `);

    // Create reviews table with 'review' column
    await client.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        review TEXT NOT NULL,
        rating INTEGER NOT NULL,
        date TEXT NOT NULL,
        role TEXT NOT NULL
      )
    `);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

// FAQ CRUD functions
export async function getFaqs(client: Client): Promise<Faq[]> {
  try {
    const res = await client.execute('SELECT * FROM faqs ORDER BY id ASC');
    return res.rows.map((r: any) => ({
      id: Number(r.id),
      question: String(r.question ?? ''),
      answer: String(r.answer ?? ''),
      isHtml: String(r.answer ?? '').includes('<'),
    }));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw new Error(`Failed to fetch FAQs: ${error}`);
  }
}

export async function createFaq(client: Client, question: string, answer: string): Promise<number> {
  if (!question || !answer) throw new Error('Question and answer must not be empty');
  try {
    const res = await client.execute({
      sql: 'INSERT INTO faqs (question, answer) VALUES (?, ?)',
      args: [question, answer],
    });
    if (res.lastInsertRowid === undefined) throw new Error('Failed to get last insert row ID');
    const rowIdNum = Number(res.lastInsertRowid);
    if (!Number.isSafeInteger(rowIdNum)) throw new Error('lastInsertRowid is too large to convert safely to number');
    console.log(`Created FAQ with ID: ${rowIdNum}`);
    return rowIdNum;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw new Error(`Failed to create FAQ: ${error}`);
  }
}

export async function updateFaq(client: Client, id: number, question: string, answer: string) {
  if (!question || !answer) throw new Error('Question and answer must not be empty');
  try {
    const res = await client.execute({
      sql: 'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
      args: [question, answer, id],
    });
    if (res.rowsAffected === 0) throw new Error(`No FAQ found with ID: ${id}`);
    console.log(`Updated FAQ with ID: ${id}`);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw new Error(`Failed to update FAQ: ${error}`);
  }
}

export async function deleteFaq(client: Client, id: number) {
  try {
    const res = await client.execute({
      sql: 'DELETE FROM faqs WHERE id = ?',
      args: [id],
    });
    if (res.rowsAffected === 0) throw new Error(`No FAQ found with ID: ${id}`);
    console.log(`Deleted FAQ with ID: ${id}`);
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw new Error(`Failed to delete FAQ: ${error}`);
  }
}

// Banner CRUD functions
export async function getBanners(client: Client): Promise<Banner[]> {
  try {
    const res = await client.execute('SELECT * FROM banners ORDER BY id ASC');
    return res.rows.map((r: any) => ({
      id: Number(r.id),
      title: String(r.title ?? ''),
      subtitle: String(r.subtitle ?? ''),
      message: String(r.message ?? ''),
      isHtml: [r.title, r.subtitle, r.message].some(field => String(field ?? '').includes('<')),
    }));
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw new Error(`Failed to fetch banners: ${error}`);
  }
}

export async function createBanner(client: Client, title: string, subtitle: string, message: string): Promise<number> {
  if (!title || !subtitle || !message) throw new Error('Title, subtitle, and message must not be empty');
  try {
    const res = await client.execute({
      sql: 'INSERT INTO banners (title, subtitle, message) VALUES (?, ?, ?)',
      args: [title, subtitle, message],
    });
    if (res.lastInsertRowid === undefined) throw new Error('Failed to get last insert row ID');
    const rowIdNum = Number(res.lastInsertRowid);
    if (!Number.isSafeInteger(rowIdNum)) throw new Error('lastInsertRowid is too large to convert safely to number');
    console.log(`Created banner with ID: ${rowIdNum}`);
    return rowIdNum;
  } catch (error) {
    console.error('Error creating banner:', error);
    throw new Error(`Failed to create banner: ${error}`);
  }
}

export async function updateBanner(client: Client, id: number, title: string, subtitle: string, message: string) {
  if (!title || !subtitle || !message) throw new Error('Title, subtitle, and message must not be empty');
  try {
    const res = await client.execute({
      sql: 'UPDATE banners SET title = ?, subtitle = ?, message = ? WHERE id = ?',
      args: [title, subtitle, message, id],
    });
    if (res.rowsAffected === 0) throw new Error(`No banner found with ID: ${id}`);
    console.log(`Updated banner with ID: ${id}`);
  } catch (error) {
    console.error('Error updating banner:', error);
    throw new Error(`Failed to update banner: ${error}`);
  }
}

export async function deleteBanner(client: Client, id: number) {
  try {
    const res = await client.execute({
      sql: 'DELETE FROM banners WHERE id = ?',
      args: [id],
    });
    if (res.rowsAffected === 0) throw new Error(`No banner found with ID: ${id}`);
    console.log(`Deleted banner with ID: ${id}`);
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw new Error(`Failed to delete banner: ${error}`);
  }
}

// Review CRUD functions
export async function getReviews(client: Client): Promise<Review[]> {
  try {
    const res = await client.execute('SELECT * FROM reviews ORDER BY id ASC');
    const reviews = res.rows.map((r: any) => {
      const review = String(r.review ?? '');
      console.log(`Fetched review ID ${r.id}: review = ${review}`); // Debug log
      return {
        id: Number(r.id),
        name: String(r.name ?? ''),
        review,
        rating: Number(r.rating ?? 0),
        date: String(r.date ?? ''),
        role: String(r.role ?? ''),
      };
    });
    console.log(`Fetched ${reviews.length} reviews`);
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw new Error(`Failed to fetch reviews: ${error}`);
  }
}

export async function createReview(
  client: Client,
  name: string,
  review: string,
  rating: number,
  date: string,
  role: string
): Promise<number> {
  if (!name || !review || !date || !role) throw new Error('All review fields must not be empty');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Rating must be an integer between 1 and 5');
  try {
    console.log(`Creating review with review: ${review}`); // Debug log
    const res = await client.execute({
      sql: 'INSERT INTO reviews (name, review, rating, date, role) VALUES (?, ?, ?, ?, ?)',
      args: [name, review, rating, date, role],
    });
    if (res.lastInsertRowid === undefined) throw new Error('Failed to get last insert row ID');
    const rowIdNum = Number(res.lastInsertRowid);
    if (!Number.isSafeInteger(rowIdNum)) throw new Error('lastInsertRowid is too large to convert safely to number');
    console.log(`Created review with ID: ${rowIdNum}`);
    return rowIdNum;
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error(`Failed to create review: ${error}`);
  }
}

export async function updateReview(
  client: Client,
  id: number,
  name: string,
  review: string,
  rating: number,
  date: string,
  role: string
): Promise<void> {
  if (!id || !Number.isInteger(id)) throw new Error('Invalid review ID');
  if (!name || !review || !date || !role) throw new Error('All review fields must not be empty');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Rating must be an integer between 1 and 5');
  try {
    console.log(`Attempting to update review ID ${id} with:`, { name, review, rating, date, role }); // Detailed debug log
    await client.execute('BEGIN TRANSACTION');
    const res = await client.execute({
      sql: 'UPDATE reviews SET name = ?, review = ?, rating = ?, date = ?, role = ? WHERE id = ?',
      args: [name, review, rating, date, role, id],
    });
    if (res.rowsAffected === 0) {
      console.warn(`No review found with ID: ${id}`);
      throw new Error(`No review found with ID: ${id}`);
    }
    await client.execute('COMMIT');
    console.log(`Successfully updated review with ID: ${id}`);
    // Verify update by fetching the updated review
    const verify = await client.execute({
      sql: 'SELECT * FROM reviews WHERE id = ?',
      args: [id],
    });
    if (verify.rows.length > 0) {
      console.log(`Verified updated review ID ${id}:`, verify.rows[0]);
    } else {
      console.warn(`Verification failed: No review found after update for ID: ${id}`);
    }
  } catch (error) {
    await client.execute('ROLLBACK');
    console.error('Error updating review:', error);
    throw new Error(`Failed to update review: ${error}`);
  }
}

export async function deleteReview(client: Client, id: number) {
  try {
    const res = await client.execute({
      sql: 'DELETE FROM reviews WHERE id = ?',
      args: [id],
    });
    if (res.rowsAffected === 0) throw new Error(`No review found with ID: ${id}`);
    console.log(`Deleted review with ID: ${id}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error(`Failed to delete review: ${error}`);
  }
}
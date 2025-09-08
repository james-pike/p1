// src/lib/image-handler.ts
import { turso } from './turso';

export async function storeImage(
  itemId: number, 
  imageBuffer: Buffer, 
  mimeType: string = 'image/jpeg',
  altText?: string
) {
  const result = await turso.execute({
    sql: `INSERT INTO images (item_id, image_data, mime_type, alt_text) 
          VALUES (?, ?, ?, ?)`,
    args: [itemId, imageBuffer, mimeType, altText || '']
  });
  return result;
}

export async function getItemWithImages(itemId: number) {
  const item = await turso.execute({
    sql: 'SELECT * FROM items WHERE id = ?',
    args: [itemId]
  });
  
  const images = await turso.execute({
    sql: 'SELECT * FROM images WHERE item_id = ? ORDER BY display_order',
    args: [itemId]
  });
  
  // Convert BLOB to base64 for display
  const processedImages = images.rows.map(img => ({
    ...img,
    base64: Buffer.from(img.image_data as Uint8Array).toString('base64')
  }));
  
  return {
    item: item.rows[0],
    images: processedImages
  };
}
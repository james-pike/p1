import { createClient } from '@libsql/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '..', '.env') });

// Get environment variables
const databaseUrl = process.env.PRIVATE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.PRIVATE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  console.error('❌ Missing database credentials. Please set PRIVATE_TURSO_DATABASE_URL and PRIVATE_TURSO_AUTH_TOKEN');
  console.error('   Make sure your .env file exists and contains these variables.');
  process.exit(1);
}

console.log('🔄 Connecting to Turso database...');
const turso = createClient({
  url: databaseUrl,
  authToken: authToken,
});

async function extractImages() {
  try {
    // Create public/images directory if it doesn't exist
    const publicDir = join(__dirname, '..', 'public', 'images');
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
      console.log('📁 Created public/images directory');
    }

    // Query all images from database
    console.log('🔍 Fetching images from database...');
    const result = await turso.execute(`
      SELECT 
        i.id,
        i.title,
        img.image_data,
        img.mime_type,
        img.alt_text
      FROM items i
      INNER JOIN images img ON i.id = img.item_id
      WHERE img.image_data IS NOT NULL
    `);

    console.log(`📊 Found ${result.rows.length} images to extract`);

    if (result.rows.length === 0) {
      console.log('ℹ️  No images found in database');
      return;
    }

    // Extract each image
    for (const row of result.rows) {
      const itemId = row.id;
      const imageData = row.image_data;
      const mimeType = row.mime_type || 'image/jpeg';
      const title = row.title || `image-${itemId}`;
      
      // Determine file extension from mime type
      let extension = 'jpg';
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('gif')) extension = 'gif';
      else if (mimeType.includes('webp')) extension = 'webp';
      else if (mimeType.includes('svg')) extension = 'svg';
      
      // Create filename (sanitize title for filesystem)
      const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const filename = `${sanitizedTitle}-${itemId}.${extension}`;
      const filepath = join(publicDir, filename);
      
      try {
        // Convert Uint8Array to Buffer and write to file
        const buffer = Buffer.from(imageData);
        writeFileSync(filepath, buffer);
        
        console.log(`✅ Extracted: ${filename} (${buffer.length} bytes)`);
      } catch (error) {
        console.error(`❌ Failed to extract image ${itemId}:`, error.message);
      }
    }

    console.log(`🎉 Successfully extracted ${result.rows.length} images to public/images/`);
    
    // Generate a manifest file for easy reference
    const manifest = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      filename: `${(row.title || `image-${row.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${row.id}.${row.mime_type?.includes('png') ? 'png' : row.mime_type?.includes('gif') ? 'gif' : row.mime_type?.includes('webp') ? 'webp' : row.mime_type?.includes('svg') ? 'svg' : 'jpg'}`,
      mimeType: row.mime_type,
      altText: row.alt_text
    }));
    
    writeFileSync(
      join(publicDir, 'manifest.json'), 
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('📋 Generated manifest.json with image metadata');
    
  } catch (error) {
    console.error('❌ Error extracting images:', error);
    process.exit(1);
  }
}

// Run the extraction
extractImages();

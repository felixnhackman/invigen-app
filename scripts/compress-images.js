/**
 * Compress large images in src/assets and public to reduce memory use on mobile (fewer Android crashes).
 * Run: npm run compress-images
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Limit dimensions to cut decode memory on mobile (reduces Android OOM crashes)
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 80;
const PNG_COMPRESSION = 9;
const MIN_SIZE_KB = 80;          // Only compress files larger than this (KB)

const dirs = [
  path.join(root, 'src', 'assets'),
  path.join(root, 'public'),
];

const exts = ['.png', '.jpg', '.jpeg', '.webp'];

function getAllImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) continue;
    if (exts.includes(path.extname(f.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function compressFile(filePath) {
  const stat = fs.statSync(filePath);
  const sizeKb = stat.size / 1024;
  if (sizeKb < MIN_SIZE_KB) return { filePath, skipped: true, reason: 'small' };

  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  // Allow very large images (we resize down); avoids "Input image exceeds pixel limit"
  let pipeline = sharp(buffer, { limitInputPixels: false });

  const meta = await pipeline.metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;
  if (w > MAX_WIDTH || h > MAX_HEIGHT) {
    pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION, adaptiveFiltering: true });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 82 });
  } else {
    return { filePath, skipped: true, reason: 'format' };
  }

  const out = await pipeline.toBuffer();
  const newKb = (out.length / 1024).toFixed(1);
  fs.writeFileSync(filePath, out);
  const saved = ((1 - out.length / stat.size) * 100).toFixed(0);
  return { filePath: path.relative(root, filePath), sizeKb: newKb, saved: saved + '%' };
}

async function main() {
  const all = dirs.flatMap(getAllImages);
  console.log(`Found ${all.length} images. Compressing files > ${MIN_SIZE_KB} KB (max width ${MAX_WIDTH}px)...\n`);

  for (const fp of all) {
    try {
      const r = await compressFile(fp);
      if (r.skipped) {
        console.log(`  skip ${path.relative(root, fp)} (${r.reason})`);
      } else {
        console.log(`  ok   ${r.filePath} → ${r.sizeKb} KB (saved ${r.saved})`);
      }
    } catch (err) {
      console.error(`  err  ${path.relative(root, fp)}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main();

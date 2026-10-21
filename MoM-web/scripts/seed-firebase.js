/**
 * Seed script for Firebase Realtime Database.
 * Populates specku_galeria (Spanish constitutional schema per Constitution Brendup Art. 22)
 * and Specku_Gallery (legacy compatibility) with binary image data (Base64 data URLs).
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const secret = process.env.FIREBASE_DB_SECRET;
if (!secret) {
  console.log('ℹ️ No FIREBASE_DB_SECRET provided; skipping Firebase gallery sync.');
  process.exit(0);
}

const mediaDir = path.join(__dirname, '..', 'site-public', 'lumivox-media');
const itemsConfig = [
  {
    id: 1,
    key: 'anima',
    titulo: 'Anima',
    fileName: 'joph-anima.webp',
    alt: 'Specku - Anima style artwork',
    categoria: 'Illustration',
    orden: 1,
  },
  {
    id: 2,
    key: 'semi-real',
    titulo: 'Semi-Real',
    fileName: 'joph-semi-real.webp',
    alt: 'Specku - Semi-Real style artwork',
    categoria: 'Illustration',
    orden: 2,
  },
  {
    id: 3,
    key: 'cutsey',
    titulo: 'Cutsey',
    fileName: 'joph-cutsey.webp',
    alt: 'Specku - Cutsey style artwork',
    categoria: 'Style Sample',
    orden: 3,
  },
  {
    id: 4,
    key: 'chibi',
    titulo: 'Chibi+',
    fileName: 'joph-chibi.webp',
    alt: 'Specku - Chibi+ style artwork',
    categoria: 'Style Sample',
    orden: 4,
  },
  {
    id: 5,
    key: 'dull-eyes',
    titulo: 'Dull-Eyes',
    fileName: 'joph-dull-eyes.webp',
    alt: 'Specku - Dull-Eyes style artwork',
    categoria: 'Style Sample',
    orden: 5,
  },
  {
    id: 6,
    key: 'noodle',
    titulo: 'Noodle',
    fileName: 'joph-noodle.webp',
    alt: 'Specku - Noodle style artwork',
    categoria: 'Style Sample',
    orden: 6,
  },
];

const speckuGaleria = {};
const speckuGalleryLegacy = {};

itemsConfig.forEach((item) => {
  const filePath = path.join(mediaDir, item.fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const binaryData = `data:image/webp;base64,${fileBuffer.toString('base64')}`;

  // Schema: objeto_contenido (specku_galeria) & tabla_propiedad per Constitution Brendup Art. 22
  speckuGaleria[item.key] = {
    specku_galeria_id: item.id,
    specku_galeria_key: item.key,
    specku_galeria_titulo: item.titulo,
    specku_galeria_binario: binaryData,
    specku_galeria_texto_alt: item.alt,
    specku_galeria_categoria: item.categoria,
    specku_galeria_orden: item.orden,
    specku_galeria_activo: true,
    specku_galeria_borrado: false,
  };

  // Legacy compatibility mirror with binary src
  speckuGalleryLegacy[item.key] = {
    id: item.key,
    title: item.titulo,
    src: binaryData,
    alt: item.alt,
    category: item.categoria,
    order: item.orden,
  };
});

if (Object.keys(speckuGaleria).length === 0) {
  console.log('ℹ️ No local image files to upload; Firebase RTDB already maintains persistent cloud binary data.');
  process.exit(0);
}

function putNode(nodePath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const url = new URL(
      `https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/${nodePath}.json?auth=${encodeURIComponent(secret)}`
    );

    const req = https.request(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Node [${nodePath}] successfully synced (${Buffer.byteLength(payload)} bytes).`);
            resolve();
          } else {
            console.error(`⚠️ Node [${nodePath}] responded with status ${res.statusCode}:`, body);
            reject(new Error(`Status ${res.statusCode}: ${body}`));
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error(`❌ Request error on [${nodePath}]:`, err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Firebase Realtime Database sync with binary image payloads...');
  try {
    // 1. Sync Spanish constitutional schema: specku_galeria
    await putNode('specku_galeria', speckuGaleria);
    // 2. Sync legacy compatibility schema: Specku_Gallery with binary src
    await putNode('Specku_Gallery', speckuGalleryLegacy);
    console.log('🎉 Firebase RTDB binary image sync completed successfully!');
  } catch (err) {
    console.error('❌ Failed to sync to Firebase:', err.message);
    process.exit(1);
  }
}

main();

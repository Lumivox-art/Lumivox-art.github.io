const https = require('https');
const fs = require('fs');
const path = require('path');

const secret = process.env.FIREBASE_DB_SECRET;
if (!secret) {
  console.log('ℹ️ No FIREBASE_DB_SECRET provided; skipping Firebase gallery sync.');
  process.exit(0);
}

const seedPath = path.join(__dirname, '..', 'specku_gallery_seed.json');
if (!fs.existsSync(seedPath)) {
  console.error('❌ specku_gallery_seed.json not found');
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const payload = JSON.stringify(seedData.Specku_Gallery);

const url = new URL(
  `https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/Specku_Gallery.json?auth=${encodeURIComponent(secret)}`
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
        console.log('✅ Specku_Gallery successfully synced to Firebase Realtime Database');
      } else {
        console.error(`⚠️ Firebase sync responded with status ${res.statusCode}:`, body);
      }
    });
  }
);

req.on('error', (err) => {
  console.error('❌ Error syncing to Firebase:', err);
});

req.write(payload);
req.end();

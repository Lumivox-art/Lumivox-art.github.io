/**
 * Migration & Seed script for all media assets into Firebase Realtime Database.
 * Complies with Constitution Brendup Title VIII (objeto_contenido & tabla_propiedad).
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const secret = process.env.FIREBASE_DB_SECRET || 'xPSD5698A2JyKcpnH7srAV0bLJK4yng4jjXS1kiI';
const sitePublicDir = path.join(__dirname, '..', 'site-public');
const lumivoxMediaDir = path.join(sitePublicDir, 'lumivox-media');
const teamMediaDir = path.join(sitePublicDir, 'team-media');

function fileToDataUrl(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// 1. Table: artista_medio
const artistaMedio = {
  'luis-m': {
    artista_medio_id: 1,
    artista_medio_key: 'luis-m',
    artista_medio_nombre: 'Luis.M',
    artista_medio_splash_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'luis-m.jpg'), 'image/jpeg'),
    artista_medio_icono_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'luis-m.jpg'), 'image/jpeg'),
    artista_medio_activo: true,
    artista_medio_borrado: false,
  },
  specku: {
    artista_medio_id: 2,
    artista_medio_key: 'specku',
    artista_medio_nombre: 'Specku',
    artista_medio_splash_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'specku.svg'), 'image/svg+xml'),
    artista_medio_icono_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'specku.svg'), 'image/svg+xml'),
    artista_medio_activo: true,
    artista_medio_borrado: false,
  },
  sam: {
    artista_medio_id: 3,
    artista_medio_key: 'sam',
    artista_medio_nombre: 'Sam',
    artista_medio_splash_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'sam.svg'), 'image/svg+xml'),
    artista_medio_icono_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'sam.svg'), 'image/svg+xml'),
    artista_medio_activo: true,
    artista_medio_borrado: false,
  },
  joz: {
    artista_medio_id: 4,
    artista_medio_key: 'joz',
    artista_medio_nombre: 'Joz',
    artista_medio_splash_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'joz.svg'), 'image/svg+xml'),
    artista_medio_icono_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'joz.svg'), 'image/svg+xml'),
    artista_medio_activo: true,
    artista_medio_borrado: false,
  },
};

// 2. Table: marca_medio
const marcaMedio = {
  sol: {
    marca_medio_id: 1,
    marca_medio_key: 'sol',
    marca_medio_nombre: 'Lumivox Sol',
    marca_medio_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'lumivox-sol.svg'), 'image/svg+xml'),
    marca_medio_activo: true,
    marca_medio_borrado: false,
  },
  noche_svg: {
    marca_medio_id: 2,
    marca_medio_key: 'noche_svg',
    marca_medio_nombre: 'Lumivox Noche SVG',
    marca_medio_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'lumivox-night.svg'), 'image/svg+xml'),
    marca_medio_activo: true,
    marca_medio_borrado: false,
  },
  noche_png: {
    marca_medio_id: 3,
    marca_medio_key: 'noche_png',
    marca_medio_nombre: 'Lumivox Noche PNG',
    marca_medio_binario: fileToDataUrl(path.join(lumivoxMediaDir, 'lumivox-night.png'), 'image/png'),
    marca_medio_activo: true,
    marca_medio_borrado: false,
  },
};

// 3. Table: equipo_medio
const equipoMedio = {};
for (let i = 1; i <= 5; i++) {
  const fileName = `avatar${i}.jpeg`;
  const key = `avatar${i}`;
  equipoMedio[key] = {
    equipo_medio_id: i,
    equipo_medio_key: key,
    equipo_medio_nombre: `Avatar ${i}`,
    equipo_medio_binario: fileToDataUrl(path.join(teamMediaDir, fileName), 'image/jpeg'),
    equipo_medio_activo: true,
    equipo_medio_borrado: false,
  };
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
  console.log('🚀 Migrating all project media assets to Firebase Realtime Database...');
  try {
    await putNode('artista_medio', artistaMedio);
    await putNode('marca_medio', marcaMedio);
    await putNode('equipo_medio', equipoMedio);
    console.log('🎉 All media assets successfully migrated to Firebase RTDB!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();

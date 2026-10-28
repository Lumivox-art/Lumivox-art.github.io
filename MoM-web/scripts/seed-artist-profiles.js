/**
 * Seeds initial artist profile records into Firebase Realtime Database (/artistas_perfiles).
 */
const https = require('https');

const secret = process.env.FIREBASE_DB_SECRET || 'xPSD5698A2JyKcpnH7srAV0bLJK4yng4jjXS1kiI';

const initialProfiles = {
  specku: {
    handle: 'specku',
    displayName: 'Specku',
    tagline: 'Todo gran universo comienza con un solo concepto.',
    discipline: 'Ilustrador · Narrador visual',
    bio: '¡Hola! Soy Specku, ilustrador y narrador al que le apasiona extraer ideas de la imaginación y convertirlas en obras visuales cautivadoras.',
    brief:
      'Me enorgullece crear arte accesible, diverso y de calidad que da vida a las ideas de las personas, manteniendo a mis clientes cómodos y con una comunicación fluida. ¡No dudes en enviar un mensaje y comencemos a crear!',
    accentColor: '#8D3E2E',
    socials: [
      {
        platform: 'discord',
        url: 'https://discord.com/users/984706414914187284',
        label: 'Discord: @specku',
      },
    ],
    updatedAt: Date.now(),
  },
  'luis-m': {
    handle: 'luis-m',
    displayName: 'Nix',
    tagline: '¿Te gusta esta página?',
    discipline: 'Ingeniero de Software · Soluciones digitales',
    bio: 'Hola, soy Nix y he diseñado esta página para ayudar a mis compañeros artistas a tener un espacio único para sus necesidades comerciales.',
    brief:
      'Estamos en un tiempo donde la facilidad que trae la digitalización a la propagación de una marca digital es bastante evidente. Si estás buscando impulsar tu marca mediante soluciones digitales, ¡puedes contactarme!',
    accentColor: '#3B5673',
    socials: [
      {
        platform: 'discord',
        url: 'https://discord.com/users/322903795908739074',
        label: 'Discord: 322903795908739074',
      },
      {
        platform: 'github',
        url: 'https://github.com/LuisMiguelMedina',
        label: 'GitHub',
        hidden: true,
      },
    ],
    updatedAt: Date.now(),
  },
  'sunlight-blue': {
    handle: 'sunlight-blue',
    displayName: 'Sunlight Blue',
    tagline: 'Con especial dedicación a nutrir la creatividad humana.',
    discipline: 'Arte Digital · Composición · Escritura',
    bio: '¡Hola! Soy Alex, "Sunlight Blue". Una persona creativa con múltiples pasiones: arte digital, composición de canciones, escritura y más.',
    brief: 'Si buscas ayuda para cualquier proyecto creativo, ¡estaré más que feliz de colaborar!',
    accentColor: '#3A63A8',
    socials: [
      {
        platform: 'youtube',
        url: 'https://www.youtube.com/@SunlightBlueYT',
        label: 'YouTube',
      },
      {
        platform: 'discord',
        url: 'https://discord.com',
        label: 'Discord: @sunlight_blue',
      },
    ],
    updatedAt: Date.now(),
  },
};

function uploadData(tablePath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'multiverseofmadness21-fefd9-default-rtdb.firebaseio.com',
      path: `/${tablePath}.json?auth=${secret}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ [OK] ${tablePath} uploaded successfully (${res.statusCode})`);
          resolve(body);
        } else {
          console.error(`❌ [FAIL] ${tablePath} failed with status: ${res.statusCode}: ${body}`);
          reject(new Error(body));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('🚀 Seeding artist profiles into Firebase RTDB...');
  try {
    await uploadData('artistas_perfiles', initialProfiles);
    console.log('🎉 Seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

run();

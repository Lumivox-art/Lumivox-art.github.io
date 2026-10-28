import { createContext, useContext, useState, type ReactNode } from 'react';

// Lightweight i18n layer. Default language is English; the choice persists in
// localStorage and is shared app-wide (like the theme).
export type Lang = 'en' | 'es';
const LANG_KEY = 'lumivox-lang';

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    'common.example': 'EXAMPLE',
    'common.days': 'days',
    // shared CTAs / chrome (artist module labels are i18n keys; proper nouns fall through)
    'cta.commissions': 'Commissions',
    'cta.website': 'Visit website',
    'cta.contact': 'Contact me!',
    'theme.toggle': 'Switch day / night mode',
    'artists.empty': 'Empty roster.',
    // home
    'home.hero.l1': 'Where art',
    'home.hero.l2': 'finds its',
    'home.hero.accent': 'voice',
    'home.artists': 'artists',
    // artists page
    'artists.back': 'home',
    'artists.tagline': 'community artists',
    // artist bios (only Luis.M is real; others fall back to their literal data)
    'artist.luis.hook': 'Do you like this page?',
    'artist.luis.discipline': 'Software Engineer · Digital solutions',
    'artist.luis.bio':
      "Hi, I'm Nix. I designed this page to give my fellow artists a unique space for their commercial needs.",
    'artist.luis.brief':
      "We live in a time when digitalization makes spreading a digital brand remarkably easy. If you're looking to grow your brand through digital solutions, reach out!",
    'artist.specku.hook': 'Every great universe starts with a single concept.',
    'artist.specku.discipline': 'Illustrator · Storyteller',
    'artist.specku.bio':
      'Hello! I am Specku, an illustrator and storyteller who loves pulling ideas from imagination and turning them into compelling visuals.',
    'artist.specku.brief':
      "I pride myself in creating accessible, quality and diverse art that bring people's ideas to life, while keeping my clients comfortable and with an easy communication flow. Feel free to send a message, and let's start creating!",
    'artist.sunlight.hook': 'Especially invested on nourishing human-made creativity.',
    'artist.sunlight.discipline': 'Digital Artist · Songwriter · Writer',
    'artist.sunlight.bio':
      'Hi, I´m Alex, "Sunlight Blue". I´m a creative with multiple passions: digital artist, song-writing, writer and more.',
    'artist.sunlight.brief':
      'If you want help for any creative endeavour, I´m more than happy to help!',
    // specku commissions
    'specku.title': "Specku's Commissions!",
    'specku.subtitle': 'Not sure what to order? Visit my gallery',
    'specku.subtitle.prefix': 'Not sure what to order? Visit my',
    'specku.subtitle.link': 'gallery',
    'specku.step.style': 'Choose a style',
    'specku.step.size': 'Choose a size',
    'specku.step.look': 'Choose a look',
    'specku.summary': 'Your quote',
    'specku.line.style': '1 · Style',
    'specku.line.size': '2 · Size',
    'specku.line.look': '3 · Look',
    'specku.total': 'Total',
    'specku.mxn': 'In pesos (1 USD = 17 MXN)',
    'specku.hint': 'Pick a style, size and look to complete your total.',
    'specku.size.shoulders': 'Shoulders',
    'specku.size.shoulders.desc': 'Portrait from the shoulders',
    'specku.size.half': 'Half body',
    'specku.size.half.desc': 'Down to the hips',
    'specku.size.full': 'Full body',
    'specku.size.full.desc': 'Full figure',
    'specku.look.draft': 'Draft',
    'specku.look.draft.desc': 'Pencil sketch',
    'specku.look.lineart': 'Lineart',
    'specku.look.lineart.desc': 'Clean line',
    'specku.look.clean': 'Clean',
    'specku.look.clean.desc': 'Flat color',
    'specku.look.rendered': 'Rendered',
    'specku.look.rendered.desc': 'Render with light and shadow',
    // specku discord direct message action
    'specku.discord.action': 'Prepare message for Discord',
    'specku.discord.send': 'Send',
    'specku.discord.copied.title': 'Quote ready and copied!',
    'specku.discord.copied.desc':
      "The message has been copied to your clipboard. Tap 'Send' to open Specku's chat and paste it (tap & hold to Paste, or Ctrl+V on PC).",
    'specku.discord.copied.preview': 'Message preview:',
    'specku.discord.copied.recopy': 'Copy',
    'specku.discord.copied.copied': 'Copied!',
    'specku.discord.msg.greeting': 'Hi Specku! I would like to request a commission quote:',
    // optional extras
    'specku.extras.title': 'Optional additions',
    'specku.extras.subtitle': 'Toggle any options that your drawing includes.',
    // backgrounds
    'specku.bg.question': 'Does the drawing include a background?',
    'specku.bg.title': 'Backgrounds',
    'specku.bg.simple': 'Simple',
    'specku.bg.simple.desc': 'Subtle gradient, pattern, or simple shapes',
    'specku.bg.detailed': 'Detailed',
    'specku.bg.detailed.desc': 'Full environment, complex scenery or architecture',
    // objects of interest
    'specku.obj.question': 'Does it include objects of interest?',
    'specku.obj.title': 'Objects of interest',
    'specku.obj.small': 'Small',
    'specku.obj.small.desc': 'Small prop, accessory, or handheld item',
    'specku.obj.medium': 'Medium',
    'specku.obj.medium.desc': 'Medium weapon, pet, or complex accessory',
    'specku.obj.big': 'Big',
    'specku.obj.big.desc': 'Large prop, vehicle, or creature',
    // additional people
    'specku.people.question': 'Does it include additional people or characters?',
    'specku.people.title': 'Additional people',
    'specku.people.desc': '40% of the base cost per additional person',
    'specku.people.count': 'People',
    'specku.people.singular': 'person',
    'specku.people.plural': 'people',
    // summary lines
    'specku.line.bg': 'Background',
    'specku.line.obj': 'Object of interest',
    'specku.line.people': 'Additional people',
    // specku footer terms
    'specku.footer.prefix': 'Sending a commission request implies agreeing to the',
    'specku.footer.termsLink': 'Terms of Service',
    'specku.footer.suffix': '.',

    // specku terms of service page
    'specku.terms.back': 'Back to commissions',
    'specku.terms.badge': 'Terms of Service',
    'specku.terms.title': "Specku's Commission Terms",
    'specku.terms.subtitle': 'Clear guidelines on delivery times, sketch reviews, payment options, permissions, and copyright.',

    // Section 1: Process & Delivery
    'specku.terms.s1.title': 'Work Process & Delivery',
    'specku.terms.s1.delivery.title': 'Delivery Timeframe',
    'specku.terms.s1.delivery.text':
      'Commissions for each style have an estimated delivery time (shown in the builder, ranging from 3 to 20 days depending on the selected style).',
    'specku.terms.s1.sketch.title': 'Sketch Review',
    'specku.terms.s1.sketch.text':
      'In all commissions I offer a sketch review, which is basically me sending you 1 to 4 sketches once I have them, and you have the chance to select one and request beforehand every change you can think of, from hair to pose, or even ask for a remake from scratch if you do not like any (once), no money added guarantee. Once it has a pass, I get to making the piece.',
    'specku.terms.s1.payment.title': 'Payment Methods & Options',
    'specku.terms.s1.payment.text':
      'You can choose to either pay upfront, or you can pay half of the cost after the sketch review and the other half in the end. I accept payment through PayPal.',
    'specku.terms.s1.revisions.title': 'Revisions After Delivery',
    'specku.terms.s1.revisions.text':
      'Finally, after delivery of the piece, I allow for 2 changes to be asked, as long as they are possible and within reason. At this point I cannot change the whole pose or an arm, but I could do changes like eye shape, eye color and stuff like that. These 2 are also free of charge.',

    // Section 2: Permissions
    'specku.terms.s2.title': 'Permissions & Comfort',
    'specku.terms.s2.intro': 'I need to know if I have permissions for the following:',
    'specku.terms.s2.stream.title': 'Live Streaming',
    'specku.terms.s2.stream.text': 'Can I and are you comfortable with me doing the piece while I stream?',
    'specku.terms.s2.socials.title': 'Social Media Sharing',
    'specku.terms.s2.socials.text':
      'In the case you do not publicly publish the piece, am I able to share it on my art profiles, such as Tumblr and Twitter/X?',
    'specku.terms.s2.portfolio.title': 'Exhibition & Portfolio',
    'specku.terms.s2.portfolio.text':
      'Am I able to expose this piece in other locations, such as art examples for other commissions or portfolios?',

    // Section 3: Client Rights
    'specku.terms.s3.title': 'Rights Respected for Each Client',
    'specku.terms.s3.intro': 'These are the rights I respect for each of my clients:',
    'specku.terms.s3.ownership.title': 'Client Ownership',
    'specku.terms.s3.ownership.text':
      'The art piece is yours to use as you please, and I lose control over the rights of using it for my own commercial means.',
    'specku.terms.s3.permission.title': 'Prior Permission',
    'specku.terms.s3.permission.text':
      'I ask for permission to post speedpaints, use the artwork for examples/portfolio, or post it publicly.',
    'specku.terms.s3.authorship.title': 'Authorship & Attribution',
    'specku.terms.s3.authorship.text':
      'You gain the ownership of the art piece; however, I remain having the right of being the artist/creator and to be recognized as such.',

        'specku.terms.ctaBack': 'Back to Commission Builder',

    // specku gallery
    'specku.gallery.badge': 'Gallery',
    'specku.gallery.title': "Specku's Gallery",
    'specku.gallery.subtitle': 'Explore art samples and illustrations.',
    'specku.gallery.back': 'Back to commissions',
    'specku.gallery.ctaCard': 'Interested in getting a custom illustration?',
    'specku.gallery.ctaCommissions': 'Build your quote',
    'specku.gallery.close': 'Close preview',
    'specku.gallery.prev': 'Previous sheet',
    'specku.gallery.next': 'Next sheet',
    'specku.gallery.sheet': 'Sheet',
    'specku.gallery.view': 'Zoom in',

    // sam commissions (mockup)
    'sam.tag': 'commissions',
    'sam.note': 'Sample design — to be reworked later.',
  },
  es: {
    'common.example': 'EJEMPLO',
    'common.days': 'días',
    'cta.commissions': 'Comisiones',
    'cta.website': 'Visitar sitio',
    'cta.contact': '¡Contáctame!',
    'theme.toggle': 'Cambiar entre modo día y noche',
    'artists.empty': 'Roster vacío.',
    'home.hero.l1': 'Donde el arte',
    'home.hero.l2': 'encuentra su',
    'home.hero.accent': 'voz',
    'home.artists': 'artistas',
    'artists.back': 'inicio',
    'artists.tagline': 'artistas de la comunidad',
    'artist.luis.hook': '¿Te gusta esta página?',
    'artist.luis.discipline': 'Ingeniero de Software · Soluciones digitales',
    'artist.luis.bio':
      'Hola, soy Nix y he diseñado esta página para ayudar a mis compañeros artistas a tener un espacio único para sus necesidades comerciales.',
    'artist.luis.brief':
      'Estamos en un tiempo donde la facilidad que trae la digitalización a la propagación de una marca digital es bastante evidente. Si estás buscando impulsar tu marca mediante soluciones digitales, ¡puedes contactarme!',
    'artist.specku.hook': 'Todo gran universo comienza con un solo concepto.',
    'artist.specku.discipline': 'Ilustrador · Narrador visual',
    'artist.specku.bio':
      '¡Hola! Soy Specku, ilustrador y narrador al que le apasiona extraer ideas de la imaginación y convertirlas en obras visuales cautivadoras.',
    'artist.specku.brief':
      'Me enorgullece crear arte accesible, diverso y de calidad que da vida a las ideas de las personas, manteniendo a mis clientes cómodos y con una comunicación fluida. ¡No dudes en enviar un mensaje y comencemos a crear!',
    'artist.sunlight.hook': 'Con especial dedicación a nutrir la creatividad humana.',
    'artist.sunlight.discipline': 'Arte Digital · Composición · Escritura',
    'artist.sunlight.bio':
      '¡Hola! Soy Alex, "Sunlight Blue". Una persona creativa con múltiples pasiones: arte digital, composición de canciones, escritura y más.',
    'artist.sunlight.brief':
      'Si buscas ayuda para cualquier proyecto creativo, ¡estaré más que feliz de colaborar!',
    'specku.title': '¡Comisiones de Specku!',
    'specku.subtitle': '¿No sabes qué pedir? Visita mi galería',
    'specku.subtitle.prefix': '¿No sabes qué pedir? Visita mi',
    'specku.subtitle.link': 'galería',
    'specku.step.style': 'Elige un estilo',
    'specku.step.size': 'Elige un tamaño',
    'specku.step.look': 'Elige un acabado',
    'specku.summary': 'Tu cotización',
    'specku.line.style': '1 · Estilo',
    'specku.line.size': '2 · Tamaño',
    'specku.line.look': '3 · Acabado',
    'specku.total': 'Total',
    'specku.mxn': 'En pesos (1 USD = 17 MXN)',
    'specku.hint': 'Elige estilo, tamaño y acabado para completar tu total.',
    'specku.size.shoulders': 'Hombros',
    'specku.size.shoulders.desc': 'Retrato desde los hombros',
    'specku.size.half': 'Medio cuerpo',
    'specku.size.half.desc': 'Hasta la cadera',
    'specku.size.full': 'Cuerpo completo',
    'specku.size.full.desc': 'Figura completa',
    'specku.look.draft': 'Draft',
    'specku.look.draft.desc': 'Boceto a lápiz',
    'specku.look.lineart': 'Lineart',
    'specku.look.lineart.desc': 'Línea limpia',
    'specku.look.clean': 'Limpio',
    'specku.look.clean.desc': 'Color plano',
    'specku.look.rendered': 'Renderizado',
    'specku.look.rendered.desc': 'Render con luz y sombra',
    // specku discord direct message action
    'specku.discord.action': 'Preparar mensaje para Discord',
    'specku.discord.send': 'Mandar',
    'specku.discord.copied.title': '¡Cotización lista y copiada!',
    'specku.discord.copied.desc':
      '¡Mensaje copiado al portapapeles! Ahora pulsa "Mandar" para abrir el chat de Specku y mantén presionado para pegar (o Ctrl+V en PC).',
    'specku.discord.copied.preview': 'Vista previa del mensaje:',
    'specku.discord.copied.recopy': 'Copiar',
    'specku.discord.copied.copied': '¡Copiado!',
    'specku.discord.msg.greeting': '¡Hola Specku! Me gustaría solicitar una cotización de comisión:',
    // optional extras
    'specku.extras.title': 'Adicionales opcionales',
    'specku.extras.subtitle': 'Activa si el dibujo contiene alguno de estos elementos.',
    // backgrounds
    'specku.bg.question': '¿El dibujo contiene fondo?',
    'specku.bg.title': 'Fondos',
    'specku.bg.simple': 'Simple',
    'specku.bg.simple.desc': 'Degradado suave, patrones o formas básicas',
    'specku.bg.detailed': 'Detallado',
    'specku.bg.detailed.desc': 'Paisaje completo, escenario o arquitectura detallada',
    // objects of interest
    'specku.obj.question': '¿Contiene objetos de interés?',
    'specku.obj.title': 'Objetos de interés',
    'specku.obj.small': 'Pequeño',
    'specku.obj.small.desc': 'Objeto pequeño, accesorio o item de mano',
    'specku.obj.medium': 'Mediano',
    'specku.obj.medium.desc': 'Arma mediana, mascota o accesorio complejo',
    'specku.obj.big': 'Grande',
    'specku.obj.big.desc': 'Elemento grande, vehículo o criatura',
    // additional people
    'specku.people.question': '¿Contiene personas o personajes adicionales?',
    'specku.people.title': 'Personas adicionales',
    'specku.people.desc': '40% del costo base por persona adicional',
    'specku.people.count': 'Personas',
    'specku.people.singular': 'persona',
    'specku.people.plural': 'personas',
    // summary lines
    'specku.line.bg': 'Fondo',
    'specku.line.obj': 'Objeto de interés',
    'specku.line.people': 'Personas adicionales',
    // specku footer terms
    'specku.footer.prefix': 'Enviar una solicitud de comisión implica acceder a los',
    'specku.footer.termsLink': 'Términos de Servicio',
    'specku.footer.suffix': '.',

    // specku terms of service page
    'specku.terms.back': 'Volver a comisiones',
    'specku.terms.badge': 'Términos de Servicio',
    'specku.terms.title': 'Términos de Comisión de Specku',
    'specku.terms.subtitle': 'Pautas claras sobre tiempos de entrega, revisión de bocetos, métodos de pago, permisos y derechos de autor.',

    // Section 1: Process & Delivery
    'specku.terms.s1.title': 'Proceso de Trabajo y Entregas',
    'specku.terms.s1.delivery.title': 'Tiempos de Entrega',
    'specku.terms.s1.delivery.text':
      'Las comisiones para cada estilo tienen un tiempo estimado de entrega (mostrado en el selector de estilos, variando de 3 a 20 días según la complejidad).',
    'specku.terms.s1.sketch.title': 'Revisión de Bocetos',
    'specku.terms.s1.sketch.text':
      'En todas las comisiones ofrezco una revisión de boceto, lo que básicamente consiste en enviarte de 1 a 4 bocetos una vez listos. Tienes la oportunidad de elegir uno y solicitar de antemano todos los cambios que consideres necesarios, desde el cabello hasta la pose, o incluso pedir que se rehaga desde cero si ninguno te convence (una sola vez), garantizado sin costo adicional. Una vez aprobado, comienzo a elaborar la pieza final.',
    'specku.terms.s1.payment.title': 'Formas de Pago',
    'specku.terms.s1.payment.text':
      'Puedes elegir pagar por adelantado, o bien pagar la mitad del costo tras la revisión del boceto y la otra mitad al finalizar. Acepto pagos mediante PayPal.',
    'specku.terms.s1.revisions.title': 'Revisiones tras la Entrega',
    'specku.terms.s1.revisions.text':
      'Finalmente, tras la entrega de la pieza, permito solicitar hasta 2 cambios, siempre que sean posibles y razonables. En este punto no es posible cambiar la pose completa o un brazo, pero sí ajustes como forma de los ojos, color de ojos y detalles similares. Estos 2 cambios también son completamente gratuitos.',

    // Section 2: Permissions
    'specku.terms.s2.title': 'Permisos y Comodidad',
    'specku.terms.s2.intro': 'Necesito consultar si cuento con tus permisos para lo siguiente:',
    'specku.terms.s2.stream.title': 'Transmisiones en Vivo (Streams)',
    'specku.terms.s2.stream.text': '¿Puedo y te sientes cómodo/a con que elabore la pieza en vivo mientras transmito?',
    'specku.terms.s2.socials.title': 'Difusión en Redes',
    'specku.terms.s2.socials.text':
      'En caso de que no publiques la pieza públicamente, ¿puedo compartirla en mis perfiles de arte, como Tumblr y Twitter/X?',
    'specku.terms.s2.portfolio.title': 'Muestras y Portafolio',
    'specku.terms.s2.portfolio.text':
      '¿Puedo exhibir esta pieza en otros espacios, como ejemplos para futuras comisiones o en mi portafolio?',

    // Section 3: Client Rights
    'specku.terms.s3.title': 'Derechos que Respeto para Cada Cliente',
    'specku.terms.s3.intro': 'Estos son los derechos que garantizo a cada uno de mis clientes:',
    'specku.terms.s3.ownership.title': 'Propiedad del Cliente',
    'specku.terms.s3.ownership.text':
      'La pieza de arte es tuya para usarla como gustes, y yo renuncio al control sobre usarla para fines comerciales propios.',
    'specku.terms.s3.permission.title': 'Consentimiento Previo',
    'specku.terms.s3.permission.text':
      'Siempre te pediré autorización antes de publicar speedpaints, usar las obras como ejemplos de portafolio o postearlas.',
    'specku.terms.s3.authorship.title': 'Autoría y Reconocimiento',
    'specku.terms.s3.authorship.text':
      'Obtienes la propiedad de la pieza; sin embargo, conservo el derecho moral como artista/creador de ser reconocido y acreditado como autor.',

        'specku.terms.ctaBack': 'Volver al Cotizador de Comisiones',

    // specku gallery
    'specku.gallery.badge': 'Galería',
    'specku.gallery.title': 'Galería de Specku',
    'specku.gallery.subtitle': 'Explora muestras de arte e ilustraciones.',
    'specku.gallery.back': 'Volver a comisiones',
    'specku.gallery.ctaCard': '¿Te interesa una ilustración personalizada?',
    'specku.gallery.ctaCommissions': 'Cotiza tu comisión',
    'specku.gallery.close': 'Cerrar vista previa',
    'specku.gallery.prev': 'Hoja anterior',
    'specku.gallery.next': 'Siguiente hoja',
    'specku.gallery.sheet': 'Hoja',
    'specku.gallery.view': 'Zoom in',

    'sam.tag': 'comisiones',
    'sam.note': 'Diseño de muestra — se modificará más adelante.',
  },
};

function readLang(): Lang {
  let saved: string | null = null;
  try {
    saved = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
  } catch {
    // safe fallback
  }
  return saved === 'es' ? 'es' : 'en'; // default English
}

type LangContextValue = { lang: Lang; toggle: () => void; t: (key: string) => string };
const LangContext = createContext<LangContextValue>({ lang: 'en', toggle: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => readLang());

  const toggle = (): void =>
    setLang((l) => {
      const next: Lang = l === 'es' ? 'en' : 'es';
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch {
        // Safe against storage quota or security restrictions
      }
      return next;
    });

  const t = (key: string): string => DICT[lang][key] ?? DICT.en[key] ?? key;

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

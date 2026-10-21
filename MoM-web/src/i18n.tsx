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
      "Hi, I'm Luis.M. I designed this page to give my fellow artists a unique space for their commercial needs.",
    'artist.luis.brief':
      "We live in a time when digitalization makes spreading a digital brand remarkably easy. If you're looking to grow your brand through digital solutions, reach out!",
    // joz commissions
    'joz.title': 'Commissions!',
    'joz.subtitle': 'Build your quote — pick one option per step and watch your total live.',
    'joz.step.style': 'Choose a style',
    'joz.step.size': 'Choose a size',
    'joz.step.look': 'Choose a look',
    'joz.summary': 'Your quote',
    'joz.line.style': '1 · Style',
    'joz.line.size': '2 · Size',
    'joz.line.look': '3 · Look',
    'joz.total': 'Total',
    'joz.mxn': 'In pesos (1 USD = 19 MXN)',
    'joz.hint': 'Pick a style, size and look to complete your total.',
    'joz.size.shoulders': 'Shoulders',
    'joz.size.shoulders.desc': 'Portrait from the shoulders',
    'joz.size.half': 'Half body',
    'joz.size.half.desc': 'Down to the hips',
    'joz.size.full': 'Full body',
    'joz.size.full.desc': 'Full figure',
    'joz.look.draft': 'Draft',
    'joz.look.draft.desc': 'Pencil sketch',
    'joz.look.lineart': 'Lineart',
    'joz.look.lineart.desc': 'Clean line',
    'joz.look.clean': 'Clean',
    'joz.look.clean.desc': 'Flat color',
    'joz.look.rendered': 'Rendered',
    'joz.look.rendered.desc': 'Render with light and shadow',
    // joz discord direct message action
    'joz.discord.action': 'Message Joph on Discord',
    'joz.discord.copied.title': 'Quote copied to clipboard!',
    'joz.discord.copied.desc':
      "Joph's Discord profile opened! In the chat, tap & hold to 'Paste' (or Ctrl+V on PC) to send your commission request.",
    'joz.discord.copied.preview': 'Copied message:',
    'joz.discord.copied.recopy': 'Copy again',
    'joz.discord.msg.greeting': 'Hi Joph! I would like to request a commission quote:',
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
      'Hola, soy Luis.M y he diseñado esta página para ayudar a mis compañeros artistas a tener un espacio único para sus necesidades comerciales.',
    'artist.luis.brief':
      'Estamos en un tiempo donde la facilidad que trae la digitalización a la propagación de una marca digital es bastante evidente. Si estás buscando impulsar tu marca mediante soluciones digitales, ¡puedes contactarme!',
    'joz.title': '¡Comisiones!',
    'joz.subtitle': 'Arma tu cotización — elige una opción en cada paso y mira tu total en vivo.',
    'joz.step.style': 'Elige un estilo',
    'joz.step.size': 'Elige un tamaño',
    'joz.step.look': 'Elige un acabado',
    'joz.summary': 'Tu cotización',
    'joz.line.style': '1 · Estilo',
    'joz.line.size': '2 · Tamaño',
    'joz.line.look': '3 · Acabado',
    'joz.total': 'Total',
    'joz.mxn': 'En pesos (1 USD = 19 MXN)',
    'joz.hint': 'Elige estilo, tamaño y acabado para completar tu total.',
    'joz.size.shoulders': 'Hombros',
    'joz.size.shoulders.desc': 'Retrato desde los hombros',
    'joz.size.half': 'Medio cuerpo',
    'joz.size.half.desc': 'Hasta la cadera',
    'joz.size.full': 'Cuerpo completo',
    'joz.size.full.desc': 'Figura completa',
    'joz.look.draft': 'Draft',
    'joz.look.draft.desc': 'Boceto a lápiz',
    'joz.look.lineart': 'Lineart',
    'joz.look.lineart.desc': 'Línea limpia',
    'joz.look.clean': 'Limpio',
    'joz.look.clean.desc': 'Color plano',
    'joz.look.rendered': 'Renderizado',
    'joz.look.rendered.desc': 'Render con luz y sombra',
    // joz discord direct message action
    'joz.discord.action': 'Enviar mensaje a Joph en Discord',
    'joz.discord.copied.title': '¡Cotización copiada al portapapeles!',
    'joz.discord.copied.desc':
      '¡Se abrió el perfil de Joph! En el chat, mantén presionado y selecciona "Pegar" (o Ctrl+V en PC) para enviarle tu pedido.',
    'joz.discord.copied.preview': 'Mensaje copiado:',
    'joz.discord.copied.recopy': 'Volver a copiar',
    'joz.discord.msg.greeting': '¡Hola Joph! Me gustaría solicitar una cotización de comisión:',
    'sam.tag': 'comisiones',
    'sam.note': 'Diseño de muestra — se modificará más adelante.',
  },
};

function readLang(): Lang {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
  return saved === 'es' ? 'es' : 'en'; // default English
}

type LangContextValue = { lang: Lang; toggle: () => void; t: (key: string) => string };
const LangContext = createContext<LangContextValue>({ lang: 'en', toggle: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => readLang());

  const toggle = (): void =>
    setLang((l) => {
      const next: Lang = l === 'es' ? 'en' : 'es';
      localStorage.setItem(LANG_KEY, next);
      return next;
    });

  const t = (key: string): string => DICT[lang][key] ?? DICT.en[key] ?? key;

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

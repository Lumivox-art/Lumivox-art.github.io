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
    // specku commissions
    'specku.title': 'Commissions!',
    'specku.subtitle': 'Build your quote — pick one option per step and watch your total live.',
    'specku.step.style': 'Choose a style',
    'specku.step.size': 'Choose a size',
    'specku.step.look': 'Choose a look',
    'specku.summary': 'Your quote',
    'specku.line.style': '1 · Style',
    'specku.line.size': '2 · Size',
    'specku.line.look': '3 · Look',
    'specku.total': 'Total',
    'specku.mxn': 'In pesos (1 USD = 19 MXN)',
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
    'specku.title': '¡Comisiones!',
    'specku.subtitle': 'Arma tu cotización — elige una opción en cada paso y mira tu total en vivo.',
    'specku.step.style': 'Elige un estilo',
    'specku.step.size': 'Elige un tamaño',
    'specku.step.look': 'Elige un acabado',
    'specku.summary': 'Tu cotización',
    'specku.line.style': '1 · Estilo',
    'specku.line.size': '2 · Tamaño',
    'specku.line.look': '3 · Acabado',
    'specku.total': 'Total',
    'specku.mxn': 'En pesos (1 USD = 19 MXN)',
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

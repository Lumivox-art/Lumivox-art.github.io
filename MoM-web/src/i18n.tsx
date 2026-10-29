import { createContext, useContext, useState, type ReactNode } from 'react';

// Lightweight i18n layer. Default language is English; the choice persists in
// localStorage and is shared app-wide (like the theme).
export type Lang = 'en' | 'es';
const LANG_KEY = 'lumivox-lang';
const ALT_LANG_KEY = 'lvx_lang';

export const DICT: Record<Lang, Record<string, string>> = {
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

    // specku payment gateway & generator
    'specku.pay.generator.link': 'PayPal Payment Link',
    'specku.pay.generator.badge': 'ADMIN / SPECKU',
    'specku.pay.generator.title': 'Payment Link Generator',
    'specku.pay.generator.subtitle':
      'Set the price, discounts, and fee coverage to generate a custom PayPal link for your client.',
    'specku.pay.generator.section1': 'Payment Details',
    'specku.pay.generator.new_folio': 'New Folio',
    'specku.pay.generator.assigned_folio': 'Assigned Folio:',
    'specku.pay.generator.concept_label': 'Commission Concept or Title:',
    'specku.pay.generator.concept_placeholder': 'E.g. Semi-Real Illustration - Full Body',
    'specku.pay.generator.client_label': 'Client or Reference (Optional):',
    'specku.pay.generator.client_placeholder': 'E.g. @DiscordUser or Client Name',
    'specku.pay.generator.notes_label': 'Additional notes for client (Optional):',
    'specku.pay.generator.price_label': 'Base Price (USD):',
    'specku.pay.generator.discount_label': 'Special Discount:',
    'specku.pay.generator.discount_none': 'No discount',
    'specku.pay.generator.discount_fixed': 'Fixed amount ($)',
    'specku.pay.generator.discount_percent': 'Percentage (%)',
    'specku.pay.generator.discount_reason': 'Discount reason:',
    'specku.pay.generator.fee_title': 'PayPal Processing Fee:',
    'specku.pay.generator.fee_toggle': 'Charge fee to client (+4.4% + $0.30 USD)',
    'specku.pay.generator.live_breakdown': 'Live Breakdown',
    'specku.pay.generator.base_price': 'Base Price',
    'specku.pay.generator.discount': 'Discount',
    'specku.pay.generator.subtotal': 'Subtotal',
    'specku.pay.generator.paypal_fee': 'PayPal Fee (4.4% + $0.30)',
    'specku.pay.generator.total_charge': 'Total to Charge',
    'specku.pay.generator.generate_btn': 'Generate Payment Link',
    'specku.pay.generator.saving_btn': 'Saving to Server...',
    'specku.pay.generator.copy_link': 'Copy Link',
    'specku.pay.generator.copied': 'Copied!',
    'specku.pay.generator.history_title': 'Generated Links History',
    'specku.pay.generator.history_empty': 'No links generated yet.',

    // checkout
    'specku.pay.checkout.invalid.title': 'Invalid or Incomplete Payment Link',
    'specku.pay.checkout.invalid.desc':
      'This payment portal requires a payment link generated beforehand by Specku. To request a commission or get your payment link, please reach out to the artist.',
    'specku.pay.checkout.contact': 'Contact Specku on Discord',
    'specku.pay.checkout.view_commissions': 'View Gallery & Pricing',
    'specku.pay.checkout.success.title': 'Payment Successful!',
    'specku.pay.checkout.already_paid.title': 'Order Already Settled',
    'specku.pay.checkout.already_paid.desc':
      'This payment order has already been paid and settled. Double charging is prevented by security policy.',
    'specku.pay.checkout.already_paid_sub':
      'If you already completed your payment, please notify Specku on Discord with your transaction ID.',
    'specku.pay.checkout.expired.title': 'Payment Link Expired',
    'specku.pay.checkout.expired.desc':
      'For security and anti-tampering protection (TTL policy), this payment link has expired. Please contact Specku to receive a fresh link.',
    'specku.pay.checkout.verifying': 'Verifying order authenticity on server...',
    'specku.pay.checkout.order_details': 'Order Details',
    'specku.pay.checkout.folio': 'Order Folio:',
    'specku.pay.checkout.concept': 'Concept:',
    'specku.pay.checkout.recipient': 'Recipient:',
    'specku.pay.checkout.notes': 'Notes:',
    'specku.pay.checkout.base_price': 'Base Price',
    'specku.pay.checkout.discount': 'Discount',
    'specku.pay.checkout.subtotal': 'Subtotal',
    'specku.pay.checkout.fee_included': 'PayPal Processing Fee',
    'specku.pay.checkout.fee_voluntary':
      'Cover PayPal fee (+4.4% + $0.30 USD) so Specku receives the full amount',
    'specku.pay.checkout.total_pay': 'Total to Pay',
    'specku.pay.checkout.pay_title': 'Pay with PayPal or Card',
    'specku.pay.checkout.trans_completed': 'TRANSACTION COMPLETED',
    'specku.pay.checkout.thanks_prefix': 'Thank you very much',
    'specku.pay.checkout.thanks_suffix': 'Your payment has been processed and credited to Specku.',
    'specku.pay.checkout.tx_id': 'PayPal Transaction ID:',
    'specku.pay.checkout.date': 'Date:',
    'specku.pay.checkout.amount_paid': 'Amount Paid:',
    'specku.pay.checkout.notify_discord': 'Notify Specku on Discord',
    'specku.pay.checkout.req_new_link': 'Request New Link on Discord',
    'specku.pay.checkout.view_commissions_btn': 'View Commissions',

    // intranet & artist auth
    'intranet.login.title': 'Artist Intranet',
    'intranet.login.subtitle': 'Exclusive portal for Lumivox creators to manage cards, profiles and workflows.',
    'intranet.login.user': 'Username:',
    'intranet.login.user_placeholder': 'Username',
    'intranet.login.password': 'Password:',
    'intranet.login.btn': 'Sign In to My Dashboard',
    'intranet.login.loading': 'Signing in...',
    'intranet.login.notice':
      'Closed access: This portal does not accept public registration. If you are an artist member of the collective, please request your account from the administrator.',
    'intranet.login.error.empty': 'Please enter your username and password.',
    'intranet.login.error.credentials': 'Unrecognized credentials. Please verify your username and password.',
    'intranet.login.error.rate_limit': 'Too many failed attempts. For security, please wait a moment before retrying.',
    'intranet.login.error.general': 'Could not reach authentication server. Please try again.',
    'intranet.shortcut.tooltip': 'Go to creator dashboard',
    'intranet.shortcut.artist': 'Artist',
    'intranet.dashboard.title': 'Creator Dashboard',
    'intranet.dashboard.subtitle': 'Customize your public card information, update socials and access specialized tools.',
    'intranet.dashboard.badge': 'INTRANET · CREATOR DASHBOARD',
    'intranet.dashboard.welcome': 'Welcome, ',
    'intranet.dashboard.loading': 'Loading artist dashboard...',
    'intranet.dashboard.success': 'Changes saved successfully to database!',
    'intranet.dashboard.save': 'Save Changes to My Card',
    'intranet.dashboard.saving': 'Saving to database...',
    'intranet.dashboard.logout': 'Sign Out',
    'intranet.dashboard.view_public': 'View my public card',
    'intranet.dashboard.tools.specku_title': 'Exclusive Tools for Specku',
    'intranet.dashboard.tools.pay_title': 'PayPal Payment Link Generator',
    'intranet.dashboard.tools.pay_desc': 'Create payment links for your commissions with custom pricing, discounts, and fee settings.',
    'intranet.dashboard.tools.pay_btn': 'Open Payment Generator →',
    'intranet.dashboard.tools.gallery_title': 'Gallery Samples',
    'intranet.dashboard.tools.gallery_desc': 'Review how your styles, sketches, and artworks appear in your interactive catalog.',
    'intranet.dashboard.tools.gallery_btn': 'Explore my Gallery →',
    'intranet.dashboard.card_info': 'Public Card Information',
    'intranet.dashboard.display_name': 'Display Name:',
    'intranet.dashboard.tagline': 'Tagline / Highlight Phrase:',
    'intranet.dashboard.discipline': 'Discipline / Specialty:',
    'intranet.dashboard.bio': 'Short Bio:',
    'intranet.dashboard.brief': 'Additional Message / Brief:',
    'intranet.dashboard.accent_color': 'Accent Color:',
    'intranet.dashboard.socials': 'Social Links:',
    'intranet.dashboard.add_social': '+ Add Social Link',
    'intranet.dashboard.platform': 'Platform',
    'intranet.dashboard.url': 'URL / Link',
    'intranet.dashboard.label': 'Visible label',
    'intranet.dashboard.hide': 'Hide',
    'intranet.dashboard.remove': 'Remove',

    // sunlight commissions & 90s studio
    'sunlight.title': 'Sunlight Blue Commissions',
    'sunlight.subtitle': 'Custom original music, 90s cassette recordings, and vintage vinyl album covers.',
    'sunlight.badge': 'SUNLIGHT BLUE RECORDS · STEREO ANALOG',
    'sunlight.player.title': 'Cassette Deck · Hi-Fi Audio Player',
    'sunlight.player.side_a': 'Side A · Instrumental',
    'sunlight.player.side_b': 'Side B · Vocals with Lyrics',
    'sunlight.player.now_playing': 'NOW PLAYING',
    'sunlight.player.paused': 'PAUSED',
    'sunlight.player.stopped': 'TAPE STOPPED',
    'sunlight.player.tape_label': 'SUNLIGHT BLUE · CHROME CASSETTE TYPE II',
    'sunlight.gallery.title': 'Vinyl & Album Covers',
    'sunlight.gallery.subtitle': 'Click any vintage cover to inspect artwork and details.',
    'sunlight.step.art': 'Digital Art & Album Covers',
    'sunlight.step.art.headshot': 'Headshot',
    'sunlight.step.art.headshot.desc': 'Portrait from shoulders up. Ideal for avatars, singles, and avatars.',
    'sunlight.step.art.fullbody': 'Bust / Full Body',
    'sunlight.step.art.fullbody.desc': 'Half-body or full-figure with detailed expression and styling.',
    'sunlight.step.art.illustration': 'Illustration / Book Cover',
    'sunlight.step.art.illustration.desc': 'Full scene illustration or album/book jacket (starting price, complexity applies).',
    'sunlight.step.song': 'Custom Song Production',
    'sunlight.step.song.instrumental': 'Instrumental Track',
    'sunlight.step.song.instrumental.desc': 'Original instrumental arrangement tailored to your project or video.',
    'sunlight.step.song.vocals': 'Vocals with Lyrics',
    'sunlight.step.song.vocals.desc': 'Full song with custom lyrics, melodic composition, and recorded vocals.',
    'sunlight.step.options': 'Project Details & Notes',
    'sunlight.lyrics.lang': 'Lyrics Language:',
    'sunlight.lyrics.en': 'English',
    'sunlight.lyrics.es': 'Spanish',
    'sunlight.summary.title': 'Studio Order Receipt',
    'sunlight.summary.empty': 'Select an art style or song option to build your quote.',
    'sunlight.total': 'Total',
    'sunlight.mxn': 'In pesos (MXN)',
    'sunlight.discord.action': 'Prepare message for Discord',
    'sunlight.discord.send': 'Send to Sunlight Blue',
    'sunlight.discord.copied.title': 'Quote ready and copied!',
    'sunlight.discord.copied.desc': "The message has been copied to your clipboard. Tap 'Send' to contact Sunlight Blue on Discord (@sunlight_blue).",
    'sunlight.discord.msg.greeting': 'Hi Sunlight Blue! I would like to request a commission quote:',
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

    // specku payment gateway & generator
    'specku.pay.generator.link': 'Cobro PayPal',
    'specku.pay.generator.badge': 'ADMIN / SPECKU',
    'specku.pay.generator.title': 'Generador de Enlaces de Pago',
    'specku.pay.generator.subtitle':
      'Configura el precio, descuentos y la cobertura de comisión para generar un enlace único de PayPal para tu cliente.',
    'specku.pay.generator.section1': 'Detalles del Cobro',
    'specku.pay.generator.new_folio': 'Nuevo Folio',
    'specku.pay.generator.assigned_folio': 'Folio Asignado:',
    'specku.pay.generator.concept_label': 'Concepto o Título de la Comisión:',
    'specku.pay.generator.concept_placeholder': 'Ej. Ilustración Semi-Real - Cuerpo Completo',
    'specku.pay.generator.client_label': 'Cliente o Referencia (Opcional):',
    'specku.pay.generator.client_placeholder': 'Ej. @UsuarioDiscord o Nombre del cliente',
    'specku.pay.generator.notes_label': 'Notas adicionales para el cliente (Opcional):',
    'specku.pay.generator.price_label': 'Precio Base (USD):',
    'specku.pay.generator.discount_label': 'Descuento Especial:',
    'specku.pay.generator.discount_none': 'Sin descuento',
    'specku.pay.generator.discount_fixed': 'Monto fijo ($)',
    'specku.pay.generator.discount_percent': 'Porcentaje (%)',
    'specku.pay.generator.discount_reason': 'Motivo del descuento:',
    'specku.pay.generator.fee_title': 'Tarifa de Comisión PayPal:',
    'specku.pay.generator.fee_toggle': 'Cobrar comisión al cliente (+4.4% + $0.30 USD)',
    'specku.pay.generator.live_breakdown': 'Desglose en Vivo',
    'specku.pay.generator.base_price': 'Precio Base',
    'specku.pay.generator.discount': 'Descuento',
    'specku.pay.generator.subtotal': 'Subtotal',
    'specku.pay.generator.paypal_fee': 'Comisión PayPal (4.4% + $0.30)',
    'specku.pay.generator.total_charge': 'Total a Cobrar',
    'specku.pay.generator.generate_btn': 'Generar Enlace de Cobro',
    'specku.pay.generator.saving_btn': 'Guardando en Servidor...',
    'specku.pay.generator.copy_link': 'Copiar Enlace',
    'specku.pay.generator.copied': '¡Copiado!',
    'specku.pay.generator.history_title': 'Historial de Enlaces Generados',
    'specku.pay.generator.history_empty': 'No has generado ningún enlace todavía.',

    // checkout
    'specku.pay.checkout.invalid.title': 'Enlace de Pago No Válido o Incompleto',
    'specku.pay.checkout.invalid.desc':
      'Esta pasarela de pago requiere un enlace de cobro generado previamente por Specku. Para adquirir una comisión personalizada o solicitar tu enlace de pago, por favor contacta al artista.',
    'specku.pay.checkout.contact': 'Contactar a Specku en Discord',
    'specku.pay.checkout.view_commissions': 'Ver Galería y Precios',
    'specku.pay.checkout.success.title': '¡Pago Realizado con Éxito!',
    'specku.pay.checkout.already_paid.title': 'Esta Orden Ya Fue Liquidada',
    'specku.pay.checkout.already_paid.desc':
      'Esta orden de pago ya ha sido liquidada con anterioridad. Por políticas de seguridad, no se admiten cobros duplicados.',
    'specku.pay.checkout.already_paid_sub':
      'Si ya realizaste tu pago, puedes notificar a Specku por Discord con tu comprobante.',
    'specku.pay.checkout.expired.title': 'Enlace de Pago Expirado',
    'specku.pay.checkout.expired.desc':
      'Por políticas de seguridad y protección contra alteraciones (política TTL), esta liga ha expirado. Por favor solicita un nuevo enlace a Specku.',
    'specku.pay.checkout.verifying': 'Verificando autenticidad de la orden en el servidor...',
    'specku.pay.checkout.order_details': 'Detalles de la Orden',
    'specku.pay.checkout.folio': 'Folio de Orden:',
    'specku.pay.checkout.concept': 'Concepto:',
    'specku.pay.checkout.recipient': 'Destinatario:',
    'specku.pay.checkout.notes': 'Notas:',
    'specku.pay.checkout.base_price': 'Precio Base',
    'specku.pay.checkout.discount': 'Descuento',
    'specku.pay.checkout.subtotal': 'Subtotal',
    'specku.pay.checkout.fee_included': 'Comisión de Procesamiento PayPal',
    'specku.pay.checkout.fee_voluntary':
      'Cubrir tarifa de PayPal (+4.4% + $0.30 USD) para que Specku reciba el monto íntegro',
    'specku.pay.checkout.total_pay': 'Total a Pagar',
    'specku.pay.checkout.pay_title': 'Pagar con PayPal o Tarjeta',
    'specku.pay.checkout.trans_completed': 'TRANSACCIÓN COMPLETADA',
    'specku.pay.checkout.thanks_prefix': 'Muchas gracias',
    'specku.pay.checkout.thanks_suffix': 'ha sido procesado y acreditado a Specku.',
    'specku.pay.checkout.tx_id': 'ID de Transacción PayPal:',
    'specku.pay.checkout.date': 'Fecha:',
    'specku.pay.checkout.amount_paid': 'Monto Pagado:',
    'specku.pay.checkout.notify_discord': 'Notificar a Specku por Discord',
    'specku.pay.checkout.req_new_link': 'Solicitar Nueva Liga en Discord',
    'specku.pay.checkout.view_commissions_btn': 'Ver Comisiones',

    // intranet & artist auth
    'intranet.login.title': 'Intranet de Artistas',
    'intranet.login.subtitle': 'Portal exclusivo para que los creadores de Lumivox administren sus tarjetas, enlaces y herramientas.',
    'intranet.login.user': 'Usuario:',
    'intranet.login.user_placeholder': 'Usuario',
    'intranet.login.password': 'Contraseña:',
    'intranet.login.btn': 'Ingresar a mi Panel',
    'intranet.login.loading': 'Iniciando sesión...',
    'intranet.login.notice':
      'Acceso cerrado: Este portal no admite registro público. Si eres un artista miembro del colectivo, solicita tu cuenta al administrador.',
    'intranet.login.error.empty': 'Por favor ingresa tu usuario y contraseña.',
    'intranet.login.error.credentials': 'Credenciales no reconocidas. Verifica tu usuario y contraseña.',
    'intranet.login.error.rate_limit': 'Demasiados intentos fallidos. Por seguridad, espera unos momentos antes de reintentar.',
    'intranet.login.error.general': 'No se pudo conectar al servidor de autenticación. Intenta de nuevo.',
    'intranet.shortcut.tooltip': 'Ir a mi panel de intranet',
    'intranet.shortcut.artist': 'Artista',
    'intranet.dashboard.title': 'Panel de Creador',
    'intranet.dashboard.subtitle': 'Personaliza la información de tu tarjeta pública, actualiza tus redes y accede a tus herramientas exclusivas.',
    'intranet.dashboard.badge': 'INTRANET · PANEL DE CREADOR',
    'intranet.dashboard.welcome': 'Bienvenido, ',
    'intranet.dashboard.loading': 'Cargando panel de artista...',
    'intranet.dashboard.success': '¡Cambios guardados exitosamente en la base de datos!',
    'intranet.dashboard.save': 'Guardar Cambios en mi Tarjeta',
    'intranet.dashboard.saving': 'Guardando en base de datos...',
    'intranet.dashboard.logout': 'Cerrar Sesión',
    'intranet.dashboard.view_public': 'Ver mi tarjeta pública',
    'intranet.dashboard.tools.specku_title': 'Herramientas Exclusivas de Specku',
    'intranet.dashboard.tools.pay_title': 'Generador de Enlaces de Cobro PayPal',
    'intranet.dashboard.tools.pay_desc': 'Crea links de pago para tus comisiones con precios, descuentos y comisiones forzadas.',
    'intranet.dashboard.tools.pay_btn': 'Abrir Generador de Cobros →',
    'intranet.dashboard.tools.gallery_title': 'Muestras de la Galería',
    'intranet.dashboard.tools.gallery_desc': 'Revisa cómo se muestran tus estilos, bocetos y muestras de arte en tu catálogo interactivo.',
    'intranet.dashboard.tools.gallery_btn': 'Explorar mi Galería →',
    'intranet.dashboard.card_info': 'Información Pública de la Tarjeta',
    'intranet.dashboard.display_name': 'Nombre Artístico:',
    'intranet.dashboard.tagline': 'Tagline / Frase Destacada:',
    'intranet.dashboard.discipline': 'Disciplina / Especialidad:',
    'intranet.dashboard.bio': 'Biografía Corta:',
    'intranet.dashboard.brief': 'Mensaje / Brief Adicional:',
    'intranet.dashboard.accent_color': 'Color de Acento:',
    'intranet.dashboard.socials': 'Redes Sociales y Enlaces:',
    'intranet.dashboard.add_social': '+ Agregar Red Social',
    'intranet.dashboard.platform': 'Plataforma',
    'intranet.dashboard.url': 'URL / Enlace',
    'intranet.dashboard.label': 'Etiqueta visible',
    'intranet.dashboard.hide': 'Ocultar',
    'intranet.dashboard.remove': 'Eliminar',

    // sunlight commissions & 90s studio
    'sunlight.title': 'Comisiones de Sunlight Blue',
    'sunlight.subtitle': 'Música original personalizada, grabaciones en cassette de los 90s y portadas de discos vintage.',
    'sunlight.badge': 'SUNLIGHT BLUE RECORDS · STEREO ANÁLOGO',
    'sunlight.player.title': 'Reproductor de Cassette · Audio Hi-Fi',
    'sunlight.player.side_a': 'Lado A · Instrumental',
    'sunlight.player.side_b': 'Lado B · Voz y Letra',
    'sunlight.player.now_playing': 'REPRODUCIENDO',
    'sunlight.player.paused': 'EN PAUSA',
    'sunlight.player.stopped': 'CINTA DETENIDA',
    'sunlight.player.tape_label': 'SUNLIGHT BLUE · CASSETTE DE CROMO TIPO II',
    'sunlight.gallery.title': 'Portadas de Vinilos y Álbumes',
    'sunlight.gallery.subtitle': 'Haz clic en cualquier portada vintage para verla en detalle.',
    'sunlight.step.art': 'Arte Digital y Portadas de Discos',
    'sunlight.step.art.headshot': 'Headshot',
    'sunlight.step.art.headshot.desc': 'Retrato desde los hombros. Ideal para avatares, sencillos y perfiles.',
    'sunlight.step.art.fullbody': 'Busto / Cuerpo Completo',
    'sunlight.step.art.fullbody.desc': 'Medio cuerpo o figura completa con pose y estilo detallado.',
    'sunlight.step.art.illustration': 'Ilustración / Portada de Libro',
    'sunlight.step.art.illustration.desc': 'Ilustración de escena completa o portada de disco/libro (precio base, según complejidad).',
    'sunlight.step.song': 'Producción Musical Personalizada',
    'sunlight.step.song.instrumental': 'Pista Instrumental',
    'sunlight.step.song.instrumental.desc': 'Arreglo instrumental original compuesto a la medida de tu proyecto o video.',
    'sunlight.step.song.vocals': 'Voz con Letra',
    'sunlight.step.song.vocals.desc': 'Canción completa con letra personalizada, composición melódica y voces grabadas.',
    'sunlight.step.options': 'Detalles del Proyecto y Notas',
    'sunlight.lyrics.lang': 'Idioma de la letra:',
    'sunlight.lyrics.en': 'Inglés',
    'sunlight.lyrics.es': 'Español',
    'sunlight.summary.title': 'Recibo de Orden del Estudio',
    'sunlight.summary.empty': 'Selecciona un estilo de arte o canción para armar tu cotización.',
    'sunlight.total': 'Total',
    'sunlight.mxn': 'En pesos (MXN)',
    'sunlight.discord.action': 'Preparar mensaje para Discord',
    'sunlight.discord.send': 'Enviar a Sunlight Blue',
    'sunlight.discord.copied.title': '¡Cotización lista y copiada!',
    'sunlight.discord.copied.desc': 'El mensaje se ha copiado a tu portapapeles. Pulsa "Enviar" para contactar a Sunlight Blue en Discord (@sunlight_blue).',
    'sunlight.discord.msg.greeting': '¡Hola Sunlight Blue! Me gustaría cotizar un pedido:',
    'sam.tag': 'comisiones',
    'sam.note': 'Diseño de muestra — se modificará más adelante.',
  },
};

// Inverted dictionaries for bidirectional text lookup
const REVERSE_ES_TO_KEY: Record<string, string> = {};
const REVERSE_EN_TO_KEY: Record<string, string> = {};

for (const [key, val] of Object.entries(DICT.es)) {
  if (typeof val === 'string' && val.length > 0) {
    REVERSE_ES_TO_KEY[val.trim()] = key;
  }
}

for (const [key, val] of Object.entries(DICT.en)) {
  if (typeof val === 'string' && val.length > 0) {
    REVERSE_EN_TO_KEY[val.trim()] = key;
  }
}

function readLang(): Lang {
  let saved: string | null = null;
  try {
    if (typeof localStorage !== 'undefined') {
      saved = localStorage.getItem(LANG_KEY) || localStorage.getItem(ALT_LANG_KEY);
    }
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
        localStorage.setItem(ALT_LANG_KEY, next);
      } catch {
        // Safe against storage quota or security restrictions
      }
      return next;
    });

  const t = (textOrKey: string): string => {
    if (!textOrKey || typeof textOrKey !== 'string') return textOrKey;

    const trimmed = textOrKey.trim();

    // 1. Direct key hit in active language
    if (DICT[lang][textOrKey] !== undefined) {
      return DICT[lang][textOrKey];
    }
    if (DICT[lang][trimmed] !== undefined) {
      return DICT[lang][trimmed];
    }

    // 2. Direct key hit in English fallback
    if (DICT.en[textOrKey] !== undefined) {
      return DICT.en[textOrKey];
    }
    if (DICT.en[trimmed] !== undefined) {
      return DICT.en[trimmed];
    }

    // 3. Reverse hit: input matches an exact Spanish translation string
    const keyFromEs = REVERSE_ES_TO_KEY[trimmed];
    if (keyFromEs && DICT[lang][keyFromEs] !== undefined) {
      return DICT[lang][keyFromEs];
    }

    // 4. Reverse hit: input matches an exact English translation string
    const keyFromEn = REVERSE_EN_TO_KEY[trimmed];
    if (keyFromEn && DICT[lang][keyFromEn] !== undefined) {
      return DICT[lang][keyFromEn];
    }

    // 5. Unrecognized key/literal string fallback
    return textOrKey;
  };

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

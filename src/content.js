/**
 * ─────────────────────────────────────────────────────────────
 *  TIFFEXX — SITE CONTENT & CONFIG
 *  Every business fact on the site lives here. Nothing below was
 *  invented: anything we don't know yet is left empty and the UI
 *  adapts (e.g. reviews section shows an honest "be the first" state).
 * ─────────────────────────────────────────────────────────────
 */

export const LEADS = {
  // Where order / enquiry forms are sent. Fill ONE (checked in this order):
  // 1) endpoint: any service accepting JSON POST (e.g. Formspree "https://formspree.io/f/xxxx")
  endpoint: '',
  // 2) whatsapp: international format, digits only, e.g. '919876543210'
  whatsapp: '',
  // 3) email: opens the visitor's mail app with a pre-filled message
  email: '',
}

export const CONTACT = {
  phone: '', // e.g. '+91 98765 43210' — shown in footer when set
  email: '', // public contact email — shown in footer when set
  instagram: '', // full URL — shown in footer when set
}

// Service areas — from the Tiffexx service map artwork.
// x / y = pin position on the map image, in % (used for the interactive pins).
export const AREAS = [
  { id: 'ghaziabad', name: 'Ghaziabad', x: 23.9, y: 34.5 },
  { id: 'noida', name: 'Noida', x: 46.1, y: 64.5 },
  { id: 'greater-noida', name: 'Greater Noida', x: 77.4, y: 47.5 },
]

// What's in the tiffin — taken from the Tiffexx thali mascot artwork.
export const THALI = [
  { id: 'dal', name: 'Dal', hindi: 'दाल', note: 'Tadka on top, coriander on top of that.', color: '#E9A824' },
  { id: 'sabzi', name: 'Sabzi', hindi: 'सब्ज़ी', note: 'Seasonal veg, properly masala’d.', color: '#C7792B' },
  { id: 'paneer', name: 'Paneer', hindi: 'पनीर', note: 'Soft cubes, rich gravy.', color: '#E0562B' },
  { id: 'rice', name: 'Rice', hindi: 'चावल', note: 'Fluffy, every single grain.', color: '#F6EEDC' },
  { id: 'roti', name: 'Roti', hindi: 'रोटी', note: 'Folded, soft, a little charred.', color: '#D9A25F' },
  { id: 'sweet', name: 'Something sweet', hindi: 'मीठा', note: 'Because a meal isn’t done without it.', color: '#8B2E14' },
]

// Real customer reviews only. Leave empty until you have them.
// { name: 'Aditi', area: 'Noida', text: '…', source: 'Google' }
export const REVIEWS = [
  {
    name: 'Kunwar Shah',
    source: 'Google Play',
    rating: 5,
    text: 'I’m truly impressed with the homemade tiffin lunch and dinner service. The food is consistently delicious, well-balanced, and feels just like home-cooked meals. The quality of ingredients, taste, portion size, and hygiene are all excellent. Reliable service and great value — strongly recommended for anyone looking for healthy, tasty daily meals.',
  },
  {
    name: 'Namanji211',
    source: 'App Store',
    rating: 5,
    text: 'Their food is really good. Their food partners are genuine and verified. But they need to work on delivery apart from that, food, price and quality is surprisingly good. Just for the quality giving you 5 star guys',
  },
  {
    name: 'Digikhushi',
    source: 'App Store',
    rating: 5,
    text: 'Best tiffin service in noida. Taste , quality and quantity is so good.',
  },
  {
    name: 'Anita Wankhade',
    source: 'Google Play',
    rating: 5,
    text: 'so tasty food good service 😋',
  },
  {
    name: 'Meeta Saxena',
    source: 'Google Play',
    rating: 5,
    text: 'Excellent experience 💖 Highly recommend. 💖',
  },
]

export const FAQS = [
  {
    q: 'Where does Tiffexx deliver?',
    a: 'We currently serve Ghaziabad, Noida and Greater Noida. Check the Tiffexx app to see availability in your locality.',
  },
  {
    q: 'What comes in a Tiffexx thali?',
    a: 'Enjoy home-style Indian meals with a variety of dishes. Check the menu in the app to see exactly what’s included before ordering.',
  },
  {
    q: 'How much does a tiffin cost?',
    a: 'Explore the Tiffexx app for available meals, plans and their prices.',
  },
  {
    q: 'How do I order from Tiffexx?',
    a: 'Download the Tiffexx app, add your delivery address and explore the meals available in your area to place your order.',
  },
  {
    q: 'Where can I check the menu?',
    a: 'You can browse the available menu in the Tiffexx app and choose a meal that suits your taste.',
  },
];

export const NAV = [
  { href: '#inside', label: 'What’s inside' },
  { href: '#how', label: 'How it works' },
  { href: '#areas', label: 'Areas' },
  { href: '#faq', label: 'FAQ' },
]

// utils.ts

export const adjectives = [
  'Cosmic',
  'Abstract',
  'Digital',
  'Ethereal',
  'Vibrant',
  'Mystical',
  'Geometric',
  'Surreal',
  'Harmonic',
  'Radiant',
];
export const nouns = [
  'Dream',
  'Harmony',
  'Vision',
  'Journey',
  'Canvas',
  'Spectrum',
  'Realm',
  'Echo',
  'Pulse',
  'Aura',
];
export const descriptors = [
  'A unique digital artwork',
  'An algorithmic masterpiece',
  'A generative art piece',
  'A blockchain-ready creation',
  'An innovative NFT design',
];

export function generateRandomTitle(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000) + 1;
  return `${adj} ${noun} #${num}`;
}

export function generateRandomDescription(): string {
  const desc = descriptors[Math.floor(Math.random() * descriptors.length)];
  const extra = [
    'generated on GitHub Pages',
    'crafted with code',
    'born from algorithms',
    'inspired by the digital age',
  ][Math.floor(Math.random() * 4)];
  return `${desc} ${extra}.`;
}

export function logToPre(logEl: HTMLPreElement, ...args: any[]) {
  const message =
    args
      .map((a) =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      )
      .join(' ') + '\n';
  logEl.textContent += message;
  logEl.scrollTop = 1e9;
}
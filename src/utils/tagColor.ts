// Tag → color mapping for the Navi design system.
// Known tags are pinned explicitly so their colors never drift when the palette grows.
// Unknown tags fall back to hash-based assignment over the extra colors (dust/slate/moss).

const FIXED: Record<string, number> = {
  AI: 0,
  Notes: 1,
};

const PALETTE = [
  { color: 'var(--terra)', light: 'var(--terra-lt)' },
  { color: 'var(--sage)',  light: 'var(--sage-lt)'  },
  { color: 'var(--dust)',  light: 'var(--dust-lt)'  },
  { color: 'var(--slate)', light: 'var(--slate-lt)' },
  { color: 'var(--moss)',  light: 'var(--moss-lt)'  },
];

// Extra palette entries (indices 2+) used for unknown tags.
const EXTRA_START = 2;

function hashTag(tag: string): number {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h;
}

function getIndex(tag: string): number {
  if (tag in FIXED) return FIXED[tag];
  const extraCount = PALETTE.length - EXTRA_START;
  return EXTRA_START + (hashTag(tag) % extraCount);
}

export function getTagColor(tag: string): string {
  return PALETTE[getIndex(tag)].color;
}

export function getTagLightColor(tag: string): string {
  return PALETTE[getIndex(tag)].light;
}

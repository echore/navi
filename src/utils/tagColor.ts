// Palette order is fixed — only append to the end, never reorder.
// Reordering would change every tag's color assignment.
const PALETTE = [
  { color: 'var(--terra)', light: 'var(--terra-lt)' },
  { color: 'var(--sage)',  light: 'var(--sage-lt)'  },
  { color: 'var(--dust)',  light: 'var(--dust-lt)'  },
  { color: 'var(--slate)', light: 'var(--slate-lt)' },
  { color: 'var(--moss)',  light: 'var(--moss-lt)'  },
];

function getIndex(tag: string): number {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % PALETTE.length;
}

export function getTagColor(tag: string): string {
  return PALETTE[getIndex(tag)].color;
}

export function getTagLightColor(tag: string): string {
  return PALETTE[getIndex(tag)].light;
}

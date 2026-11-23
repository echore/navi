// Generates figures for the MIT 6.S191 note in the same visual language as
// public/assets/posts/ai-infra-from-zero-02/*.svg (840px wide, Arial, same palette).
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const C = {
  bg: '#FBFCFC', ink: '#2A241B', soft: '#647066', gray: '#F4F6F5',
  blueBg: '#E6F0F7', blue: '#6E98B9', greenBg: '#E1F1E9', green: '#348B73',
  orangeBg: '#FAEDD9', orange: '#C99355', rust: '#9A4E2C', line: '#CDD7D8',
};
const FONT = 'Arial, Helvetica, sans-serif';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Rough Arial width estimate, used to warn about text that overflows its box.
const widthOf = (s, size, w = 400) => {
  let u = 0;
  for (const ch of s.replace(/[_^]\{([^}]*)\}|[_^](.)/g, '$1$2')) {
    if ('il.,:;|!\'’ '.includes(ch)) u += 0.28;
    else if ('ftjr()[]'.includes(ch)) u += 0.34;
    else if ('mwMW'.includes(ch)) u += 0.84;
    else if (/[A-Z]/.test(ch)) u += 0.68;
    else if (/[0-9]/.test(ch)) u += 0.56;
    else u += 0.53;
  }
  return u * size * (w >= 600 ? 1.06 : 1);
};
const warnings = [];
const check = (fig, s, size, w, max) => {
  if (max && widthOf(s, size, w) > max) warnings.push(`${fig}: "${s}" ~${Math.round(widthOf(s, size, w))}px > ${max}px`);
};

// "x_1", "h_{t-1}", "0.5^{10}" -> tspans
const rich = (s, size) => {
  const parts = [];
  const re = /([_^])(\{([^}]*)\}|(.))/g;
  let last = 0, m, shift = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(`<tspan${shift ? ` dy="${-shift}"` : ''}>${esc(s.slice(last, m.index))}</tspan>`), shift = 0;
    const d = m[1] === '_' ? size * 0.3 : -size * 0.38;
    parts.push(`<tspan dy="${(d - shift).toFixed(1)}" font-size="${(size * 0.7).toFixed(1)}">${esc(m[3] ?? m[4])}</tspan>`);
    shift = d;
    last = re.lastIndex;
  }
  parts.push(`<tspan${shift ? ` dy="${(-shift).toFixed(1)}"` : ''}>${esc(s.slice(last))}</tspan>`);
  return parts.join('');
};

let FIG = '';
const T = (x, y, s, { size = 14, w = 400, a = 'start', fill = C.ink, max, italic = false } = {}) => {
  check(FIG, s, size, w, max);
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${w}" font-style="${italic ? 'italic' : 'normal'}" text-anchor="${a}" fill="${fill}">${rich(s, size)}</text>`;
};
const R = (x, y, w, h, rx, fill, stroke = 'none', sw = 1, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra} />`;
const P = (d, stroke, sw = 3, extra = '') => `<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra} />`;
const head = (x, y, ang, color, sw = 3, len = 10) => {
  const a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
  const p = (a) => `${(x + len * Math.cos(a)).toFixed(1)} ${(y + len * Math.sin(a)).toFixed(1)}`;
  return P(`M${p(a1)} L${x} ${y} L${p(a2)}`, color, sw);
};
const A = (x1, y1, x2, y2, color = C.orange, sw = 3, extra = '') =>
  P(`M${x1} ${y1} L${x2} ${y2}`, color, sw, extra) + head(x2, y2, Math.atan2(y2 - y1, x2 - x1), color, sw);
const title = (n, t, sub) => T(48, 47, `${n} / ${t}`, { size: 18, w: 600 }) + (sub ? T(48, 78, sub, { size: 15, fill: C.soft }) : '');
const band = (y, text, h = 46, sub) =>
  R(48, y, 744, h, 12, C.gray) +
  (sub
    ? T(70, y + 26, text, { size: 15, w: 500, max: 700 }) + T(70, y + 47, sub, { size: 13, fill: C.soft, max: 700 })
    : T(420, y + h / 2 + 5, text, { size: 15, w: 500, a: 'middle', max: 720 }));
// Card with colored tab, title, and sub lines
const card = (x, y, w, h, bg, accent, t, subs = [], { tsize = 16, center = false } = {}) => {
  const tx = center ? x + w / 2 : x + 18, a = center ? 'middle' : 'start';
  let s = R(x, y, w, h, 16, bg);
  if (!center) s += R(x + 18, y + 18, 40, 6, 3, accent);
  const ty = center ? y + h / 2 - (subs.length ? 10 * subs.length : -6) : y + 52;
  s += T(tx, ty, t, { size: tsize, w: 600, a, max: w - 28 });
  subs.forEach((sub, i) => (s += T(tx, ty + 24 + i * 19, sub, { size: 13, fill: C.soft, a, max: w - 28 })));
  return s;
};
const svg = (name, h, body) => {
  const out = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${h}" viewBox="0 0 840 ${h}" role="img"><rect width="840" height="${h}" fill="${C.bg}" /><g>${body}</g></svg>\n`;
  writeFileSync(`${OUT}/${name}.svg`, out);
};

// ---------- 01 · one neuron ----------
FIG = 'figure-01';
{
  let b = title('01', 'One Artificial Neuron', 'Weighted inputs, plus a bias, then an activation function.');
  const ins = [['x_1', 'weather', 'w_1'], ['x_2', 'price', 'w_2'], ['x_3', 'holiday', 'w_3']];
  ins.forEach(([x, lab, w], i) => {
    const y = 120 + i * 72;
    b += R(48, y, 168, 50, 12, C.blueBg) + T(68, y + 31, x, { size: 17, w: 600 }) + T(104, y + 31, lab, { size: 14, fill: C.soft });
    b += A(222, y + 25, 384, 219 + (i - 1) * 16, C.blue, 2.5);
    b += T(300, y + 25 + (219 + (i - 1) * 16 - y - 25) / 2 - 8, w, { size: 15, w: 600, fill: C.blue, a: 'middle' });
  });
  b += R(398, 164, 176, 110, 18, C.greenBg) + T(486, 206, 'z = Σ w_ix_i + b', { size: 18, w: 600, a: 'middle', max: 160 });
  b += T(486, 236, 'weighted sum', { size: 13, fill: C.soft, a: 'middle' }) + T(486, 256, 'plus bias', { size: 13, fill: C.soft, a: 'middle' });
  b += A(578, 219, 616, 219, C.orange);
  b += R(624, 184, 92, 70, 16, C.orangeBg) + T(670, 225, 'f(z)', { size: 19, w: 600, a: 'middle' });
  b += A(720, 219, 744, 219, C.orange);
  b += R(750, 194, 42, 50, 12, C.green) + T(771, 226, 'a', { size: 19, w: 600, a: 'middle', fill: '#fff' });
  b += T(486, 146, 'b = a learned base level', { size: 13, fill: C.soft, a: 'middle' });
  b += T(670, 168, 'nonlinearity', { size: 13, fill: C.soft, a: 'middle' });
  b += band(338, 'Weights set how much each input matters. The bias sets the starting point.');
  svg(FIG, 414, b);
}

// ---------- 02 · training loop ----------
FIG = 'figure-02';
{
  let b = title('02', 'One Training Step', 'The forward pass only computes. Parameters change after the backward pass.');
  const steps = [
    [C.blueBg, C.blue, 'Input', ['a batch of', 'examples']],
    [C.blueBg, C.blue, 'Forward', ['current weights', '→ prediction']],
    [C.orangeBg, C.orange, 'Loss', ['prediction vs.', 'target']],
    [C.greenBg, C.green, 'Backprop', ['chain rule', '→ gradients']],
    [C.greenBg, C.green, 'Update', ['optimizer step', 'w ← w − η∂L/∂w']],
  ];
  const w = 130, gap = 23.5;
  steps.forEach(([bg, ac, t, subs], i) => {
    const x = 48 + i * (w + gap);
    b += card(x, 118, w, 136, bg, ac, t, subs);
    if (i < 4) b += A(x + w + 3, 186, x + w + gap - 3, 186, C.orange, 2.5);
  });
  const lx = 48 + 4 * (w + gap) + w / 2;
  b += P(`M${lx} 258 L${lx} 300 Q${lx} 312 ${lx - 12} 312 L${48 + w / 2 + 12} 312 Q${48 + w / 2} 312 ${48 + w / 2} 300 L${48 + w / 2} 266`, C.soft, 2, ' stroke-dasharray="6 6"');
  b += head(48 + w / 2, 260, -Math.PI / 2, C.soft, 2);
  b += T(420, 302, 'repeat on many batches with the updated weights', { size: 13, fill: C.soft, a: 'middle' });
  b += band(340, 'η is the learning rate: how big a step the optimizer takes along the gradient.');
  svg(FIG, 416, b);
}

// ---------- 03 · RNN unrolled ----------
FIG = 'figure-03';
{
  let b = title('03', 'An RNN Carries a Hidden State', 'The same cell runs at every step and passes a summary forward.');
  const xs = [96, 280, 464, 648];
  b += T(48, 200, 'h_0', { size: 15, w: 600, fill: C.orange });
  xs.forEach((x, i) => {
    b += R(x, 150, 120, 84, 18, C.greenBg) + T(x + 60, 188, 'cell', { size: 16, w: 600, a: 'middle' }) + T(x + 60, 212, `h_${i + 1} = f(x_${i + 1}, h_${i})`, { size: 12.5, fill: C.soft, a: 'middle', max: 112 });
    b += R(x + 22, 290, 76, 44, 12, C.blueBg) + T(x + 60, 318, `x_${i + 1}`, { size: 16, w: 600, a: 'middle' });
    b += A(x + 60, 288, x + 60, 240, C.blue, 2.5);
    b += T(x + 60, 356, `frame ${i + 1}`, { size: 12.5, fill: C.soft, a: 'middle' });
    if (i === 0) b += A(76, 192, x - 4, 192, C.orange);
    else b += A(xs[i - 1] + 124, 192, x - 4, 192, C.orange) + T((xs[i - 1] + 120 + x) / 2, 178, `h_${i}`, { size: 14, w: 600, fill: C.orange, a: 'middle' });
  });
  b += A(772, 192, 800, 192, C.orange) + T(782, 178, 'h_4', { size: 14, w: 600, fill: C.orange, a: 'middle' });
  b += band(380, 'Hidden state: changes along the sequence. Hidden layer: a fixed part of the network.');
  svg(FIG, 456, b);
}

// ---------- 04 · vanishing gradient ----------
FIG = 'figure-04';
{
  let b = title('04', 'Why Distant Signals Fade', 'If each step back multiplies the gradient by 0.5 (a teaching assumption).');
  const base = 316, maxH = 190, bw = 44, gap = 22;
  for (let k = 0; k <= 10; k++) {
    const v = 0.5 ** k, h = Math.max(maxH * v, 2), x = 64 + k * (bw + gap);
    b += R(x, base - h, bw, h, 5, k === 0 ? C.green : C.blue);
    b += T(x + bw / 2, base + 22, `${k}`, { size: 13, w: 600, a: 'middle' });
    if ([0, 1, 2, 3, 10].includes(k)) b += T(x + bw / 2, base - h - 10, k === 10 ? '≈0.001' : String(v), { size: 13, w: 500, a: 'middle', fill: k === 10 ? C.rust : C.ink });
  }
  b += T(64, base + 44, 'steps back in time', { size: 13, fill: C.soft });
  b += A(700, base + 40, 300, base + 40, C.orange, 2.5);
  b += T(712, base + 44, 'BPTT', { size: 13, w: 600, fill: C.orange });
  b += band(388, 'After ten steps, about 0.001 of the learning signal reaches the earliest input.');
  svg(FIG, 464, b);
}

// ---------- 05 · attention ----------
FIG = 'figure-05';
{
  let b = title('05', 'Attention Mixes Information by Weight', 'Illustrative weights when the model reads “it”. They add up to 1.');
  const toks = [['This', .14], ['book', .52], ['is', .04], ['thick,', .12], ['but', .03], ['it', .08], ['reads', .05], ['easily.', .02]];
  const ws = toks.map(([t]) => Math.max(56, widthOf(t, 16, 600) + 30));
  const total = ws.reduce((a, c) => a + c, 0) + (toks.length - 1) * 10;
  let x = 420 - total / 2;
  const pos = toks.map((t, i) => { const p = x; x += ws[i] + 10; return p; });
  const qi = 5, qx = pos[qi] + ws[qi] / 2;
  toks.forEach(([t, w], i) => {
    const cx = pos[i] + ws[i] / 2;
    if (i !== qi) {
      const peak = 200 - Math.min(80, Math.abs(cx - qx) * 0.28);
      b += `<path d="M${qx} 228 Q${(qx + cx) / 2} ${peak - 30} ${cx} 228" stroke="${C.green}" stroke-width="${(1 + w * 14).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${(0.35 + w).toFixed(2)}" />`;
    }
  });
  toks.forEach(([t, w], i) => {
    const cx = pos[i] + ws[i] / 2;
    b += R(pos[i], 232, ws[i], 44, 12, i === qi ? C.orange : C.blueBg) + T(cx, 260, t, { size: 16, w: 600, a: 'middle', fill: i === qi ? '#fff' : C.ink });
    const h = w * 150;
    b += R(cx - 14, 400 - h, 28, Math.max(h, 2), 4, i === qi ? C.orange : C.green);
    b += T(cx, 400 - h - 8, w.toFixed(2), { size: 12.5, w: 500, a: 'middle' });
  });
  b += T(qx, 298, 'query', { size: 12, fill: C.soft, a: 'middle' });
  b += P(`M48 401 L792 401`, C.line, 1);
  b += band(424, 'Output for “it” = Σ weight × value: a blend of many positions, not one chosen word.');
  svg(FIG, 500, b);
}

// ---------- 06 · CNN ----------
FIG = 'figure-06';
{
  let b = title('06', 'One Filter, Every Position', 'A small learned filter slides across the image and reuses the same weights.');
  const cs = 24, gx = 48, gy = 110;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++)
    b += R(gx + c * cs, gy + r * cs, cs - 2, cs - 2, 3, c >= 4 ? C.blue : C.blueBg);
  b += R(gx + 0 * cs - 2, gy + 1 * cs - 2, cs * 3 + 2, cs * 3 + 2, 6, 'none', C.orange, 3);
  b += R(gx + 3 * cs - 2, gy + 3 * cs - 2, cs * 3 + 2, cs * 3 + 2, 6, 'none', C.orange, 3, ' stroke-dasharray="5 4"');
  b += T(gx + 96, gy + 7 * cs + 26, 'Input image', { size: 14, w: 600, a: 'middle' });
  b += T(gx + 96, gy + 7 * cs + 46, 'same filter, two positions', { size: 12.5, fill: C.soft, a: 'middle' });
  b += A(262, 194, 318, 194, C.orange);
  const fx = 330, fy = 140, fs = 36, vals = [-1, 0, 1];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    b += R(fx + c * fs, fy + r * fs, fs - 3, fs - 3, 6, C.orangeBg) + T(fx + c * fs + 16, fy + r * fs + 23, String(vals[c]), { size: 14, w: 600, a: 'middle' });
  b += T(fx + 53, gy + 7 * cs + 26, '3×3 filter', { size: 14, w: 600, a: 'middle' });
  b += T(fx + 53, gy + 7 * cs + 46, 'detects vertical edges', { size: 12.5, fill: C.soft, a: 'middle' });
  b += A(450, 194, 506, 194, C.orange);
  const mx = 520, my = 122, ms = 26;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++)
    b += R(mx + c * ms, my + r * ms, ms - 2, ms - 2, 3, c === 2 ? C.green : C.greenBg);
  b += T(mx + 78, gy + 7 * cs + 26, 'Feature map', { size: 14, w: 600, a: 'middle' });
  b += T(mx + 78, gy + 7 * cs + 46, 'high where the edge is', { size: 12.5, fill: C.soft, a: 'middle' });
  const chips = ['Edges', 'Textures', 'Parts', 'Objects'];
  chips.forEach((t, i) => {
    const x = 48 + i * 196;
    b += R(x, 350, 156, 40, 20, [C.blueBg, C.blueBg, C.greenBg, C.greenBg][i]) + T(x + 78, 375, t, { size: 15, w: 600, a: 'middle' });
    if (i < 3) b += A(x + 162, 370, x + 190, 370, C.soft, 2);
  });
  b += T(420, 418, 'Shallow layers ──────── deeper layers combine simpler patterns', { size: 13, fill: C.soft, a: 'middle' });
  svg(FIG, 446, b);
}

// ---------- 07 · autoencoder vs VAE ----------
FIG = 'figure-07';
{
  let b = title('07', 'A Point Versus a Distribution', 'An autoencoder encodes one point. A VAE encodes a distribution to sample from.');
  const row = (y, label, latent, bg) => {
    let s = T(48, y + 8, label, { size: 15, w: 600 });
    const cy = y + 62;
    s += R(48, cy - 26, 64, 52, 12, C.blueBg) + T(80, cy + 6, 'x', { size: 18, w: 600, a: 'middle' });
    s += A(116, cy, 146, cy, C.soft, 2);
    s += `<path d="M152 ${cy - 40} L262 ${cy - 22} L262 ${cy + 22} L152 ${cy + 40} Z" fill="${C.blueBg}" />` + T(204, cy + 5, 'Encoder', { size: 14, w: 600, a: 'middle' });
    s += A(268, cy, 298, cy, C.soft, 2);
    s += latent(304, cy);
    s += A(540, cy, 570, cy, C.soft, 2);
    s += `<path d="M576 ${cy - 22} L686 ${cy - 40} L686 ${cy + 40} L576 ${cy + 22} Z" fill="${C.greenBg}" />` + T(632, cy + 5, 'Decoder', { size: 14, w: 600, a: 'middle' });
    s += A(692, cy, 722, cy, C.soft, 2);
    s += R(728, cy - 26, 64, 52, 12, C.greenBg) + T(760, cy + 6, 'x̂', { size: 18, w: 600, a: 'middle' });
    return s;
  };
  b += row(110, 'AUTOENCODER', (x, cy) =>
    R(x, cy - 40, 230, 80, 16, C.orangeBg) + `<circle cx="${x + 40}" cy="${cy}" r="7" fill="${C.orange}" />` + T(x + 62, cy - 4, 'z = 5', { size: 16, w: 600 }) + T(x + 62, cy + 18, 'one fixed point', { size: 13, fill: C.soft }), C.orangeBg);
  b += row(262, 'VAE', (x, cy) => {
    let pts = [];
    for (let i = 0; i <= 40; i++) { const t = -3 + i * 0.15; pts.push(`${(x + 18 + i * 1.6).toFixed(1)} ${(cy + 22 - 38 * Math.exp(-t * t / 2)).toFixed(1)}`); }
    return R(x, cy - 40, 230, 80, 16, C.orangeBg) + P(`M${pts.join(' L')}`, C.orange, 2.5) + `<circle cx="${x + 56}" cy="${cy + 22}" r="4" fill="${C.rust}" />` +
      T(x + 96, cy - 10, 'μ = 5, σ = 1', { size: 15, w: 600 }) + T(x + 96, cy + 12, 'sample z ~ N(μ, σ^2)', { size: 13, fill: C.soft, max: 128 });
  }, C.orangeBg);
  b += band(388, 'Generating later: sample z from the prior, such as N(0, 1), and decode it.');
  svg(FIG, 464, b);
}

// ---------- 08 · reparameterization ----------
FIG = 'figure-08';
{
  let b = title('08', 'The Reparameterization Trick', 'Move the randomness to ε so the gradient can reach μ and σ.');
  const panel = (x, label, sub) => R(x, 104, 362, 248, 18, C.gray) + T(x + 22, 136, label, { size: 15, w: 600 }) + T(x + 22, 158, sub, { size: 13, fill: C.soft });
  b += panel(48, 'SAMPLE INSIDE THE PATH', 'z ~ N(μ, σ^2)');
  b += R(72, 190, 96, 46, 12, C.blueBg) + T(120, 219, 'μ, σ', { size: 16, w: 600, a: 'middle' });
  b += A(172, 213, 204, 213, C.soft, 2);
  b += R(210, 190, 110, 46, 12, C.orangeBg) + T(265, 219, 'random draw', { size: 14, w: 600, a: 'middle' });
  b += A(324, 213, 352, 213, C.soft, 2);
  b += R(358, 190, 38, 46, 12, C.greenBg) + T(377, 219, 'z', { size: 16, w: 600, a: 'middle' });
  b += P('M330 282 L130 282', C.rust, 2.5, ' stroke-dasharray="6 5"') + T(234, 272, '✕', { size: 22, w: 600, fill: C.rust, a: 'middle' });
  b += T(229, 312, 'no clean gradient path back', { size: 13, fill: C.rust, a: 'middle' });
  b += panel(430, 'REPARAMETERIZED', 'ε ~ N(0, 1),  z = μ + σε');
  b += R(454, 190, 96, 46, 12, C.blueBg) + T(502, 219, 'μ, σ', { size: 16, w: 600, a: 'middle' });
  b += A(554, 213, 590, 213, C.soft, 2);
  b += R(596, 190, 120, 46, 12, C.greenBg) + T(656, 219, 'z = μ + σε', { size: 15, w: 600, a: 'middle' });
  b += R(612, 262, 88, 36, 12, C.orangeBg) + T(656, 286, 'ε ~ N(0, 1)', { size: 13, w: 600, a: 'middle' });
  b += A(656, 258, 656, 242, C.orange, 2);
  b += P('M640 248 Q600 300 512 248', C.green, 2.5, ' stroke-dasharray="6 5"') + head(512, 248, Math.atan2(248 - 280, 512 - 540), C.green, 2.5);
  b += T(560, 322, 'gradient flows to μ and σ', { size: 13, fill: C.green, a: 'middle' });
  b += band(372, 'For a fixed ε, z is a differentiable function of μ and σ.');
  svg(FIG, 448, b);
}

// ---------- 09 · ELBO trade-off ----------
FIG = 'figure-09';
{
  let b = title('09', 'Two Terms Pull in Different Directions', 'The VAE loss balances reconstruction against a regular latent space.');
  b += card(48, 104, 362, 120, C.blueBg, C.blue, 'Reconstruction term', ['Can the decoder rebuild x from z?', 'Keeps useful detail in z.']);
  b += card(430, 104, 362, 120, C.greenBg, C.green, 'KL term', ['Does q(z|x) stay close to the prior p(z)?', 'Keeps the latent space easy to sample.']);
  b += P('M80 290 L760 290', C.line, 4);
  [[110, 'KL too weak', 'sharp reconstructions,', 'gaps in latent space'], [420, 'Balanced', 'reasonable detail,', 'useful samples'], [730, 'KL too strong', 'tidy latent space,', 'lost detail']].forEach(([x, t, s1, s2], i) => {
    b += `<circle cx="${x}" cy="290" r="${i === 1 ? 11 : 8}" fill="${i === 1 ? C.orange : C.soft}" />`;
    b += T(x, 326, t, { size: 15, w: 600, a: 'middle' }) + T(x, 348, s1, { size: 13, fill: C.soft, a: 'middle' }) + T(x, 367, s2, { size: 13, fill: C.soft, a: 'middle' });
  });
  b += T(80, 274, 'weaker constraint', { size: 12, fill: C.soft }) + T(760, 274, 'stronger constraint', { size: 12, fill: C.soft, a: 'end' });
  svg(FIG, 400, b);
}

// ---------- 10 · GAN ----------
FIG = 'figure-10';
{
  let b = title('10', 'Two Networks Train Against Each Other', 'The generator tries to fool the discriminator. The discriminator tries not to be fooled.');
  b += '<g transform="translate(0 34)">';
  b += R(48, 140, 100, 56, 12, C.gray) + T(98, 166, 'noise', { size: 15, w: 600, a: 'middle' }) + T(98, 185, 'random input', { size: 12, fill: C.soft, a: 'middle' });
  b += A(152, 168, 186, 168, C.soft, 2);
  b += card(192, 116, 170, 104, C.blueBg, C.blue, 'Generator', ['makes a sample']);
  b += A(366, 168, 412, 192, C.soft, 2);
  b += R(250, 260, 112, 56, 12, C.greenBg) + T(306, 286, 'real data', { size: 15, w: 600, a: 'middle' }) + T(306, 305, 'from the dataset', { size: 12, fill: C.soft, a: 'middle' });
  b += A(366, 288, 412, 230, C.soft, 2);
  b += card(418, 158, 190, 104, C.orangeBg, C.orange, 'Discriminator', ['real or generated?']);
  b += A(612, 210, 646, 210, C.soft, 2);
  b += R(652, 184, 140, 52, 12, C.gray) + T(722, 216, 'P(real)', { size: 16, w: 600, a: 'middle' });
  b += P('M722 180 Q722 92 520 92 L290 92 L290 108', C.blue, 2, ' stroke-dasharray="6 5"') + head(290, 112, Math.PI / 2, C.blue, 2);
  b += T(520, 84, 'generator update: make samples it calls real', { size: 12.5, fill: C.blue, a: 'middle' });
  b += P('M722 240 Q722 296 600 296 L540 296 L540 270', C.orange, 2, ' stroke-dasharray="6 5"') + head(540, 266, -Math.PI / 2, C.orange, 2);
  b += T(640, 316, 'discriminator update: tell them apart', { size: 12.5, fill: C.orange, a: 'middle' });
  b += band(348, 'VAE: probabilistic latent variables and reconstruction. GAN: an adversarial objective.');
  b += '</g>';
  svg(FIG, 458, b);
}

// ---------- 11 · RL loop + Q example ----------
FIG = 'figure-11';
{
  let b = title('11', 'Immediate Reward Versus Return', 'Q(s, a) estimates the discounted reward that follows an action. γ = 0.9.');
  b += card(48, 110, 150, 84, C.blueBg, C.blue, 'Agent', ['policy π(a|s)']);
  b += card(48, 256, 150, 84, C.greenBg, C.green, 'Environment', ['state changes']);
  b += P('M204 152 Q262 152 262 210 L262 290 Q262 298 254 298 L206 298', C.orange, 2.5) + head(204, 298, Math.PI, C.orange, 2.5);
  b += T(272, 230, 'action a', { size: 13, w: 600, fill: C.orange });
  b += P('M42 298 Q20 298 20 240 L20 160 Q20 152 34 152 L42 152', C.blue, 2.5) + head(44, 152, 0, C.blue, 2.5);
  b += T(26, 220, 's, r', { size: 13, w: 600, fill: C.blue });
  const path = (y, name, r1, r2, ret, best) => {
    let s = T(380, y + 30, name, { size: 17, w: 600 });
    s += R(420, y, 120, 50, 12, C.blueBg) + T(480, y + 22, 'now', { size: 12, fill: C.soft, a: 'middle' }) + T(480, y + 40, r1, { size: 15, w: 600, a: 'middle' });
    s += A(544, y + 25, 572, y + 25, C.soft, 2);
    s += R(578, y, 120, 50, 12, C.blueBg) + T(638, y + 22, 'next step', { size: 12, fill: C.soft, a: 'middle' }) + T(638, y + 40, r2, { size: 15, w: 600, a: 'middle' });
    s += R(712, y, 80, 50, 12, best ? C.orange : C.gray) + T(752, y + 22, 'return', { size: 12, fill: best ? '#fff' : C.soft, a: 'middle' }) + T(752, y + 41, ret, { size: 17, w: 600, a: 'middle', fill: best ? '#fff' : C.ink });
    return s;
  };
  b += path(124, 'A', '+5', '0', '5', false);
  b += path(212, 'B', '0', '+10 × 0.9', '9', true);
  b += T(420, 300, 'B earns nothing at first but has the higher return.', { size: 13, fill: C.soft });
  b += band(364, 'Return G = r_{t+1} + γr_{t+2} + γ^2r_{t+3} + …');
  svg(FIG, 440, b);
}

// ---------- 12 · credit assignment ----------
FIG = 'figure-12';
{
  let b = title('12', 'Which Step Earned the Reward?', 'A coding agent gets one signal at the end of a long task.');
  const steps = ['Read the task', 'Edit files', 'Run tests', 'Find the error', 'Fix it', 'Tests pass'];
  const w = 112, gap = 14.4;
  steps.forEach((t, i) => {
    const x = 48 + i * (w + gap), last = i === steps.length - 1;
    b += R(x, 200, w, 58, 14, last ? C.green : C.blueBg) + T(x + w / 2, 234, t, { size: 13.5, w: 600, a: 'middle', fill: last ? '#fff' : C.ink, max: w - 8 });
    if (i < steps.length - 1) b += A(x + w + 2, 229, x + w + gap - 2, 229, C.soft, 2);
    if (!last) {
      const ex = 48 + 5 * (w + gap) + 14 + i * 21, cx = x + w / 2;
      b += `<path d="M${ex} 196 Q${(ex + cx) / 2} ${172 - (5 - i) * 16} ${cx} 196" stroke="${C.orange}" stroke-width="2" fill="none" stroke-dasharray="5 5" />`;
      b += T(cx, 190, '?', { size: 15, w: 600, fill: C.orange, a: 'middle' });
    }
  });
  b += T(48 + 5 * (w + gap) + w / 2, 284, 'reward +1', { size: 13, w: 600, fill: C.green, a: 'middle' });
  b += band(316, 'Credit assignment: spread a late reward back to the decisions that made success likely.');
  svg(FIG, 392, b);
}

console.log(warnings.length ? warnings.join('\n') : 'no overflow warnings');

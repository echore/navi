// Generates figures for the MIT 6.S087 note in the same visual language as
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


// ---------- pixel-image helpers (for diffusion and similarity figures) ----------
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
const N = 10;
const NOISE = Array.from({ length: N }, () => Array.from({ length: N + 2 }, () => { const g = 70 + rnd() * 175; return [g, g * (0.92 + rnd() * 0.12), g * (0.9 + rnd() * 0.14)].map(v => Math.min(255, Math.round(v))); }));
const scene = (r, c) => {
  if ((r - 2.6) ** 2 + (c - 6.6) ** 2 < 2.6) return rgb(C.orange);
  if (r > 6.2 + 1.1 * Math.sin(c * 0.7)) return rgb(C.green);
  if (r === 5 && c >= 1 && c <= 3) return rgb(C.blue);
  return rgb(C.blueBg);
};
// draw an N×N pixel image; level 0 = clean, 1 = pure noise; shift moves the scene right by whole cells
const pix = (x, y, size, level = 0, { shift = 0, noiseOnly = false, diffWith = null } = {}) => {
  const cs = size / N;
  let s = R(x - 3, y - 3, size + 6, size + 6, 8, '#fff', C.line, 1);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const base = scene(r, c - shift), nz = NOISE[r][c];
    let col = noiseOnly ? mix(nz, nz, 0) : mix(base, nz, level);
    if (diffWith !== null) {
      const other = scene(r, c - diffWith);
      col = other.join() === base.join() ? '#EEF1F0' : C.rust;
    }
    s += `<rect x="${(x + c * cs).toFixed(1)}" y="${(y + r * cs).toFixed(1)}" width="${(cs + 0.3).toFixed(1)}" height="${(cs + 0.3).toFixed(1)}" fill="${col}" />`;
  }
  return s;
};
const pill = (x, y, w, t, bg, { size = 14, fill = C.ink, h = 36 } = {}) => R(x, y, w, h, h / 2, bg) + T(x + w / 2, y + h / 2 + size * 0.36, t, { size, w: 600, a: 'middle', fill, max: w - 16 });

// ---------- 01 · task-specific vs foundation ----------
FIG = 'figure-01';
{
  let b = title('01', 'One Task, One Model Versus One Model, Many Tasks', 'A foundation model starts from broad pretraining and becomes the starting point for many tasks.');
  b += R(48, 104, 330, 250, 18, C.gray) + T(70, 136, 'TASK-SPECIFIC', { size: 15, w: 600 });
  [['labeled emails', 'spam model'], ['labeled photos', 'cat model'], ['labeled reviews', 'sentiment model']].forEach(([d, m], i) => {
    const y = 160 + i * 60;
    b += pill(70, y, 130, d, C.blueBg, { size: 13 }) + A(206, y + 18, 228, y + 18, C.soft, 2) + pill(234, y, 124, m, C.orangeBg, { size: 13 });
  });
  b += R(398, 104, 394, 250, 18, C.gray) + T(420, 136, 'FOUNDATION MODEL', { size: 15, w: 600 });
  b += card(420, 158, 110, 110, C.blueBg, C.blue, 'Broad data', ['text, images,', 'code, more']);
  b += A(534, 213, 556, 213, C.orange, 2.5);
  b += card(562, 158, 96, 110, C.greenBg, C.green, 'Pretrain', ['one set of', 'parameters']);
  ['Q&A', 'Translation', 'Summary', 'Other tasks'].forEach((t, i) => {
    const y = 152 + i * 46;
    b += P(`M662 213 Q680 213 690 ${y + 16}`, C.soft, 1.6) + pill(694, y, 86, t, C.orangeBg, { size: 12.5, h: 32 });
  });
  b += T(420, 300, '“General” means a shared starting point,', { size: 12.5, fill: C.soft });
  b += T(420, 319, 'not “good at everything”.', { size: 12.5, fill: C.soft });
  b += band(374, 'Results still depend on the data, the objective, later adaptation, and the use case.');
  svg(FIG, 450, b);
}

// ---------- 02 · supervised vs self-supervised ----------
FIG = 'figure-02';
{
  let b = title('02', 'Where the Training Signal Comes From', 'Supervised labels come from people. Self-supervised targets come from the data itself.');
  b += R(48, 104, 362, 220, 18, C.blueBg) + R(66, 122, 40, 6, 3, C.blue) + T(66, 156, 'Supervised', { size: 16, w: 600 });
  b += pix(76, 182, 96, 0);
  b += A(186, 230, 226, 230, C.orange, 2.5);
  b += pill(234, 212, 92, '“cat”', '#fff', { size: 16 });
  b += T(280, 272, 'label written by a person', { size: 12.5, fill: C.soft, a: 'middle' });
  b += R(430, 104, 362, 220, 18, C.greenBg) + R(448, 122, 40, 6, 3, C.green) + T(448, 156, 'Self-supervised', { size: 16, w: 600 });
  const words = ['The', 'cat', 'sat', 'on', 'the'];
  let x = 450;
  words.forEach(w => { const ww = widthOf(w, 15, 600) + 18; b += R(x, 196, ww, 34, 9, '#fff') + T(x + ww / 2, 218, w, { size: 15, w: 600, a: 'middle' }); x += ww + 6; });
  b += R(x, 196, 50, 34, 9, 'none', C.orange, 2, ' stroke-dasharray="4 4"') + T(x + 25, 218, '?', { size: 15, w: 600, a: 'middle', fill: C.orange });
  b += A(x + 25, 236, x + 25, 258, C.orange, 2);
  b += pill(x - 14, 262, 78, '“mat”', C.orange, { size: 15, fill: '#fff', h: 32 });
  b += T(450, 286, 'target = the next token', { size: 12.5, fill: C.soft }) + T(450, 305, 'already in the text', { size: 12.5, fill: C.soft });
  b += band(344, 'Self-supervised does not mean “no target”. The data supplies the supervision signal.');
  svg(FIG, 420, b);
}

// ---------- 03 · training stages ----------
FIG = 'figure-03';
{
  let b = title('03', 'Three Stages, Three Different Jobs', 'Each stage changes the model for a different reason.');
  const st = [
    [C.blueBg, C.blue, 'Pretraining', ['Learn statistical structure', 'and transferable', 'representations at scale']],
    [C.orangeBg, C.orange, 'Fine-tuning', ['Instruction tuning: fit', 'specific tasks and', 'instruction formats']],
    [C.greenBg, C.green, 'Preference / RL', ['Adjust behavior: style,', 'instruction following,', 'task performance']],
  ];
  st.forEach(([bg, ac, t, subs], i) => {
    const x = 48 + i * 256;
    b += card(x, 108, 232, 150, bg, ac, t, subs);
    if (i < 2) b += A(x + 236, 183, x + 252, 183, C.orange, 2.5);
  });
  b += band(282, 'Learning many patterns does not mean answering the way users want.');
  svg(FIG, 358, b);
}

// ---------- 04 · text-to-text ----------
FIG = 'figure-04';
{
  let b = title('04', 'Every Task as Text In, Text Out', 'Classification, translation, and summarization share one interface.');
  const rows = [['Sentiment: this movie is great', 'positive'], ['Translate to French: Good morning', 'Bonjour'], ['Summarize: [long article]', '[short summary]']];
  b += R(392, 110, 120, 200, 18, C.greenBg) + T(452, 204, 'one', { size: 16, w: 600, a: 'middle' }) + T(452, 226, 'model', { size: 16, w: 600, a: 'middle' });
  rows.forEach(([i, o], k) => {
    const y = 118 + k * 66;
    b += R(48, y, 300, 46, 12, C.blueBg) + T(66, y + 29, i, { size: 14, w: 500, max: 270 });
    b += A(352, y + 23, 386, y + 23, C.soft, 2);
    b += A(516, y + 23, 550, y + 23, C.soft, 2);
    b += R(556, y, 236, 46, 12, C.orangeBg) + T(574, y + 29, o, { size: 15, w: 600 });
  });
  b += T(198, 102, 'INPUT TEXT', { size: 12, w: 600, fill: C.soft, a: 'middle' }) + T(674, 102, 'OUTPUT TEXT', { size: 12, w: 600, fill: C.soft, a: 'middle' });
  b += band(334, 'The task interface is shared. The computation inside different architectures is not.');
  svg(FIG, 410, b);
}

// ---------- 05 · T5 vs GPT ----------
FIG = 'figure-05';
{
  let b = title('05', 'Encoder-Decoder Versus Decoder-Only', 'Both can generate text. They read the input in different ways.');
  b += R(48, 104, 362, 270, 18, C.gray) + T(70, 136, 'T5 · ENCODER-DECODER', { size: 15, w: 600 }) + T(70, 158, 'objective: restore corrupted or masked spans', { size: 12.5, fill: C.soft });
  b += pill(70, 176, 150, 'Thank you <X> me', C.blueBg, { size: 12, h: 32 });
  b += A(145, 212, 145, 228, C.soft, 2);
  b += card(70, 234, 150, 112, C.blueBg, C.blue, 'Encoder', ['reads all of the', 'input at once']);
  b += A(224, 290, 250, 290, C.orange, 2.5);
  b += card(256, 234, 136, 112, C.greenBg, C.green, 'Decoder', ['generates, using', 'the encoding']);
  b += A(324, 228, 324, 212, C.soft, 2);
  b += pill(256, 176, 136, '<X> for inviting', C.orangeBg, { size: 11.5, h: 32 });
  b += R(430, 104, 362, 270, 18, C.gray) + T(452, 136, 'GPT · DECODER-ONLY', { size: 15, w: 600 }) + T(452, 158, 'objective: predict the next token', { size: 12.5, fill: C.soft });
  b += card(452, 186, 170, 120, C.greenBg, C.green, 'Decoder stack', ['many layers over the', 'context so far']);
  const toks = ['The', 'cat', 'sat', 'on'];
  toks.forEach((t, i) => (b += pill(452 + i * 43, 322, 39, t, i === 3 ? C.orange : C.blueBg, { size: 12, h: 30, fill: i === 3 ? '#fff' : C.ink })));
  b += T(640, 196, 'causal mask', { size: 12, w: 600, fill: C.soft });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) b += R(640 + c * 26, 206 + r * 26, 23, 23, 4, c <= r ? C.green : '#fff', c <= r ? 'none' : C.line, 1);
  b += T(705, 352, 'each token sees only', { size: 12, fill: C.soft, a: 'middle' }) + T(705, 368, 'earlier tokens', { size: 12, fill: C.soft, a: 'middle' });
  b += band(394, '“Decoder-only” still processes the prompt across many layers. It has no separate encoder.');
  svg(FIG, 470, b);
}

// ---------- 06 · embedding space ----------
FIG = 'figure-06';
{
  let b = title('06', 'An Embedding Space (Illustrative)', 'After suitable training, related content can land close together, even across languages.');
  b += R(48, 104, 744, 250, 18, C.gray);
  for (let i = 1; i < 6; i++) b += P(`M${48 + i * 124} 120 L${48 + i * 124} 338`, '#E7ECEB', 1);
  b += `<ellipse cx="262" cy="226" rx="196" ry="92" fill="${C.greenBg}" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="5 5" />`;
  const dot = (x, y, t, color = C.green, a = 'start') => `<circle cx="${x}" cy="${y}" r="7" fill="${color}" />` + T(a === 'start' ? x + 14 : x - 14, y + 5, t, { size: 14, w: 500, a });
  b += pix(118, 158, 40, 0) + T(166, 184, 'cat photo', { size: 14, w: 500 });
  b += dot(270, 190, 'a photo of a cat') + dot(228, 248, '猫的照片') + dot(306, 282, 'a cat on the sofa');
  b += `<ellipse cx="640" cy="226" rx="120" ry="62" fill="${C.orangeBg}" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="5 5" />`;
  b += dot(590, 212, 'a rocket launch', C.orange) + dot(612, 256, '火箭发射', C.orange);
  b += P('M462 226 L520 226', C.soft, 2, ' stroke-dasharray="4 5"') + T(491, 214, 'far', { size: 13, w: 600, fill: C.soft, a: 'middle' });
  b += T(262, 336, 'close', { size: 13, w: 600, fill: C.green, a: 'middle' });
  b += band(374, 'Vectors are made up for illustration. What “close” means is learned from the objective and the data.');
  svg(FIG, 450, b);
}

// ---------- 07 · contrastive matrix ----------
FIG = 'figure-07';
{
  let b = title('07', 'Contrastive Learning Scores Every Pair', 'Training raises similarity for matching pairs and lowers it for the rest.');
  const imgs = ['cat image', 'rocket image', 'beach image'];
  const txts = ['“a cat on the sofa”', '“a rocket launch”', '“a sunny beach”'];
  const S = [[0.91, 0.08, 0.12], [0.06, 0.88, 0.10], [0.15, 0.09, 0.86]];
  const x0 = 236, y0 = 150, cw = 158, ch = 58;
  txts.forEach((t, j) => (b += T(x0 + j * (cw + 8) + cw / 2, y0 - 16, t, { size: 13.5, w: 600, a: 'middle', max: cw })));
  imgs.forEach((t, i) => {
    const y = y0 + i * (ch + 8);
    b += pill(48, y + 11, 164, t, C.blueBg, { size: 14 });
    S[i].forEach((v, j) => {
      const diag = i === j, x = x0 + j * (cw + 8);
      b += R(x, y, cw, ch, 12, diag ? C.green : C.gray) + T(x + cw / 2, y + 36, v.toFixed(2), { size: 18, w: 600, a: 'middle', fill: diag ? '#fff' : C.soft });
    });
  });
  b += T(x0, 366, 'Diagonal: positive pairs, pushed up.', { size: 13, w: 600, fill: C.green }) + T(x0 + 292, 366, 'Off-diagonal: negative pairs, pushed down.', { size: 13, w: 600, fill: C.soft });
  b += band(386, 'This lets a sentence retrieve images: both are mapped into one comparable space.');
  svg(FIG, 462, b);
}

// ---------- 08 · diffusion training ----------
FIG = 'figure-08';
{
  let b = title('08', 'Diffusion Training: Add Known Noise, Learn to Remove It', 'The noise is known, so the target comes for free.');
  b += pix(60, 140, 110, 0) + T(115, 278, 'real image', { size: 13, w: 600, a: 'middle' });
  b += T(207, 190, '+ noise', { size: 14, w: 600, fill: C.orange, a: 'middle' }) + T(207, 210, 'level t', { size: 12.5, fill: C.soft, a: 'middle' });
  b += A(184, 225, 232, 225, C.orange, 2.5);
  b += pix(246, 140, 110, 0.55) + T(301, 278, 'noisy image', { size: 13, w: 600, a: 'middle' });
  b += A(370, 195, 400, 195, C.soft, 2);
  b += card(406, 140, 120, 110, C.greenBg, C.green, 'Model', ['predicts the', 'noise (or clean)']);
  b += A(530, 195, 560, 195, C.soft, 2);
  b += pix(574, 140, 80, 0, { noiseOnly: true }) + T(614, 248, 'predicted', { size: 13, w: 600, a: 'middle' });
  b += R(676, 150, 116, 92, 16, C.orangeBg) + T(734, 186, 'loss', { size: 16, w: 600, a: 'middle' }) + T(734, 208, 'vs. the noise', { size: 12.5, fill: C.soft, a: 'middle' }) + T(734, 225, 'actually added', { size: 12.5, fill: C.soft, a: 'middle' });
  b += A(658, 195, 672, 195, C.soft, 2);
  b += P('M734 246 L734 300 L466 300 L466 256', C.green, 2, ' stroke-dasharray="6 5"') + head(466, 254, -Math.PI / 2, C.green, 2) + T(600, 318, 'update parameters', { size: 12.5, fill: C.green, a: 'middle' });
  b += band(340, 'Like a language model, diffusion builds its training signal from raw data, with no hand labels.');
  svg(FIG, 416, b);
}

// ---------- 09 · diffusion generation ----------
FIG = 'figure-09';
{
  let b = title('09', 'Generation Runs Denoising Many Times', 'Start from fresh random noise and remove a little at each step.');
  const lv = [1, 0.75, 0.5, 0.25, 0];
  lv.forEach((l, i) => {
    const x = 56 + i * 150;
    b += pix(x, 120, 100, l) + T(x + 50, 244, i === 0 ? 'random noise' : i === 4 ? 'new image' : `step ${i}`, { size: 13, w: 600, a: 'middle' });
    if (i < 4) b += A(x + 108, 170, x + 142, 170, C.orange, 2.5);
  });
  b += T(48, 292, 'TRAINING COVERS MANY NOISE LEVELS', { size: 12, w: 600, fill: C.soft });
  for (let i = 0; i < 24; i++) b += R(48 + i * 31, 304, 28, 20, 4, mix(rgb(C.blueBg), rgb(C.blue), i / 23));
  b += T(48, 344, 'almost clean: fix details', { size: 12.5, fill: C.soft }) + T(792, 344, 'almost pure noise: find structure', { size: 12.5, fill: C.soft, a: 'end' });
  b += band(366, 'The starting noise is new, so the result is a new sample, not a recovered original.');
  svg(FIG, 442, b);
}

// ---------- 10 · pixel vs perceptual ----------
FIG = 'figure-10';
{
  let b = title('10', 'Close to a Person, Far in Pixels', 'Shift an image slightly and every edge lands on different pixels.');
  b += pix(60, 120, 120, 0) + T(120, 266, 'original', { size: 13, w: 600, a: 'middle' });
  b += pix(220, 120, 120, 0, { shift: 1 }) + T(280, 266, 'shifted right', { size: 13, w: 600, a: 'middle' });
  b += T(200, 186, '≈', { size: 22, w: 600, a: 'middle', fill: C.soft });
  b += pix(380, 120, 120, 0, { diffWith: 1 }) + T(440, 266, 'pixels that changed', { size: 13, w: 600, a: 'middle', fill: C.rust });
  const m = [['Pixel loss', 'large: every edge moved', C.rust], ['Perceptual loss', 'small: same features', C.green], ['Adversarial loss', 'looks real? (fidelity aside)', C.blue]];
  m.forEach(([t, s, col], i) => {
    const y = 116 + i * 54;
    b += R(536, y, 256, 46, 12, C.gray) + R(536, y, 6, 46, 3, col) + T(556, y + 20, t, { size: 14, w: 600 }) + T(556, y + 37, s, { size: 12, fill: C.soft, max: 224 });
  });
  b += band(298, 'A perceptual score depends on its feature network. It is not human judgment itself.');
  svg(FIG, 374, b);
}

// ---------- 11 · four generative approaches ----------
FIG = 'figure-11';
{
  let b = title('11', 'Four Ways to Learn to Generate', 'Different training objectives, not steps in one pipeline.');
  const cards = [
    [C.blueBg, C.blue, 'Autoencoder', ['Encode to a latent z,', 'then rebuild x.'], 'x → z → x̂'],
    [C.blueBg, C.blue, 'VAE', ['A distribution over z,', 'kept close to a prior.'], 'x → (μ, σ) → z → x̂'],
    [C.orangeBg, C.orange, 'GAN', ['Generator versus', 'discriminator.'], 'noise → G → D'],
    [C.greenBg, C.green, 'Diffusion', ['Denoise at many', 'noise levels.'], 'noise → … → image'],
  ];
  cards.forEach(([bg, ac, t, subs, flow], i) => {
    const x = 48 + i * 190;
    b += card(x, 108, 174, 170, bg, ac, t, subs);
    b += R(x + 14, 226, 146, 36, 10, '#fff') + T(x + 87, 249, flow, { size: 12.5, w: 600, a: 'middle', max: 140 });
  });
  b += band(300, 'Some systems combine these ideas. Separate their training objectives first.');
  svg(FIG, 376, b);
}

// ---------- 12 · knowledge map ----------
FIG = 'figure-12';
{
  let b = title('12', 'One Map of the Ideas', 'Three things a model can learn from raw data.');
  b += R(48, 196, 110, 90, 16, C.gray) + T(103, 236, 'Raw', { size: 16, w: 600, a: 'middle' }) + T(103, 258, 'data', { size: 16, w: 600, a: 'middle' });
  const rows = [
    [C.blueBg, 'Self-supervised pretraining', C.greenBg, 'Foundation model', C.orangeBg, 'Many tasks'],
    [C.blueBg, 'Learn embeddings', C.greenBg, 'Contrastive learning', C.orangeBg, 'Cross-modal retrieval'],
    [C.blueBg, 'Learn the data distribution', C.greenBg, 'VAE / GAN / Diffusion', C.orangeBg, 'New samples'],
  ];
  rows.forEach((r, i) => {
    const y = 110 + i * 92;
    b += P(`M162 241 Q180 241 186 ${y + 28} L196 ${y + 28}`, C.soft, 2) + head(200, y + 28, 0, C.soft, 2);
    b += R(206, y, 200, 56, 12, r[0]) + T(306, y + 33, r[1], { size: 13.5, w: 600, a: 'middle', max: 188 });
    b += A(410, y + 28, 436, y + 28, C.soft, 2);
    b += R(442, y, 170, 56, 12, r[2]) + T(527, y + 33, r[3], { size: 13.5, w: 600, a: 'middle', max: 160 });
    b += A(616, y + 28, 642, y + 28, C.soft, 2);
    b += R(648, y, 144, 56, 12, r[4]) + T(720, y + 33, r[5], { size: 13, w: 600, a: 'middle', max: 136 });
  });
  b += T(527, 184, 'post-training adjusts behavior', { size: 12, fill: C.soft, a: 'middle' });
  b += band(392, 'Related ideas, not the same concept: transferable abilities versus learned data distributions.');
  svg(FIG, 468, b);
}

console.log(warnings.length ? warnings.join('\n') : 'no overflow warnings');

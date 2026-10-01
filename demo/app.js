/* Smart Business OS — interactive demo
 * Plain HTML + CSS + JS + JSON. No libraries. All data is fictional (see data.json).
 */
(() => {
'use strict';

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = new Date(); TODAY.setHours(12, 0, 0, 0);
const dateOf = d => new Date(TODAY.getTime() - d * 864e5);
const fmtShort = d => { const x = dateOf(d); return `${x.getDate()} ${MON[x.getMonth()]}`; };
const fmtD = d => { const x = dateOf(d); return `${x.getDate()} ${MON[x.getMonth()]} ${x.getFullYear()}`; };
const agoDays = d => d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
const dueLabel = n => n < 0 ? `Overdue by ${-n}d` : n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : `Due in ${n} days`;

const inr = n => (n < 0 ? '-' : '') + '₹' + Math.round(Math.abs(n)).toLocaleString('en-IN');
const inrC = n => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e7) return `${s}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${s}₹${(a / 1e5).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString('en-IN')}`;
};
const short = (n, money) => {
  const a = Math.abs(n), s = n < 0 ? '-' : '', p = money ? '₹' : '';
  const t = v => String(+v.toFixed(1));
  if (a >= 1e7) return `${s}${p}${t(a / 1e7)}Cr`;
  if (a >= 1e5) return `${s}${p}${t(a / 1e5)}L`;
  if (a >= 1e3) return `${s}${p}${t(a / 1e3)}k`;
  return `${s}${p}${Math.round(a)}`;
};
const num = n => Math.round(n).toLocaleString('en-IN');
const pct = (a, b) => b ? (a - b) / b * 100 : 0;
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const AVCOL = ['#0e8f8a', '#3b76d9', '#c4547a', '#8a6fe0', '#d98a1f', '#4f9a5a', '#d4572c'];
const avCol = id => AVCOL[id % AVCOL.length];
const avatar = (name, id, cls = '') => `<span class="avatar ${cls}" style="background:${avCol(id)}" aria-hidden="true">${esc(initials(name))}</span>`;
const badge = (txt, cls) => `<span class="badge b-${(cls || txt).replace(/\s+/g, '-')}">${esc(txt)}</span>`;
const uid = (() => { let i = 0; return () => 'u' + (++i); })();

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.6.2 4.2 1.9 4.6 4.5"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  check: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="m8 12 3 3 5-6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  left: '<path d="m14 6-6 6 6 6"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'
};
const icon = (n, s = 20) => `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* ================= state ================= */
const RANGES = {
  '7d': { days: 7, size: 1, label: 'Last 7 days' },
  '30d': { days: 30, size: 1, label: 'Last 30 days' },
  '90d': { days: 91, size: 7, label: 'Last 90 days' },
  '12m': { days: 360, size: 30, label: 'Last 12 months' }
};
const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', range: true },
  { id: 'orders', label: 'Sales & Orders', icon: 'cart', range: true },
  { id: 'customers', label: 'Customers', icon: 'users', range: true },
  { id: 'products', label: 'Products & Inventory', icon: 'box' },
  { id: 'employees', label: 'Employees', icon: 'briefcase' },
  { id: 'expenses', label: 'Expenses', icon: 'card', range: true },
  { id: 'tasks', label: 'Tasks', icon: 'check' },
  { id: 'reports', label: 'Reports & Analytics', icon: 'chart', range: true },
  { id: 'settings', label: 'Settings', icon: 'sliders' }
];
const CATCOL = ['var(--accent)', 'var(--gold)', 'var(--info)', '#d46a8c', '#8a6fe0', '#5fa05f', '#d4432c', '#7a8a93'];
const EXPCOL = { Salaries: 'var(--accent)', Rent: 'var(--gold)', Utilities: 'var(--info)', Marketing: '#d46a8c', Logistics: '#8a6fe0', Supplies: '#5fa05f', Software: '#d4432c', Other: '#7a8a93' };
const NOTI = { stock: '📦', order: '🛒', payment: '💳', customer: '👥', task: '✅', system: '📈' };
const ACCENTS = [['Teal', null], ['Indigo', '#4f5bd5'], ['Orange', '#dd6b2a'], ['Rose', '#d2467a']];

const S = {
  range: '30d', page: 'dashboard', redraw: [], theme: 'light', accent: null,
  f: {
    orders: { q: '', status: 'All', ch: 'All', sort: 'new', page: 1 },
    customers: { q: '', tier: 'All' },
    products: { q: '', cat: 'All', stock: 'All', page: 1 },
    employees: { q: '', dept: 'All' },
    expenses: { q: '', cat: 'All', page: 1 },
    tasks: { who: 'All' }
  }
};
let RAW = null;

function store(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

function hydrate(raw) {
  RAW = raw;
  const m = raw.meta;
  S.meta = m; S.biz = { ...raw.business }; S.cats = raw.categories;
  S.products = raw.products.map(p => ({ ...p }));
  S.customers = raw.customers.map(c => ({ ...c }));
  S.employees = raw.employees.map(e => ({ ...e }));
  S.expenses = raw.expenses.map(e => ({ ...e }));
  S.tasks = raw.tasks.map(t => ({ ...t }));
  S.notifs = raw.notifications.map(n => ({ ...n, t: Date.now() - n.mins * 60000 }));
  S.orders = raw.orders.map(a => ({
    id: a[0], c: a[1], d: a[2], s: m.statuses[a[3]], p: m.payments[a[4]], ch: m.channels[a[5]],
    items: a[6].map(([p, q]) => ({ p, q }))
  }));
  reindex();
}
function reindex() {
  S.pm = new Map(S.products.map(p => [p.id, p]));
  S.cm = new Map(S.customers.map(c => [c.id, c]));
  S.em = new Map(S.employees.map(e => [e.id, e]));
  for (const o of S.orders) finishOrder(o);
  S.nextOrder = Math.max(...S.orders.map(o => o.id)) + 1;
}
function finishOrder(o) {
  o.total = 0; o.cost = 0;
  for (const it of o.items) { const p = S.pm.get(it.p); o.total += p.price * it.q; o.cost += p.cost * it.q; }
  return o;
}
const live = o => o.s !== 'Cancelled';
const tierOf = v => v >= 1000000 ? 'Gold' : v >= 500000 ? 'Silver' : 'Regular';

function custStats() {
  const m = new Map(S.customers.map(c => [c.id, { orders: 0, ltv: 0, last: null }]));
  for (const o of S.orders) {
    if (!live(o)) continue;
    const s = m.get(o.c); s.orders++; s.ltv += o.total;
    if (s.last === null || o.d < s.last) s.last = o.d;
  }
  for (const s of m.values()) s.tier = tierOf(s.ltv);
  return m;
}
const stockState = p => p.stock <= 0 ? 'Out' : p.stock <= p.reorder ? 'Low' : 'In stock';

/* ================= metrics ================= */
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
function metrics(rk) {
  const days = RANGES[rk].days, cur = [], prv = [];
  for (const o of S.orders) { if (!live(o)) continue; if (o.d < days) cur.push(o); else if (o.d < days * 2) prv.push(o); }
  const rev = sum(cur, o => o.total), revP = sum(prv, o => o.total), cogs = sum(cur, o => o.cost);
  const expC = S.expenses.filter(e => e.d < days);
  const exp = sum(expC, e => e.amt), expP = sum(S.expenses.filter(e => e.d >= days && e.d < days * 2), e => e.amt);
  return {
    days, cur, prv, rev, revP, cogs, exp, expP, expC,
    orders: cur.length, ordersP: prv.length, gross: rev - cogs, profit: rev - cogs - exp,
    margin: rev ? (rev - cogs - exp) / rev * 100 : 0,
    aov: cur.length ? rev / cur.length : 0,
    active: new Set(cur.map(o => o.c)).size, activeP: new Set(prv.map(o => o.c)).size,
    newC: S.customers.filter(c => c.j < days).length,
    growth: pct(rev, revP)
  };
}
function buckets(rk) {
  const { days, size } = RANGES[rk], n = Math.ceil(days / size);
  const z = () => Array(n).fill(0), rev = z(), cnt = z(), cogs = z(), exp = z();
  for (const o of S.orders) if (live(o) && o.d < days) { const i = n - 1 - Math.floor(o.d / size); rev[i] += o.total; cnt[i]++; cogs[i] += o.cost; }
  for (const e of S.expenses) if (e.d < days) exp[n - 1 - Math.floor(e.d / size)] += e.amt;
  const labels = [], tips = [];
  for (let i = 0; i < n; i++) {
    const newest = (n - 1 - i) * size, oldest = Math.min(days - 1, (n - i) * size - 1);
    labels.push(size >= 30 ? MON[dateOf(newest + (size >> 1)).getMonth()] : fmtShort(oldest));
    tips.push(size === 1 ? fmtD(oldest) : `${fmtShort(oldest)} – ${fmtShort(newest)}`);
  }
  return { n, labels, tips, rev, cnt, cogs, exp, profit: rev.map((r, i) => r - cogs[i] - exp[i]) };
}
function catRevenue(orders) {
  const m = {};
  for (const o of orders) for (const it of o.items) { const p = S.pm.get(it.p); m[p.cat] = (m[p.cat] || 0) + p.price * it.q; }
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label, value, color: CATCOL[i % CATCOL.length] }));
}

/* ================= SVG charts ================= */
function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
  return (f <= 1 ? 1 : f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 3 ? 3 : f <= 5 ? 5 : f <= 7.5 ? 7.5 : 10) * p;
}
function niceStep(max, ticks = 4) {
  const raw = max / ticks, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function smooth(p) {
  if (p.length < 2) return '';
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2, t = 0.18;
    const lo = Math.min(p1[1], p2[1]), hi = Math.max(p1[1], p2[1]);
    const c1y = Math.min(hi, Math.max(lo, p1[1] + (p2[1] - p0[1]) * t));
    const c2y = Math.min(hi, Math.max(lo, p2[1] - (p3[1] - p1[1]) * t));
    d += `C${(p1[0] + (p2[0] - p0[0]) * t).toFixed(1)},${c1y.toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * t).toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function spark(vals) {
  const w = 140, h = 48, max = Math.max(...vals, 1), min = Math.min(...vals, 0), n = vals.length;
  if (n < 2) return '';
  const pts = vals.map((v, i) => [i * w / (n - 1), h - 4 - (v - min) / ((max - min) || 1) * (h - 8)]);
  const line = smooth(pts);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${line}L${w},${h}L0,${h}Z" fill="currentColor" opacity=".13"/><path d="${line}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
}
function tipHtml(title, rows) {
  return `<b>${esc(title)}</b>` + rows.map(r => `<div><span><i style="background:${r.color}"></i>${esc(r.name)}</span><b>${esc(r.value)}</b></div>`).join('');
}
function placeTip(el, tip, lx) {
  tip.style.left = lx + 'px'; tip.style.top = '8px';
  tip.style.transform = lx > el.clientWidth * 0.58 ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)';
  tip.style.opacity = 1;
}

function lineChart(el, o) {
  const W = Math.max(300, el.clientWidth), H = o.height || 270, m = { t: 14, r: 16, b: 30, l: 54 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b, n = o.labels.length, id = uid();
  const vals = o.series.flatMap(s => s.values);
  const maxV = Math.max(1, ...vals), minV = Math.min(0, ...vals), step = niceStep(Math.max(maxV, -minV));
  const hi = Math.ceil(maxV / step - 1e-9) * step, lo = minV < 0 ? -Math.ceil(-minV / step - 1e-9) * step : 0, tn = Math.round((hi - lo) / step);
  const y = v => m.t + (hi - v) / (hi - lo) * ih;
  const x = i => m.l + (n === 1 ? iw / 2 : i * iw / (n - 1));
  let g = '';
  for (let k = 0; k <= tn; k++) {
    const v = lo + step * k, yy = y(v);
    g += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/><text class="ax" x="${m.l - 9}" y="${yy + 4}" text-anchor="end">${o.axis(v)}</text>`;
  }
  const lstep = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 66))));
  for (let i = 0; i < n; i++) if ((n - 1 - i) % lstep === 0) g += `<text class="ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(o.labels[i])}</text>`;
  let defs = '', body = '';
  o.series.forEach((s, k) => {
    const pts = s.values.map((v, i) => [x(i), y(v)]), path = smooth(pts);
    if (s.area) {
      defs += `<linearGradient id="${id}g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${s.color};stop-opacity:.28"/><stop offset="1" style="stop-color:${s.color};stop-opacity:0"/></linearGradient>`;
      body += `<path d="${path}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#${id}g${k})"/>`;
    }
    body += `<path d="${path}" fill="none" style="stroke:${s.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  const dots = o.series.map(s => `<circle r="0" style="fill:var(--surface);stroke:${s.color}" stroke-width="2.5"/>`).join('');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Line chart')}"><defs>${defs}</defs>${g}${body}<line class="guide" y1="${m.t}" y2="${m.t + ih}"/>${dots}<rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/></svg><div class="tip"></div>`;
  const svg = el.firstElementChild, tip = el.lastElementChild, guide = $('.guide', svg), circles = $$('circle', svg);
  const hide = () => { guide.style.opacity = 0; circles.forEach(c => c.setAttribute('r', 0)); tip.style.opacity = 0; };
  const show = i => {
    guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); guide.style.opacity = 1;
    circles.forEach((c, k) => { c.setAttribute('cx', x(i)); c.setAttribute('cy', y(o.series[k].values[i])); c.setAttribute('r', 4.5); });
    tip.innerHTML = tipHtml(o.tips ? o.tips[i] : o.labels[i], o.series.map(s => ({ color: s.color, name: s.name, value: o.fmt(s.values[i]) })));
    placeTip(el, tip, x(i) * svg.getBoundingClientRect().width / W);
  };
  const move = e => {
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
    show(Math.max(0, Math.min(n - 1, Math.round((px - m.l) / iw * (n - 1)))));
  };
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', hide);
}

function barChart(el, o) {
  const W = Math.max(300, el.clientWidth), H = o.height || 270, m = { t: 14, r: 12, b: 30, l: 54 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b, n = o.labels.length, k = o.series.length;
  const maxV = Math.max(1, ...o.series.flatMap(s => s.values)), step = niceStep(maxV);
  const hi = Math.ceil(maxV / step - 1e-9) * step, tn = Math.round(hi / step);
  const y = v => m.t + (hi - v) / hi * ih, gw = iw / n, gap = 3;
  const bw = Math.max(4, Math.min(28, (gw * 0.72 - gap * (k - 1)) / k));
  let g = '';
  for (let t = 0; t <= tn; t++) {
    const v = step * t, yy = y(v);
    g += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/><text class="ax" x="${m.l - 9}" y="${yy + 4}" text-anchor="end">${o.axis(v)}</text>`;
  }
  const lstep = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 50))));
  let bars = '', bands = '';
  for (let i = 0; i < n; i++) {
    const cx = m.l + gw * i + gw / 2, x0 = cx - (bw * k + gap * (k - 1)) / 2;
    bands += `<rect class="band" x="${m.l + gw * i}" y="${m.t}" width="${gw}" height="${ih}"/>`;
    o.series.forEach((s, j) => {
      const h = Math.max(0, ih - (y(s.values[i]) - m.t));
      bars += `<rect x="${x0 + j * (bw + gap)}" y="${m.t + ih - h}" width="${bw}" height="${h}" rx="4" style="fill:${s.color}"/>`;
    });
    if ((n - 1 - i) % lstep === 0) g += `<text class="ax" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(o.labels[i])}</text>`;
  }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Bar chart')}">${g}${bands}${bars}<rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/></svg><div class="tip"></div>`;
  const svg = el.firstElementChild, tip = el.lastElementChild, bandEls = $$('.band', svg);
  const hide = () => { bandEls.forEach(b => b.style.opacity = 0); tip.style.opacity = 0; };
  const move = e => {
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
    const i = Math.max(0, Math.min(n - 1, Math.floor((px - m.l) / gw)));
    bandEls.forEach((b, j) => b.style.opacity = j === i ? 1 : 0);
    tip.innerHTML = tipHtml(o.tips ? o.tips[i] : o.labels[i], o.series.map(s => ({ color: s.color, name: s.name, value: o.fmt(s.values[i]) })));
    placeTip(el, tip, (m.l + gw * i + gw / 2) * r.width / W);
  };
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', hide);
}

function donut(el, o) {
  const total = sum(o.items, i => i.value) || 1, R = 74, C = 2 * Math.PI * R;
  let acc = 0, segs = '';
  o.items.forEach((it, i) => {
    const frac = it.value / total, len = Math.max(0, frac * C - 2.5);
    segs += `<circle data-i="${i}" cx="95" cy="95" r="${R}" fill="none" style="stroke:${it.color}" stroke-width="22" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc * C}"/>`;
    acc += frac;
  });
  el.innerHTML = `<div class="donut-wrap"><div class="donut-box"><svg viewBox="0 0 190 190" role="img" aria-label="${esc(o.label || 'Donut chart')}">${segs}</svg><div class="donut-center"><b>${esc(o.center)}</b><span>${esc(o.centerLabel)}</span></div></div>
  <div class="dl">${o.items.map((it, i) => `<button data-i="${i}"><i style="background:${it.color}"></i>${esc(it.label)}<em>${Math.round(it.value / total * 100)}%</em></button>`).join('')}</div></div>`;
  const box = $('.donut-box', el), cb = $('.donut-center b', el), cs = $('.donut-center span', el);
  const on = i => {
    box.classList.toggle('hovering', i !== null);
    $$('circle', el).forEach((c, j) => c.classList.toggle('hl', j === i));
    $$('.dl button', el).forEach((b, j) => b.classList.toggle('on', j === i));
    if (i === null) { cb.textContent = o.center; cs.textContent = o.centerLabel; }
    else { cb.textContent = o.fmt(o.items[i].value); cs.textContent = o.items[i].label; }
  };
  $$('[data-i]', el).forEach(n => {
    const i = +n.dataset.i;
    n.addEventListener('pointerenter', () => on(i)); n.addEventListener('pointerleave', () => on(null));
    n.addEventListener('focus', () => on(i)); n.addEventListener('blur', () => on(null));
  });
}

/* ================= counters ================= */
const FMT = { money: v => inr(v), moneyC: v => inrC(v), int: v => num(v), pct: v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%' };
function countUp(el) {
  const to = +el.dataset.count, f = FMT[el.dataset.fmt];
  if (reduceMotion) { el.textContent = f(to); return; }
  const t0 = performance.now(), dur = 900;
  const step = t => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = f(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step); else el.textContent = f(to);
  };
  requestAnimationFrame(step);
}

/* ================= toast, drawer, modal ================= */
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3200);
}
let lastFocus = null;
function openDrawer(head, body) {
  lastFocus = document.activeElement;
  $('#drawerHead').innerHTML = head; $('#drawerBody').innerHTML = body; $('#drawerBody').scrollTop = 0;
  $('#drawer').classList.add('on'); $('#overlay').classList.add('on');
  $('#drawerClose').focus();
}
function closeDrawer() {
  $('#drawer').classList.remove('on');
  if (!$('#modal').classList.contains('on')) $('#overlay').classList.remove('on');
}
let modalSubmit = null;
function openModal(title, formHtml, submitLabel, onSubmit) {
  lastFocus = document.activeElement; modalSubmit = onSubmit;
  $('#modal').innerHTML = `<h3 id="modalTitle">${esc(title)}</h3><form class="form" id="modalForm" novalidate>${formHtml}<div class="error" id="modalErr" role="alert"></div><div class="foot"><button type="button" class="btn" data-act="close-modal">Cancel</button><button type="submit" class="btn primary">${esc(submitLabel)}</button></div></form>`;
  $('#modal').classList.add('on'); $('#overlay').classList.add('on');
  const first = $('#modal input, #modal select'); if (first) first.focus();
  $('#modalForm').addEventListener('submit', e => {
    e.preventDefault();
    const err = modalSubmit(e.target);
    if (err) $('#modalErr').textContent = err; else closeModal();
  });
}
function closeModal() {
  $('#modal').classList.remove('on');
  if (!$('#drawer').classList.contains('on')) $('#overlay').classList.remove('on');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function closeAll() { $('#drawer').classList.remove('on'); $('#modal').classList.remove('on'); $('#overlay').classList.remove('on'); }

/* ================= notifications ================= */
const agoMin = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const unread = () => S.notifs.filter(n => !n.read).length;
function notifItem(n) {
  return `<button class="list-item" data-act="open-notif" data-id="${n.id}"><span class="n-icon">${NOTI[n.type] || '🔔'}</span><span class="grow"><span class="t" style="display:block;font-weight:${n.read ? 600 : 800}">${esc(n.text)}</span><span class="s">${agoMin(n.t)}</span></span><span class="dot ${n.read ? 'read' : ''}" title="${n.read ? 'Read' : 'Unread'}"></span></button>`;
}
function renderBell() {
  const c = unread(), b = $('#bellCount');
  b.hidden = c === 0; b.textContent = c;
  $('#bellBtn').setAttribute('aria-label', `Notifications, ${c} unread`);
  $('#bellDD').innerHTML = `<div class="dd-head"><span>Notifications</span><button class="linkish" data-act="mark-read">Mark all as read</button></div><div class="list" style="max-height:380px;overflow:auto">${S.notifs.slice().sort((a, b) => b.t - a.t).map(notifItem).join('')}</div>`;
  const nav = $('#nav .count'); if (nav) nav.textContent = c;
}
function pushNotif(type, text, link) {
  S.notifs.unshift({ id: Date.now() + Math.random(), type, text, link, t: Date.now(), read: false });
  renderBell();
}

/* ================= theme / accent ================= */
function applyTheme(mode, save = true) {
  S.theme = mode;
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  $('#themeBtn').innerHTML = icon(dark ? 'sun' : 'moon');
  $('#themeBtn').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  if (save) store('sbos-theme', mode);
  S.redraw.forEach(f => f());
}
function applyAccent(hex, save = true) {
  S.accent = hex;
  if (hex) document.documentElement.style.setProperty('--accent', hex); else document.documentElement.style.removeProperty('--accent');
  if (save) store('sbos-accent', hex);
}

/* ================= search ================= */
function runSearch(raw) {
  const dd = $('#searchDD'), q = raw.trim().toLowerCase().replace(/^#/, '');
  if (!q) { dd.hidden = true; return; }
  const cs = custStats();
  const groups = [
    ['Orders', S.orders.filter(o => String(o.id).includes(q) || S.cm.get(o.c).name.toLowerCase().includes(q)).sort((a, b) => b.id - a.id).slice(0, 4)
      .map(o => ({ act: 'open-order', id: o.id, t: `Order #${o.id}`, s: `${S.cm.get(o.c).name} · ${inr(o.total)} · ${o.s}`, av: '🛒' }))],
    ['Customers', S.customers.filter(c => (c.name + ' ' + c.city).toLowerCase().includes(q)).slice(0, 4)
      .map(c => ({ act: 'open-customer', id: c.id, t: c.name, s: `${c.city} · ${cs.get(c.id).tier}`, av: '👥' }))],
    ['Products', S.products.filter(p => (p.name + ' ' + p.sku).toLowerCase().includes(q)).slice(0, 4)
      .map(p => ({ act: 'open-product', id: p.id, t: p.name, s: `${p.sku} · ${p.stock} in stock`, av: '📦' }))],
    ['Employees', S.employees.filter(e => (e.name + ' ' + e.role).toLowerCase().includes(q)).slice(0, 3)
      .map(e => ({ act: 'open-employee', id: e.id, t: e.name, s: e.role, av: '👨‍💼' }))]
  ].filter(g => g[1].length);
  dd.innerHTML = groups.length
    ? groups.map(([h, items]) => `<div class="dd-group"><h4>${h}</h4>${items.map(i => `<button class="dd-item" data-act="${i.act}" data-id="${i.id}" data-from="search"><span class="n-icon">${i.av}</span><span><b>${esc(i.t)}</b><small>${esc(i.s)}</small></span></button>`).join('')}</div>`).join('')
    : `<div class="dd-empty">No matches for “${esc(raw.trim())}”.<br>Try an order number, customer or product.</div>`;
  dd.hidden = false;
}

/* ================= router & shell ================= */
const pages = {};
const ACT = {};   // click actions
const INP = {};   // input / change handlers

function buildNav() {
  $('#nav').innerHTML = PAGES.map(p => `<a href="#/${p.id}" data-page="${p.id}">${icon(p.icon)}<span>${p.label}</span>${p.id === 'settings' ? '' : ''}</a>`).join('');
  const a = $('#nav a[data-page="dashboard"]');
  a.insertAdjacentHTML('beforeend', '');
}
function setRange(rk) {
  S.range = rk;
  $$('#rangeSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.range === rk)));
}
function route() {
  const id = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const changed = S.page !== (PAGES.some(p => p.id === id) ? id : 'dashboard') || !$('#view').dataset.ready;
  S.page = PAGES.some(p => p.id === id) ? id : 'dashboard';
  $('#sidebar').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  render(changed);
  if (changed) window.scrollTo(0, 0);
}
function render(animate) {
  const v = $('#view'), pg = PAGES.find(p => p.id === S.page);
  S.redraw = [];
  v.dataset.ready = '1';
  v.innerHTML = '';
  pages[S.page](v);
  $('#pageTitle').textContent = pg.label;
  document.title = `${pg.label} · Smart Business OS demo`;
  $$('#nav a').forEach(a => a.toggleAttribute('aria-current', a.dataset.page === S.page));
  $$('#nav a[aria-current]').forEach(a => a.setAttribute('aria-current', 'page'));
  $('#rangeSeg').hidden = !pg.range;
  if (animate && !reduceMotion) { v.classList.remove('page-enter'); void v.offsetWidth; v.classList.add('page-enter'); }
  $$('[data-count]', v).forEach(countUp);
  drawCharts();
}
function drawCharts() { S.redraw.forEach(f => f()); }
let rzT = 0, lastW = 0;
new ResizeObserver(() => {
  const w = $('#view').clientWidth;
  if (w === lastW) return; lastW = w;
  cancelAnimationFrame(rzT); rzT = requestAnimationFrame(drawCharts);
}).observe($('#view'));

/* ---------- pager & csv ---------- */
function pager(total, page, per, act) {
  const pages_ = Math.max(1, Math.ceil(total / per)), from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per);
  return `<div class="pager"><span>Showing ${from}–${to} of ${num(total)}</span><div class="btns"><button class="btn sm" data-act="${act}" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Previous</button><button class="btn sm" data-act="${act}" data-p="${page + 1}" ${page >= pages_ ? 'disabled' : ''}>Next</button></div></div>`;
}
function downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
const chips = (items, cur, act) => `<div class="chips">${items.map(([v, label, n]) => `<button class="chip" data-act="${act}" data-v="${esc(v)}" aria-pressed="${v === cur}">${esc(label)}${n !== undefined ? `<small>${n}</small>` : ''}</button>`).join('')}</div>`;
const statCard = (emoji, label, value, sub) => `<div class="card kpi s3" style="min-height:0"><div class="kpi-top"><span class="kpi-emoji">${emoji}</span>${esc(label)}</div><div class="kpi-val" style="font-size:24px">${value}</div><div class="kpi-sub">${sub || ''}</div></div>`;
const deltaPill = (p, goodUp = true) => {
  if (!isFinite(p) || Math.abs(p) < 0.05) return `<span class="delta flat">0.0%</span>`;
  const up = p > 0, good = up === goodUp;
  return `<span class="delta ${good ? 'good' : 'bad'}">${up ? '▲' : '▼'} ${Math.abs(p).toFixed(1)}%</span>`;
};
const rangeNote = () => RANGES[S.range].label.toLowerCase();

/* ================= shared drawers ================= */
const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
function orderDrawer(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  const c = S.cm.get(o.c), idx = statusSteps.indexOf(o.s);
  const steps = o.s === 'Cancelled'
    ? `<p class="muted">This order was cancelled. No further status changes are expected.</p>`
    : `<div class="timeline">${statusSteps.map((s, i) => `<div class="tl-step ${i <= idx ? 'done' : ''}"><i></i>${s}</div>`).join('')}</div>`;
  openDrawer(
    `<h3 id="drawerTitle">Order #${o.id}</h3><div style="margin-top:6px">${badge(o.s)}</div>`,
    `${steps}
    <div class="kv">
      <div><small>Customer</small><b><button class="linkish" data-act="open-customer" data-id="${c.id}">${esc(c.name)}</button></b></div>
      <div><small>Order date</small><b>${fmtD(o.d)}</b></div>
      <div><small>Channel</small><b>${esc(o.ch)}</b></div>
      <div><small>Payment</small><b>${esc(o.p)}</b></div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Amount</th></tr></thead><tbody>
      ${o.items.map(it => { const p = S.pm.get(it.p); return `<tr><td><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${inr(p.price)} each</div></td><td class="r num">${it.q}</td><td class="r num">${inr(p.price * it.q)}</td></tr>`; }).join('')}
      <tr><td colspan="2" class="cell-main">Order total</td><td class="r num cell-main">${inr(o.total)}</td></tr>
    </tbody></table></div>
    ${o.s !== 'Cancelled' ? `<form class="form" data-form="order-status" data-id="${o.id}"><label>Update status<select name="s">${[...statusSteps, 'Cancelled'].map(s => `<option ${s === o.s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><button class="btn primary" type="submit">Save status</button></form>` : ''}`
  );
}
function customerDrawer(id) {
  const c = S.cm.get(id), st = custStats().get(id);
  const os = S.orders.filter(o => o.c === id).sort((a, b) => b.id - a.id);
  openDrawer(
    `<div style="display:flex;gap:14px;align-items:center">${avatar(c.name, c.id, 'lg')}<div><h3 id="drawerTitle">${esc(c.name)}</h3><div class="muted">${esc(c.city)} · ${badge(st.tier)}</div></div></div>`,
    `<div class="kv">
      <div><small>Lifetime value</small><b>${inr(st.ltv)}</b></div>
      <div><small>Orders</small><b>${st.orders}</b></div>
      <div><small>Customer since</small><b>${fmtD(c.j)}</b></div>
      <div><small>Last order</small><b>${st.last === null ? '—' : agoDays(st.last)}</b></div>
      <div style="grid-column:1/-1"><small>Email (fictional)</small><b>${esc(c.email)}</b></div>
    </div>
    <button class="btn primary" data-act="new-order" data-c="${c.id}">${icon('plus', 16)} Create order for ${esc(c.name.split(' ')[0])}</button>
    <div><h4 style="margin-bottom:6px">Recent orders</h4>${os.length ? `<div class="list">${os.slice(0, 6).map(o => `<button class="list-item" data-act="open-order" data-id="${o.id}"><span class="grow"><span class="t">#${o.id} · ${inr(o.total)}</span><span class="s">${agoDays(o.d)} · ${o.items.length} items</span></span>${badge(o.s)}</button>`).join('')}</div>` : '<p class="muted">No orders yet.</p>'}</div>`
  );
}
function productDrawer(id) {
  const p = S.pm.get(id), st = stockState(p), days = RANGES[S.range].days;
  const sold = sum(S.orders.filter(o => live(o) && o.d < days), o => sum(o.items.filter(i => i.p === id), i => i.q));
  openDrawer(
    `<h3 id="drawerTitle">${esc(p.name)}</h3><div class="muted" style="margin-top:4px">${esc(p.sku)} · ${esc(p.cat)}</div>`,
    `<div class="kv">
      <div><small>Selling price</small><b>${inr(p.price)}</b></div>
      <div><small>Unit cost</small><b>${inr(p.cost)}</b></div>
      <div><small>Margin</small><b>${((p.price - p.cost) / p.price * 100).toFixed(0)}%</b></div>
      <div><small>Stock status</small><b>${badge(st)}</b></div>
      <div><small>In stock</small><b>${num(p.stock)} units</b></div>
      <div><small>Reorder level</small><b>${p.reorder} units</b></div>
      <div style="grid-column:1/-1"><small>Units sold (${rangeNote()})</small><b>${num(sold)}</b></div>
    </div>
    <button class="btn primary" data-act="restock" data-id="${p.id}">Restock to ${p.reorder * 3} units</button>`
  );
}
function employeeDrawer(id) {
  const e = S.em.get(id), ts = S.tasks.filter(t => t.who === id);
  openDrawer(
    `<div style="display:flex;gap:14px;align-items:center">${avatar(e.name, e.id, 'lg')}<div><h3 id="drawerTitle">${esc(e.name)}</h3><div class="muted">${esc(e.role)}</div></div></div>`,
    `<div class="kv">
      <div><small>Department</small><b>${esc(e.dept)}</b></div>
      <div><small>Status</small><b>${badge(e.status)}</b></div>
      <div><small>Monthly salary</small><b>${inr(e.salary)}</b></div>
      <div><small>Attendance (90 days)</small><b>${e.att}%</b></div>
      <div style="grid-column:1/-1"><small>Joined</small><b>${fmtD(e.joined)}</b></div>
    </div>
    <div><h4 style="margin-bottom:6px">Assigned tasks (${ts.length})</h4>${ts.length ? `<div class="list">${ts.map(t => `<div class="list-item"><span class="grow"><span class="t">${esc(t.title)}</span><span class="s">${t.st === 'done' ? 'Done' : dueLabel(t.due)}</span></span>${badge(t.pri)}</div>`).join('')}</div>` : '<p class="muted">No tasks assigned.</p>'}</div>`
  );
}

/* ================= modals ================= */
function newOrderModal(cid) {
  const opts = S.customers.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)} — ${esc(c.city)}</option>`).join('');
  const popts = S.products.map(p => `<option value="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>${esc(p.name)} (${p.stock} in stock) — ${inr(p.price)}</option>`).join('');
  openModal('New order', `
    <label>Customer<select name="c">${opts}</select></label>
    <label>Product<select name="p">${popts}</select></label>
    <div class="row"><label>Quantity<input name="q" type="number" min="1" value="1" inputmode="numeric"></label>
    <label>Channel<select name="ch">${S.meta.channels.map(c => `<option>${c}</option>`).join('')}</select></label></div>
    <label>Payment method<select name="pay">${S.meta.payments.map(c => `<option>${c}</option>`).join('')}</select></label>`,
  'Create order', f => {
    const d = new FormData(f), p = S.pm.get(+d.get('p')), q = parseInt(d.get('q'), 10);
    if (!q || q < 1) return 'Enter a quantity of 1 or more.';
    if (q > p.stock) return `Only ${p.stock} units of “${p.name}” are in stock. Lower the quantity or restock first.`;
    p.stock -= q;
    const o = finishOrder({ id: S.nextOrder++, c: +d.get('c'), d: 0, s: 'Pending', p: d.get('pay'), ch: d.get('ch'), items: [{ p: p.id, q }] });
    S.orders.push(o);
    pushNotif('order', `Order #${o.id} created for ${S.cm.get(o.c).name} (${inr(o.total)})`, '/orders');
    toast(`Order #${o.id} created`); render(false); return null;
  });
}
function newProductModal() {
  openModal('Add product', `
    <label>Product name<input name="name" placeholder="e.g. Ceramic Mug Set" autocomplete="off"></label>
    <div class="row"><label>Category<select name="cat">${S.cats.map(c => `<option>${c}</option>`).join('')}</select></label>
    <label>Opening stock<input name="stock" type="number" min="0" value="50"></label></div>
    <div class="row"><label>Selling price (₹)<input name="price" type="number" min="1" value="499"></label>
    <label>Unit cost (₹)<input name="cost" type="number" min="1" value="300"></label></div>
    <label>Reorder level<input name="reorder" type="number" min="0" value="20"><span class="hint">You’ll get a low-stock alert at or below this number.</span></label>`,
  'Add product', f => {
    const d = new FormData(f), name = String(d.get('name')).trim(), price = +d.get('price'), cost = +d.get('cost');
    if (!name) return 'Give the product a name.';
    if (!(price > 0) || !(cost > 0)) return 'Price and cost must be greater than zero.';
    const id = Math.max(...S.products.map(p => p.id)) + 1;
    S.products.push({ id, name, sku: 'NEW-' + (100 + id), cat: d.get('cat'), price, cost, stock: +d.get('stock') || 0, reorder: +d.get('reorder') || 0 });
    reindex(); toast(`“${name}” added to inventory`); render(false); return null;
  });
}
function newExpenseModal() {
  openModal('Add expense', `
    <div class="row"><label>Category<select name="cat">${Object.keys(S.biz.budgets).map(c => `<option>${c}</option>`).join('')}</select></label>
    <label>Amount (₹)<input name="amt" type="number" min="1" placeholder="e.g. 4500"></label></div>
    <label>Vendor<input name="vendor" placeholder="Who was paid?" autocomplete="off"></label>
    <label>Note<input name="note" placeholder="Optional" autocomplete="off"></label>`,
  'Add expense', f => {
    const d = new FormData(f), amt = +d.get('amt'), vendor = String(d.get('vendor')).trim();
    if (!(amt > 0)) return 'Enter an amount greater than zero.';
    if (!vendor) return 'Add the vendor name.';
    S.expenses.unshift({ id: Date.now(), cat: d.get('cat'), amt, d: 0, vendor, note: String(d.get('note')).trim() || d.get('cat') });
    toast(`${inr(amt)} expense added`); render(false); return null;
  });
}
function newTaskModal() {
  openModal('New task', `
    <label>Task<input name="title" placeholder="What needs to be done?" autocomplete="off"></label>
    <div class="row"><label>Assign to<select name="who">${S.employees.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></label>
    <label>Priority<select name="pri"><option>High</option><option selected>Medium</option><option>Low</option></select></label></div>
    <label>Due in (days)<input name="due" type="number" value="3"></label>`,
  'Add task', f => {
    const d = new FormData(f), title = String(d.get('title')).trim();
    if (!title) return 'Describe the task first.';
    S.tasks.push({ id: Date.now(), title, who: +d.get('who'), due: parseInt(d.get('due'), 10) || 0, pri: d.get('pri'), st: 'todo' });
    toast('Task added to To do'); render(false); return null;
  });
}

/* ================= PAGE: dashboard ================= */
pages.dashboard = v => {
  const m = metrics(S.range), b = buckets(S.range), cs = custStats();
  const lowItems = S.products.filter(p => p.stock <= p.reorder).sort((a, c) => a.stock / a.reorder - c.stock / c.reorder);
  const invValue = sum(S.products, p => p.stock * p.cost);
  const active = S.employees.filter(e => e.status !== 'On leave').length;
  const payroll = sum(S.employees, e => e.salary);
  const topExp = Object.entries(m.expC.reduce((a, e) => (a[e.cat] = (a[e.cat] || 0) + e.amt, a), {})).sort((x, y) => y[1] - x[1])[0];
  const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const kpi = (cls, emoji, label, val, fmt, delta, sub, sp) => `<div class="card kpi ${cls}"><div class="kpi-top"><span class="kpi-emoji">${emoji}</span>${label}</div><div class="kpi-val" data-count="${val}" data-fmt="${fmt}">0</div><div class="kpi-sub">${delta || ''}${sub}</div>${sp || ''}</div>`;
  const recent = S.orders.slice().sort((a, c) => c.id - a.id).slice(0, 7);
  const feed = [
    ...S.orders.slice().sort((a, c) => c.id - a.id).slice(0, 8).map(o => ({ k: o.id, d: o.d, c: S.cm.get(o.c), txt: o.s === 'Cancelled' ? `cancelled order #${o.id}` : `placed order #${o.id} · ${inr(o.total)}`, act: `data-act="open-order" data-id="${o.id}"` })),
    ...S.customers.filter(c => c.j <= 14).map(c => ({ k: 0, d: c.j, c, txt: 'joined as a new customer', act: `data-act="open-customer" data-id="${c.id}"` }))
  ].sort((x, y) => x.d - y.d || y.k - x.k).slice(0, 7);
  const dueTasks = S.tasks.filter(t => t.st !== 'done').sort((x, y) => x.due - y.due).slice(0, 5);

  v.innerHTML = `
  <div class="page-head"><div><h2>${greet}, ${esc(S.biz.owner.split(' ')[0])}</h2><p>Here’s how ${esc(S.biz.name)} is doing — ${rangeNote()}, compared with the period before.</p></div>
  <div class="actions"><button class="btn" data-act="simulate">${icon('bolt', 16)} Simulate new order</button><button class="btn primary" data-act="new-order">${icon('plus', 16)} New order</button></div></div>

  <div class="grid">
    ${kpi('hero s6', '💰', 'Revenue', m.rev, 'money', deltaPill(pct(m.rev, m.revP)), `vs ${inrC(m.revP)} before`, spark(b.rev))}
    ${kpi('s3', '🛒', 'Orders', m.orders, 'int', deltaPill(pct(m.orders, m.ordersP)), `Avg ${inrC(m.aov)}`)}
    ${kpi('s3', '👥', 'Active customers', m.active, 'int', deltaPill(pct(m.active, m.activeP)), `${m.newC} new`)}
  </div>
  <div class="grid">
    ${kpi('s3', '📦', 'Inventory value', invValue, 'moneyC', '', lowItems.length ? `<span class="badge b-warn">${lowItems.length} need restock</span>` : '<span class="badge b-ok">All stocked</span>')}
    ${kpi('s3', '👨‍💼', 'Employees', active, 'int', '', `of ${S.employees.length} · payroll ${inrC(payroll)}/mo`)}
    ${kpi('s3', '💳', 'Expenses', m.exp, 'moneyC', deltaPill(pct(m.exp, m.expP), false), topExp ? `Mostly ${topExp[0].toLowerCase()}` : '')}
    ${kpi('s3', '📈', 'Business growth', m.growth, 'pct', '', `Profit margin ${m.margin.toFixed(1)}%`)}
  </div>

  <div class="grid">
    <section class="card s8"><div class="card-head"><div><h3>Sales graph</h3><p>${RANGES[S.range].label}</p></div>
      <div class="seg" role="group" aria-label="Chart metric"><button data-act="sales-metric" data-v="rev" aria-pressed="true">Revenue</button><button data-act="sales-metric" data-v="cnt" aria-pressed="false">Orders</button></div></div>
      <div class="card-body"><div class="chart" id="salesChart"></div></div></section>
    <section class="card s4"><div class="card-head"><div><h3>Revenue by category</h3><p>${RANGES[S.range].label}</p></div></div>
      <div class="card-body"><div class="chart" id="catChart" style="min-height:0"></div></div></section>
  </div>

  <div class="grid">
    <section class="card s8"><div class="card-head"><div><h3>Revenue vs expenses</h3><p>Business growth, month by month (last 12 months)</p></div>
      <div class="legend"><span><i style="background:var(--accent)"></i>Revenue</span><span><i style="background:var(--gold)"></i>Expenses</span></div></div>
      <div class="card-body"><div class="chart" id="growthChart"></div></div></section>
    <section class="card s4"><div class="card-head"><div><h3>🔔 Notifications</h3><p>${unread()} unread</p></div><button class="linkish" data-act="mark-read">Mark all as read</button></div>
      <div class="card-body"><div class="list" id="dashNotifs">${S.notifs.slice().sort((x, y) => y.t - x.t).slice(0, 5).map(notifItem).join('')}</div></div></section>
  </div>

  <div class="grid">
    <section class="card s8"><div class="card-head"><div><h3>Recent orders</h3></div><a class="linkish" href="#/orders">View all orders</a></div>
      <div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th class="hide-sm">Date</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>
      ${recent.map(o => `<tr data-open data-act="open-order" data-id="${o.id}" tabindex="0"><td class="cell-main">#${o.id}</td><td>${esc(S.cm.get(o.c).name)}</td><td class="hide-sm muted">${agoDays(o.d)}</td><td class="r num">${inr(o.total)}</td><td>${badge(o.s)}</td></tr>`).join('')}
      </tbody></table></div></section>
    <section class="card s4"><div class="card-head"><div><h3>Inventory alerts</h3><p>${lowItems.length} products at or below reorder level</p></div></div>
      <div class="card-body"><div class="list">${lowItems.slice(0, 5).map(p => `<div class="list-item"><span class="grow"><span class="t trunc">${esc(p.name)}</span><span class="s">${p.stock <= 0 ? 'Out of stock' : p.stock + ' left'} · reorder at ${p.reorder}</span></span><button class="btn sm" data-act="restock" data-id="${p.id}">Restock</button></div>`).join('') || '<p class="muted">Everything is above its reorder level.</p>'}</div>
      ${lowItems.length > 5 ? '<p style="margin-top:10px"><a class="linkish" href="#/products">See all alerts</a></p>' : ''}</div></section>
  </div>

  <div class="grid">
    <section class="card s6"><div class="card-head"><div><h3>Customer activity</h3></div><a class="linkish" href="#/customers">All customers</a></div>
      <div class="card-body"><div class="list">${feed.map(f => `<button class="list-item" ${f.act}>${avatar(f.c.name, f.c.id)}<span class="grow"><span class="t"><b>${esc(f.c.name)}</b> ${f.txt}</span><span class="s">${agoDays(f.d)} · ${esc(f.c.city)} · ${cs.get(f.c.id).tier}</span></span></button>`).join('')}</div></div></section>
    <section class="card s6"><div class="card-head"><div><h3>Tasks coming up</h3></div><a class="linkish" href="#/tasks">Open board</a></div>
      <div class="card-body"><div class="list">${dueTasks.map(t => `<div class="list-item">${avatar(S.em.get(t.who).name, t.who, 'sm')}<span class="grow"><span class="t trunc">${esc(t.title)}</span><span class="s ${t.due < 0 ? 'overdue' : ''}">${dueLabel(t.due)} · ${esc(S.em.get(t.who).name)}</span></span>${badge(t.pri)}</div>`).join('')}</div></div></section>
  </div>`;

  let metric = 'rev';
  const salesEl = $('#salesChart', v);
  const drawSales = () => lineChart(salesEl, {
    labels: b.labels, tips: b.tips, label: 'Sales over time',
    series: [{ name: metric === 'rev' ? 'Revenue' : 'Orders', values: metric === 'rev' ? b.rev : b.cnt, color: 'var(--accent)', area: true }],
    axis: x => short(x, metric === 'rev'), fmt: x => metric === 'rev' ? inr(x) : num(x) + ' orders'
  });
  S.redraw.push(drawSales);
  ACT['sales-metric'] = el => { metric = el.dataset.v; $$('[data-act="sales-metric"]').forEach(x => x.setAttribute('aria-pressed', String(x === el))); drawSales(); };

  const cat = catRevenue(m.cur);
  S.redraw.push(() => donut($('#catChart', v), { items: cat, center: inrC(m.rev), centerLabel: 'revenue', fmt: inrC, label: 'Revenue by category' }));

  const g = buckets('12m');
  S.redraw.push(() => barChart($('#growthChart', v), {
    labels: g.labels, tips: g.tips.map(t => t), label: 'Revenue versus expenses by month',
    series: [{ name: 'Revenue', values: g.rev, color: 'var(--accent)' }, { name: 'Expenses', values: g.exp, color: 'var(--gold)' }],
    axis: x => short(x, true), fmt: inr
  }));
};

/* ================= PAGE: orders ================= */
pages.orders = v => {
  const m = metrics(S.range), days = m.days, f = S.f.orders;
  const all = S.orders.filter(o => o.d < days);
  const cancelled = all.filter(o => !live(o)).length;
  v.innerHTML = `
  <div class="page-head"><div><h2>Sales &amp; Orders</h2><p>${all.length} orders in the ${rangeNote()}. Select an order to see its items and update its status.</p></div>
  <div class="actions"><button class="btn" data-act="export-orders">${icon('download', 16)} Export CSV</button><button class="btn primary" data-act="new-order">${icon('plus', 16)} New order</button></div></div>
  <div class="grid">
    ${statCard('💰', 'Revenue', inrC(m.rev), deltaPill(pct(m.rev, m.revP)) + ' vs previous')}
    ${statCard('🛒', 'Orders', num(m.orders), deltaPill(pct(m.orders, m.ordersP)) + ' vs previous')}
    ${statCard('🧾', 'Average order', inrC(m.aov), 'Per completed order')}
    ${statCard('↩️', 'Cancelled', `${all.length ? (cancelled / all.length * 100).toFixed(1) : 0}%`, `${cancelled} of ${all.length} orders`)}
  </div>
  <section class="card"><div class="toolbar">
    <input class="grow" type="search" data-in="orders-q" placeholder="Search by order number or customer" value="${esc(f.q)}" aria-label="Search orders">
    <select data-in="orders-ch" aria-label="Channel"><option value="All">All channels</option>${S.meta.channels.map(c => `<option ${c === f.ch ? 'selected' : ''}>${c}</option>`).join('')}</select>
    <select data-in="orders-sort" aria-label="Sort orders"><option value="new" ${f.sort === 'new' ? 'selected' : ''}>Newest first</option><option value="old" ${f.sort === 'old' ? 'selected' : ''}>Oldest first</option><option value="high" ${f.sort === 'high' ? 'selected' : ''}>Highest value</option><option value="low" ${f.sort === 'low' ? 'selected' : ''}>Lowest value</option></select>
    <div id="orderChips" style="width:100%"></div></div>
    <div id="orderRes"></div></section>`;
  const draw = () => {
    const q = f.q.trim().toLowerCase().replace(/^#/, '');
    const base = all.filter(o => (f.ch === 'All' || o.ch === f.ch) && (!q || String(o.id).includes(q) || S.cm.get(o.c).name.toLowerCase().includes(q)));
    const counts = s => s === 'All' ? base.length : base.filter(o => o.s === s).length;
    $('#orderChips', v).innerHTML = chips(['All', ...S.meta.statuses].map(s => [s, s, counts(s)]), f.status, 'orders-status');
    let list = base.filter(o => f.status === 'All' || o.s === f.status);
    list.sort({ new: (a, b) => b.id - a.id, old: (a, b) => a.id - b.id, high: (a, b) => b.total - a.total, low: (a, b) => a.total - b.total }[f.sort]);
    const per = 10, pg = Math.min(f.page, Math.max(1, Math.ceil(list.length / per))); f.page = pg;
    $('#orderRes', v).innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th class="hide-sm">Date</th><th class="hide-sm">Channel</th><th class="hide-sm">Payment</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>
      ${list.slice((pg - 1) * per, pg * per).map(o => `<tr data-open data-act="open-order" data-id="${o.id}" tabindex="0"><td class="cell-main">#${o.id}</td><td><div class="cell-main">${esc(S.cm.get(o.c).name)}</div><div class="cell-sub">${o.items.length} item${o.items.length > 1 ? 's' : ''}</div></td><td class="hide-sm">${fmtD(o.d)}</td><td class="hide-sm">${o.ch}</td><td class="hide-sm">${o.p}</td><td class="r num">${inr(o.total)}</td><td>${badge(o.s)}</td></tr>`).join('')}
      </tbody></table></div>${pager(list.length, pg, per, 'orders-page')}`
      : `<div class="empty"><strong>No orders match these filters</strong>Clear the search box or choose “All” to see every order.</div>`;
    S.exportOrders = list;
  };
  draw(); S.drawOrders = draw;
};
INP['orders-q'] = el => { S.f.orders.q = el.value; S.f.orders.page = 1; S.drawOrders(); };
INP['orders-ch'] = el => { S.f.orders.ch = el.value; S.f.orders.page = 1; S.drawOrders(); };
INP['orders-sort'] = el => { S.f.orders.sort = el.value; S.drawOrders(); };
ACT['orders-status'] = el => { S.f.orders.status = el.dataset.v; S.f.orders.page = 1; S.drawOrders(); };
ACT['orders-page'] = el => { S.f.orders.page = +el.dataset.p; S.drawOrders(); };
ACT['export-orders'] = () => {
  const rows = [['Order', 'Date', 'Customer', 'Channel', 'Payment', 'Status', 'Total (INR)']];
  (S.exportOrders || []).forEach(o => rows.push([o.id, fmtD(o.d), S.cm.get(o.c).name, o.ch, o.p, o.s, o.total]));
  downloadCSV('demo-orders.csv', rows); toast(`Exported ${rows.length - 1} orders`);
};

/* ================= PAGE: customers ================= */
pages.customers = v => {
  const m = metrics(S.range), cs = custStats(), f = S.f.customers;
  const gold = [...cs.values()].filter(s => s.tier === 'Gold').length;
  const buyers = [...cs.values()].filter(s => s.orders);
  v.innerHTML = `
  <div class="page-head"><div><h2>Customers</h2><p>${S.customers.length} customers. Tiers are based on lifetime spend: Gold from ₹10 L, Silver from ₹5 L.</p></div></div>
  <div class="grid">
    ${statCard('👥', 'Total customers', num(S.customers.length), `${m.newC} joined in the ${rangeNote()}`)}
    ${statCard('🛍️', 'Active', num(m.active), deltaPill(pct(m.active, m.activeP)) + ' vs previous')}
    ${statCard('🥇', 'Gold members', num(gold), 'Highest-spending customers')}
    ${statCard('💎', 'Avg lifetime value', inrC(buyers.length ? sum(buyers, s => s.ltv) / buyers.length : 0), 'Across all buyers')}
  </div>
  <section class="card"><div class="toolbar">
    <input class="grow" type="search" data-in="cust-q" placeholder="Search by name or city" value="${esc(f.q)}" aria-label="Search customers">
    ${chips([['All', 'All'], ['Gold', 'Gold'], ['Silver', 'Silver'], ['Regular', 'Regular']], f.tier, 'cust-tier')}</div>
    <div id="custRes"></div></section>`;
  const draw = () => {
    const q = f.q.trim().toLowerCase();
    const list = S.customers.filter(c => (f.tier === 'All' || cs.get(c.id).tier === f.tier) && (!q || (c.name + ' ' + c.city).toLowerCase().includes(q)))
      .sort((a, b) => cs.get(b.id).ltv - cs.get(a.id).ltv);
    $('#custRes', v).innerHTML = list.length ? `<div class="cards">${list.map(c => { const s = cs.get(c.id); return `<button class="pcard" data-act="open-customer" data-id="${c.id}"><div class="top">${avatar(c.name, c.id)}<div><div class="cell-main">${esc(c.name)}</div><div class="cell-sub">${esc(c.city)}</div></div><span style="margin-left:auto">${badge(s.tier)}</span></div>
      <div class="meta"><span><b class="num">${inrC(s.ltv)}</b>Lifetime value</span><span><b class="num">${s.orders}</b>Orders</span><span><b>${s.last === null ? '—' : agoDays(s.last)}</b>Last order</span></div></button>`; }).join('')}</div>`
      : `<div class="empty"><strong>No customers found</strong>Try a different name, city or tier.</div>`;
  };
  draw(); S.drawCust = draw;
};
INP['cust-q'] = el => { S.f.customers.q = el.value; S.drawCust(); };
ACT['cust-tier'] = el => { S.f.customers.tier = el.dataset.v; $$('[data-act="cust-tier"]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); S.drawCust(); };

/* ================= PAGE: products ================= */
pages.products = v => {
  const f = S.f.products, low = S.products.filter(p => stockState(p) === 'Low').length, out = S.products.filter(p => stockState(p) === 'Out').length;
  v.innerHTML = `
  <div class="page-head"><div><h2>Products &amp; Inventory</h2><p>Track stock levels and restock before you run out.</p></div>
  <div class="actions"><button class="btn primary" data-act="new-product">${icon('plus', 16)} Add product</button></div></div>
  <div class="grid">
    ${statCard('📦', 'Products', num(S.products.length), `${S.cats.length} categories`)}
    ${statCard('🏷️', 'Stock value (at cost)', inrC(sum(S.products, p => p.stock * p.cost)), `${num(sum(S.products, p => p.stock))} units on hand`)}
    ${statCard('⚠️', 'Low stock', num(low), 'At or below reorder level')}
    ${statCard('⛔', 'Out of stock', num(out), 'Cannot be ordered right now')}
  </div>
  <section class="card"><div class="toolbar">
    <input class="grow" type="search" data-in="prod-q" placeholder="Search by name or SKU" value="${esc(f.q)}" aria-label="Search products">
    <select data-in="prod-stock" aria-label="Stock status">${['All', 'In stock', 'Low', 'Out'].map(s => `<option value="${s}" ${s === f.stock ? 'selected' : ''}>${s === 'All' ? 'All stock levels' : s}</option>`).join('')}</select>
    <div id="prodChips" style="width:100%"></div></div><div id="prodRes"></div></section>`;
  const draw = () => {
    const q = f.q.trim().toLowerCase();
    const base = S.products.filter(p => (f.stock === 'All' || stockState(p) === f.stock) && (!q || (p.name + ' ' + p.sku).toLowerCase().includes(q)));
    $('#prodChips', v).innerHTML = chips([['All', 'All', base.length], ...S.cats.map(c => [c, c, base.filter(p => p.cat === c).length])], f.cat, 'prod-cat');
    const list = base.filter(p => f.cat === 'All' || p.cat === f.cat);
    const per = 10, pg = Math.min(f.page, Math.max(1, Math.ceil(list.length / per))); f.page = pg;
    $('#prodRes', v).innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Product</th><th class="hide-sm">Category</th><th class="r">Price</th><th class="r hide-sm">Margin</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.slice((pg - 1) * per, pg * per).map(p => { const st = stockState(p), w = Math.min(100, p.stock / (p.reorder * 4) * 100); return `<tr data-open data-act="open-product" data-id="${p.id}" tabindex="0"><td><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${p.sku}</div></td><td class="hide-sm">${p.cat}</td><td class="r num">${inr(p.price)}</td><td class="r num hide-sm">${((p.price - p.cost) / p.price * 100).toFixed(0)}%</td>
        <td style="min-width:120px"><div class="num" style="font-weight:700">${num(p.stock)}</div><div class="progress ${st === 'Out' ? 'bad' : st === 'Low' ? 'warn' : ''}"><i style="width:${w}%"></i></div></td><td>${badge(st)}</td><td class="r"><button class="btn sm" data-act="restock" data-id="${p.id}">Restock</button></td></tr>`; }).join('')}
      </tbody></table></div>${pager(list.length, pg, per, 'prod-page')}`
      : `<div class="empty"><strong>No products match</strong>Change the category or stock filter.</div>`;
  };
  draw(); S.drawProd = draw;
};
INP['prod-q'] = el => { S.f.products.q = el.value; S.f.products.page = 1; S.drawProd(); };
INP['prod-stock'] = el => { S.f.products.stock = el.value; S.f.products.page = 1; S.drawProd(); };
ACT['prod-cat'] = el => { S.f.products.cat = el.dataset.v; S.f.products.page = 1; S.drawProd(); };
ACT['prod-page'] = el => { S.f.products.page = +el.dataset.p; S.drawProd(); };
ACT['new-product'] = () => newProductModal();
ACT['restock'] = el => {
  const p = S.pm.get(+el.dataset.id), add = Math.max(p.reorder, p.reorder * 3 - p.stock);
  p.stock += add; toast(`Restocked ${p.name}: +${num(add)} units`);
  if ($('#drawer').classList.contains('on')) closeDrawer();
  render(false);
};

/* ================= PAGE: employees ================= */
pages.employees = v => {
  const f = S.f.employees, depts = ['All', ...new Set(S.employees.map(e => e.dept))];
  const present = S.employees.filter(e => e.status !== 'On leave').length;
  v.innerHTML = `
  <div class="page-head"><div><h2>Employees</h2><p>Your team, attendance and payroll at a glance.</p></div></div>
  <div class="grid">
    ${statCard('👨‍💼', 'Headcount', num(S.employees.length), `${depts.length - 1} departments`)}
    ${statCard('🟢', 'Working today', num(present), `${S.employees.filter(e => e.status === 'Remote').length} working remotely`)}
    ${statCard('🌴', 'On leave', num(S.employees.length - present), 'Approved leave')}
    ${statCard('💳', 'Monthly payroll', inrC(sum(S.employees, e => e.salary)), `Avg attendance ${Math.round(sum(S.employees, e => e.att) / S.employees.length)}%`)}
  </div>
  <section class="card"><div class="toolbar"><input class="grow" type="search" data-in="emp-q" placeholder="Search by name or role" value="${esc(f.q)}" aria-label="Search employees">
    ${chips(depts.map(d => [d, d]), f.dept, 'emp-dept')}</div><div id="empRes"></div></section>`;
  const draw = () => {
    const q = f.q.trim().toLowerCase();
    const list = S.employees.filter(e => (f.dept === 'All' || e.dept === f.dept) && (!q || (e.name + ' ' + e.role).toLowerCase().includes(q)));
    $('#empRes', v).innerHTML = list.length ? `<div class="cards">${list.map(e => `<button class="pcard" data-act="open-employee" data-id="${e.id}"><div class="top">${avatar(e.name, e.id)}<div><div class="cell-main">${esc(e.name)}</div><div class="cell-sub">${esc(e.role)}</div></div><span style="margin-left:auto">${badge(e.status)}</span></div>
      <div><div class="meta"><span>Attendance</span><b style="font-size:13px;color:var(--text)">${e.att}%</b></div><div class="progress ${e.att < 90 ? 'warn' : ''}" style="margin-top:6px"><i style="width:${e.att}%"></i></div></div>
      <div class="meta"><span>${esc(e.dept)}</span><span class="num">${inr(e.salary)}/mo</span></div></button>`).join('')}</div>`
      : `<div class="empty"><strong>No employees found</strong>Try another department or name.</div>`;
  };
  draw(); S.drawEmp = draw;
};
INP['emp-q'] = el => { S.f.employees.q = el.value; S.drawEmp(); };
ACT['emp-dept'] = el => { S.f.employees.dept = el.dataset.v; $$('[data-act="emp-dept"]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); S.drawEmp(); };

/* ================= PAGE: expenses ================= */
pages.expenses = v => {
  const m = metrics(S.range), f = S.f.expenses, scale = m.days / 30;
  const by = {}; m.expC.forEach(e => by[e.cat] = (by[e.cat] || 0) + e.amt);
  const rows = Object.keys(S.biz.budgets).map(c => ({ c, spent: by[c] || 0, budget: S.biz.budgets[c] * scale }));
  const totBudget = sum(rows, r => r.budget);
  const top = rows.slice().sort((a, b) => b.spent - a.spent)[0];
  v.innerHTML = `
  <div class="page-head"><div><h2>Expenses</h2><p>Where the money went in the ${rangeNote()}, against a monthly budget (scaled to the period).</p></div>
  <div class="actions"><button class="btn primary" data-act="new-expense">${icon('plus', 16)} Add expense</button></div></div>
  <div class="grid">
    ${statCard('💳', 'Total expenses', inrC(m.exp), deltaPill(pct(m.exp, m.expP), false) + ' vs previous')}
    ${statCard('🎯', 'Budget used', `${totBudget ? Math.round(m.exp / totBudget * 100) : 0}%`, `of ${inrC(totBudget)} budget`)}
    ${statCard('🏷️', 'Biggest category', top.c, inrC(top.spent))}
    ${statCard('📈', 'Net profit', inrC(m.profit), `${m.margin.toFixed(1)}% margin`)}
  </div>
  <div class="grid">
    <section class="card s5"><div class="card-head"><div><h3>Spending by category</h3></div></div><div class="card-body"><div class="chart" id="expDonut" style="min-height:0"></div></div></section>
    <section class="card s7"><div class="card-head"><div><h3>Budget vs actual</h3><p>Bars turn amber near the limit and red when over budget</p></div></div>
      <div class="card-body"><div class="hbar">${rows.filter(r => r.spent || r.budget).map(r => { const p = r.budget ? r.spent / r.budget * 100 : 0; return `<div class="hbar-row"><span>${r.c}</span><div class="progress ${p > 100 ? 'bad' : p > 85 ? 'warn' : ''}"><i style="width:${Math.min(100, p)}%"></i></div><b>${inrC(r.spent)} <span class="muted" style="font-weight:600">/ ${inrC(r.budget)}</span></b></div>`; }).join('')}</div></div></section>
  </div>
  <section class="card"><div class="toolbar"><input class="grow" type="search" data-in="exp-q" placeholder="Search vendor or note" value="${esc(f.q)}" aria-label="Search expenses">
    <div id="expChips" style="width:100%"></div></div><div id="expRes"></div></section>`;
  S.redraw.push(() => donut($('#expDonut', v), { items: Object.entries(by).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, color: EXPCOL[label] || '#7a8a93' })), center: inrC(m.exp), centerLabel: 'total', fmt: inrC, label: 'Expenses by category' }));
  const draw = () => {
    const q = f.q.trim().toLowerCase(), base = m.expC.filter(e => !q || (e.vendor + ' ' + e.note).toLowerCase().includes(q));
    $('#expChips', v).innerHTML = chips([['All', 'All', base.length], ...Object.keys(S.biz.budgets).map(c => [c, c, base.filter(e => e.cat === c).length]).filter(x => x[2])], f.cat, 'exp-cat');
    const list = base.filter(e => f.cat === 'All' || e.cat === f.cat).sort((a, b) => a.d - b.d || b.id - a.id);
    const per = 10, pg = Math.min(f.page, Math.max(1, Math.ceil(list.length / per))); f.page = pg;
    $('#expRes', v).innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Vendor</th><th class="hide-sm">Note</th><th>Category</th><th class="r">Amount</th></tr></thead><tbody>
      ${list.slice((pg - 1) * per, pg * per).map(e => `<tr><td>${fmtD(e.d)}</td><td class="cell-main">${esc(e.vendor)}</td><td class="hide-sm muted">${esc(e.note)}</td><td><span class="badge plain" style="color:${EXPCOL[e.cat] || 'var(--muted)'};background:var(--surface-2)">${e.cat}</span></td><td class="r num">${inr(e.amt)}</td></tr>`).join('')}
      </tbody></table></div>${pager(list.length, pg, per, 'exp-page')}`
      : `<div class="empty"><strong>No expenses found</strong>Try a longer date range or clear the filters.</div>`;
  };
  draw(); S.drawExp = draw;
};
INP['exp-q'] = el => { S.f.expenses.q = el.value; S.f.expenses.page = 1; S.drawExp(); };
ACT['exp-cat'] = el => { S.f.expenses.cat = el.dataset.v; S.f.expenses.page = 1; S.drawExp(); };
ACT['exp-page'] = el => { S.f.expenses.page = +el.dataset.p; S.drawExp(); };
ACT['new-expense'] = () => newExpenseModal();

/* ================= PAGE: tasks ================= */
pages.tasks = v => {
  const f = S.f.tasks, cols = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']];
  const list = S.tasks.filter(t => f.who === 'All' || String(t.who) === f.who);
  v.innerHTML = `
  <div class="page-head"><div><h2>Tasks</h2><p>${S.tasks.filter(t => t.st !== 'done').length} open tasks. Use the arrows on a card to move it along the board.</p></div>
  <div class="actions"><select class="field" data-in="task-who" style="width:auto" aria-label="Filter by assignee"><option value="All">Everyone</option>${S.employees.map(e => `<option value="${e.id}" ${String(e.id) === f.who ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
  <button class="btn primary" data-act="new-task">${icon('plus', 16)} New task</button></div></div>
  <div class="board">${cols.map(([k, label], ci) => { const items = list.filter(t => t.st === k).sort((a, b) => a.due - b.due); return `<section class="col" aria-label="${label}"><h3>${label}<span>${items.length}</span></h3>
    ${items.map(t => `<article class="task ${k === 'done' ? 'done' : ''}"><div class="t">${esc(t.title)}</div><div class="row">${avatar(S.em.get(t.who).name, t.who, 'sm')}<span>${esc(S.em.get(t.who).name.split(' ')[0])}</span>${badge(t.pri)}
      <span class="push"><button class="mini-btn" data-act="task-move" data-id="${t.id}" data-dir="-1" aria-label="Move to ${ci > 0 ? cols[ci - 1][1] : 'previous column'}" ${ci === 0 ? 'disabled' : ''}>${icon('left', 14)}</button><button class="mini-btn" data-act="task-move" data-id="${t.id}" data-dir="1" aria-label="Move to ${ci < 2 ? cols[ci + 1][1] : 'next column'}" ${ci === 2 ? 'disabled' : ''}>${icon('right', 14)}</button></span></div>
      ${k !== 'done' ? `<div class="s ${t.due < 0 ? 'overdue' : 'muted'}" style="font-size:12.5px">${dueLabel(t.due)}</div>` : ''}</article>`).join('') || '<p class="muted" style="padding:8px 6px">Nothing here.</p>'}</section>`; }).join('')}</div>`;
};
INP['task-who'] = el => { S.f.tasks.who = el.value; render(false); };
ACT['new-task'] = () => newTaskModal();
ACT['task-move'] = el => {
  const t = S.tasks.find(x => x.id === +el.dataset.id), order = ['todo', 'doing', 'done'], i = order.indexOf(t.st) + +el.dataset.dir;
  if (i < 0 || i > 2) return;
  t.st = order[i]; toast(`Moved to ${['To do', 'In progress', 'Done'][i]}`); render(false);
};

/* ================= PAGE: reports ================= */
pages.reports = v => {
  const m = metrics(S.range), b = buckets('12m');
  const prodRev = new Map(), custRev = new Map(), chRev = {}, dow = Array(7).fill(0);
  for (const o of m.cur) {
    custRev.set(o.c, (custRev.get(o.c) || 0) + o.total); chRev[o.ch] = (chRev[o.ch] || 0) + o.total; dow[dateOf(o.d).getDay()] += o.total;
    for (const it of o.items) { const p = S.pm.get(it.p); prodRev.set(p.id, (prodRev.get(p.id) || 0) + p.price * it.q); }
  }
  const topP = [...prodRev].sort((a, c) => c[1] - a[1]).slice(0, 6), topC = [...custRev].sort((a, c) => c[1] - a[1]).slice(0, 5);
  const maxP = topP[0] ? topP[0][1] : 1;
  const dowOrder = [1, 2, 3, 4, 5, 6, 0];
  v.innerHTML = `
  <div class="page-head"><div><h2>Reports &amp; Analytics</h2><p>Profit, best sellers and sales patterns for the ${rangeNote()}.</p></div>
  <div class="actions"><button class="btn primary" data-act="export-report">${icon('download', 16)} Download report (CSV)</button></div></div>
  <div class="grid">
    <section class="card s5"><div class="card-head"><div><h3>Profit &amp; loss</h3><p>${RANGES[S.range].label}</p></div></div><div class="card-body"><table><tbody>
      <tr><td>Revenue</td><td class="r num cell-main">${inr(m.rev)}</td></tr>
      <tr><td class="muted">Cost of goods sold</td><td class="r num">− ${inr(m.cogs)}</td></tr>
      <tr><td>Gross profit <span class="muted">(${m.rev ? (m.gross / m.rev * 100).toFixed(1) : 0}%)</span></td><td class="r num cell-main">${inr(m.gross)}</td></tr>
      <tr><td class="muted">Operating expenses</td><td class="r num">− ${inr(m.exp)}</td></tr>
      <tr><td class="cell-main">Net profit <span class="muted">(${m.margin.toFixed(1)}%)</span></td><td class="r num cell-main" style="color:${m.profit >= 0 ? 'var(--good)' : 'var(--bad)'}">${inr(m.profit)}</td></tr></tbody></table></div></section>
    <section class="card s7"><div class="card-head"><div><h3>Revenue and net profit</h3><p>Last 12 months</p></div><div class="legend"><span><i style="background:var(--accent)"></i>Revenue</span><span><i style="background:var(--gold)"></i>Net profit</span></div></div>
      <div class="card-body"><div class="chart" id="rptTrend"></div></div></section>
  </div>
  <div class="grid">
    <section class="card s6"><div class="card-head"><div><h3>Top products</h3><p>By revenue</p></div></div><div class="card-body"><div class="hbar">${topP.map(([id, val]) => `<div class="hbar-row"><span>${esc(S.pm.get(id).name)}</span><div class="progress"><i style="width:${val / maxP * 100}%"></i></div><b>${inrC(val)}</b></div>`).join('')}</div></div></section>
    <section class="card s6"><div class="card-head"><div><h3>Top customers</h3><p>By spend</p></div></div><div class="card-body"><div class="list">${topC.map(([id, val]) => `<button class="list-item" data-act="open-customer" data-id="${id}">${avatar(S.cm.get(id).name, id)}<span class="grow"><span class="t">${esc(S.cm.get(id).name)}</span><span class="s">${esc(S.cm.get(id).city)}</span></span><b class="num">${inrC(val)}</b></button>`).join('')}</div></div></section>
  </div>
  <div class="grid">
    <section class="card s5"><div class="card-head"><div><h3>Sales by channel</h3></div></div><div class="card-body"><div class="chart" id="rptCh" style="min-height:0"></div></div></section>
    <section class="card s7"><div class="card-head"><div><h3>Revenue by weekday</h3><p>Which days bring in the most</p></div></div><div class="card-body"><div class="chart" id="rptDow" style="min-height:220px"></div></div></section>
  </div>`;
  S.redraw.push(() => lineChart($('#rptTrend', v), {
    labels: b.labels, tips: b.tips, label: 'Revenue and net profit by month',
    series: [{ name: 'Revenue', values: b.rev, color: 'var(--accent)', area: true }, { name: 'Net profit', values: b.profit, color: 'var(--gold)' }],
    axis: x => short(x, true), fmt: inr
  }));
  S.redraw.push(() => donut($('#rptCh', v), { items: Object.entries(chRev).sort((a, c) => c[1] - a[1]).map(([label, value], i) => ({ label, value, color: CATCOL[i] })), center: inrC(m.rev), centerLabel: 'revenue', fmt: inrC, label: 'Sales by channel' }));
  S.redraw.push(() => barChart($('#rptDow', v), {
    labels: dowOrder.map(i => DOW[i]), height: 230, label: 'Revenue by weekday',
    series: [{ name: 'Revenue', values: dowOrder.map(i => dow[i]), color: 'var(--accent)' }], axis: x => short(x, true), fmt: inr
  }));
  S.report = { m, topP, topC };
};
ACT['export-report'] = () => {
  const { m, topP, topC } = S.report;
  const rows = [['Smart Business OS demo report (fictional data)', RANGES[S.range].label], [], ['Metric', 'Value (INR)'],
    ['Revenue', m.rev], ['Cost of goods sold', m.cogs], ['Gross profit', m.gross], ['Operating expenses', m.exp], ['Net profit', m.profit], [],
    ['Top products', 'Revenue (INR)'], ...topP.map(([id, v]) => [S.pm.get(id).name, v]), [], ['Top customers', 'Spend (INR)'], ...topC.map(([id, v]) => [S.cm.get(id).name, v])];
  downloadCSV('demo-report.csv', rows); toast('Report downloaded');
};

/* ================= PAGE: settings ================= */
pages.settings = v => {
  const sw = (id, on, label) => `<div class="set-row"><div><b>${label[0]}</b><small>${label[1]}</small></div><button class="switch" role="switch" aria-checked="${on}" aria-label="${label[0]}" data-act="toggle" data-k="${id}"></button></div>`;
  S.prefs = S.prefs || { low: true, orders: true, daily: false, digest: true };
  v.innerHTML = `
  <div class="page-head"><div><h2>Settings</h2><p>Personalise this demo workspace. Nothing here is saved to a server.</p></div></div>
  <div class="grid">
    <section class="card s6"><div class="card-head"><h3>Business profile</h3></div><div class="card-body">
      <form class="form" data-form="profile">
        <label>Business name<input name="name" value="${esc(S.biz.name)}" maxlength="40"></label>
        <label>Owner name<input name="owner" value="${esc(S.biz.owner)}" maxlength="40"></label>
        <label>Currency<select disabled><option>Indian Rupee (₹)</option></select></label>
        <div><button class="btn primary" type="submit">Save profile</button></div></form></div></section>
    <section class="card s6"><div class="card-head"><h3>Appearance</h3></div><div class="card-body">
      <div class="set-row"><div><b>Theme</b><small>Light, dark, or follow your device</small></div>
        <div class="seg" role="group" aria-label="Theme">${['light', 'dark', 'system'].map(t => `<button data-act="set-theme" data-v="${t}" aria-pressed="${S.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
      <div class="set-row"><div><b>Accent colour</b><small>Used for charts, buttons and highlights</small></div>
        <div class="swatches">${ACCENTS.map(([n, c]) => `<button class="swatch" data-act="set-accent" data-v="${c || ''}" aria-label="${n}" aria-pressed="${(S.accent || '') === (c || '')}" style="background:${c || '#0e8f8a'}"></button>`).join('')}</div></div></div></section>
  </div>
  <div class="grid">
    <section class="card s6"><div class="card-head"><h3>Notifications</h3></div><div class="card-body">
      ${sw('low', S.prefs.low, ['Low-stock alerts', 'Tell me when a product reaches its reorder level'])}
      ${sw('orders', S.prefs.orders, ['New order alerts', 'Notify me for every incoming order'])}
      ${sw('daily', S.prefs.daily, ['Daily sales summary', 'A short recap each evening'])}</div></section>
    <section class="card s6"><div class="card-head"><h3>Demo controls</h3></div><div class="card-body">
      <div class="set-row"><div><b>Simulate an incoming order</b><small>Adds a new order, a notification and updates stock</small></div><button class="btn" data-act="simulate">${icon('bolt', 16)} Simulate</button></div>
      <div class="set-row"><div><b>Reset demo data</b><small>Restore the original fictional data set</small></div><button class="btn danger" data-act="reset">Reset</button></div></div></section>
  </div>`;
};
ACT['toggle'] = el => { const k = el.dataset.k, on = el.getAttribute('aria-checked') !== 'true'; S.prefs[k] = on; el.setAttribute('aria-checked', String(on)); };
ACT['set-theme'] = el => { applyTheme(el.dataset.v); $$('[data-act="set-theme"]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); };
ACT['set-accent'] = el => { applyAccent(el.dataset.v || null); $$('[data-act="set-accent"]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); S.redraw.forEach(f => f()); };
ACT['reset'] = () => { hydrate(JSON.parse(JSON.stringify(RAW))); S.prefs = null; renderBell(); applyBiz(); toast('Demo data reset'); render(false); };

/* ================= shared actions ================= */
ACT['open-order'] = el => { closeDropdowns(); orderDrawer(+el.dataset.id); };
ACT['open-customer'] = el => { closeDropdowns(); customerDrawer(+el.dataset.id); };
ACT['open-product'] = el => { closeDropdowns(); productDrawer(+el.dataset.id); };
ACT['open-employee'] = el => { closeDropdowns(); employeeDrawer(+el.dataset.id); };
ACT['new-order'] = el => { closeDrawer(); newOrderModal(el.dataset.c ? +el.dataset.c : undefined); };
ACT['close-modal'] = () => closeModal();
ACT['mark-read'] = () => { S.notifs.forEach(n => n.read = true); renderBell(); const d = $('#dashNotifs'); if (d) render(false); };
ACT['open-notif'] = el => {
  const n = S.notifs.find(x => String(x.id) === el.dataset.id); if (!n) return;
  n.read = true; renderBell(); closeDropdowns();
  if (location.hash === '#' + n.link) render(false); else location.hash = n.link;
};
ACT['simulate'] = () => {
  const c = S.customers[Math.floor(Math.random() * S.customers.length)];
  const avail = S.products.filter(p => p.stock > 2), p = avail[Math.floor(Math.random() * avail.length)], q = 1 + Math.floor(Math.random() * 6);
  const qty = Math.min(q, p.stock); p.stock -= qty;
  const o = finishOrder({ id: S.nextOrder++, c: c.id, d: 0, s: 'Pending', p: ['UPI', 'Card', 'COD'][Math.floor(Math.random() * 3)], ch: 'Website', items: [{ p: p.id, q: qty }] });
  S.orders.push(o);
  pushNotif('order', `New online order #${o.id} from ${c.name} · ${inr(o.total)}`, '/orders');
  if (p.stock <= p.reorder) pushNotif('stock', `Low stock: ${p.name} has ${p.stock} units left`, '/products');
  toast(`New order #${o.id} · ${inr(o.total)}`); render(false);
};
function closeDropdowns() {
  $('#bellDD').hidden = true; $('#bellBtn').setAttribute('aria-expanded', 'false'); $('#searchDD').hidden = true;
}
function applyBiz() { $('#bizName').textContent = S.biz.name; $('#userName').textContent = S.biz.owner; $('#userAv').textContent = initials(S.biz.owner); }

/* ================= events ================= */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) { if (el.tagName === 'A') e.preventDefault(); ACT[el.dataset.act](el, e); return; }
  if (!e.target.closest('.bell-wrap')) { $('#bellDD').hidden = true; $('#bellBtn').setAttribute('aria-expanded', 'false'); }
  if (!e.target.closest('.search')) $('#searchDD').hidden = true;
});
document.addEventListener('keydown', e => {
  const el = e.target.closest && e.target.closest('[data-act][tabindex]');
  if (el && (e.key === 'Enter' || e.key === ' ') && el.tagName !== 'BUTTON') { e.preventDefault(); ACT[el.dataset.act](el, e); return; }
  if (e.key === 'Escape') { closeAll(); closeDropdowns(); }
  else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); }
  else if (e.key === 'Enter' && e.target.id === 'q') { const first = $('#searchDD .dd-item'); if (first) first.click(); }
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-in]'); if (el && INP[el.dataset.in]) INP[el.dataset.in](el);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  if (f.dataset.form === 'order-status') {
    const o = S.orders.find(x => x.id === +f.dataset.id), s = new FormData(f).get('s');
    if (o.s !== s) { o.s = s; toast(`Order #${o.id} marked ${s.toLowerCase()}`); render(false); orderDrawer(o.id); }
  } else if (f.dataset.form === 'profile') {
    const d = new FormData(f); S.biz.name = String(d.get('name')).trim() || S.biz.name; S.biz.owner = String(d.get('owner')).trim() || S.biz.owner;
    applyBiz(); toast('Profile saved (demo only)');
  }
});
$('#overlay').addEventListener('click', closeAll);
$('#drawerClose').addEventListener('click', () => { closeDrawer(); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
$('#rangeSeg').addEventListener('click', e => { const b = e.target.closest('[data-range]'); if (b) { setRange(b.dataset.range); store('sbos-range', b.dataset.range); render(false); } });
$('#themeBtn').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
$('#bellBtn').addEventListener('click', () => {
  const dd = $('#bellDD'); dd.hidden = !dd.hidden; $('#bellBtn').setAttribute('aria-expanded', String(!dd.hidden)); $('#searchDD').hidden = true;
});
$('#menuBtn').addEventListener('click', () => { const o = $('#sidebar').classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', String(o)); });
$('#nav').addEventListener('click', () => { $('#sidebar').classList.remove('open'); });
$('#q').addEventListener('input', e => runSearch(e.target.value));
$('#q').addEventListener('focus', e => { if (e.target.value) runSearch(e.target.value); });
window.addEventListener('hashchange', route);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.theme === 'system') applyTheme('system', false); });

/* ================= boot ================= */
async function boot() {
  let raw;
  try {
    if (location.protocol === 'file:') throw new Error('file protocol');
    const r = await fetch('data.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    raw = await r.json();
  } catch (err) {
    raw = JSON.parse($('#data-fallback').textContent);   // opened from disk: use the embedded copy
  }
  hydrate(raw);
  $('#searchIcon').innerHTML = icon('search'); $('#menuBtn').innerHTML = icon('menu'); $('#bellBtn').innerHTML = icon('bell');
  $('#drawerClose').innerHTML = icon('x');
  buildNav();
  const sv = load('sbos-theme') || 'light'; applyTheme(['light', 'dark', 'system'].includes(sv) ? sv : 'light', false);
  const ac = load('sbos-accent'); if (ac) applyAccent(ac, false);
  const rg = load('sbos-range'); setRange(RANGES[rg] ? rg : '30d');
  applyBiz(); renderBell();
  const bell = document.createElement('span'); bell.className = 'count'; bell.textContent = unread();
  $('#nav a[data-page="dashboard"]').appendChild(bell); bell.hidden = true;
  route();
  setTimeout(() => toast('Tip: press / to search, or try dark mode in the top bar'), 2500);
}
boot();
})();

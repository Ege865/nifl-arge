/* NIFL ARGE — shared: dither and halftone grounds, nav sheet, FAQ, form, helpers. */
import { iletisim } from '../data/site.js?v=25';
import { dbAcik, talepGonder } from './db.js?v=25';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const gsapOk = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ARROW = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h9M7.5 3.5 11 7l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- ordered dither (8x8 Bayer) ---------- */
const B8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
const CORAL = (255 << 24) | (74 << 16) | (107 << 8) | 255;

/* field(x, y, w, h, phase) returns 0..1 density for a cell */
function paint(canvas, field, cell, phase = 0) {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const w = Math.max(1, Math.round(r.width / cell));
  const h = Math.max(1, Math.round(r.height / cell));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = new Uint32Array(img.data.buffer);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (field(x, y, w, h, phase) > B8[(y & 7) * 8 + (x & 7)]) d[y * w + x] = CORAL;
  }
  ctx.putImageData(img, 0, 0);
}

/* a frame: dense at its outer edge, thinner toward the middle, with a slow wave through it (Vessa) */
const frameField = band => (x, y, w, h, p) => {
  const e = Math.min(x, w - 1 - x, y, h - 1 - y);
  const edge = 1 - Math.min(1, e / band);
  const wave = Math.sin(x * .05 + p) * Math.sin(y * .07 - p * .6) * .14 + Math.sin((x - y) * .02 + p * 1.4) * .1;
  return .16 + edge * .7 + wave;
};
/* the haze under the nav: strongest at the top centre, fading down and out */
const hazeField = (x, y, w, h) => {
  const cx = Math.abs(x / w - .5) * 2;
  return (1 - y / h) * .75 * (1 - cx * cx * .85);
};

export function dithers(root = document) {
  const items = $$('[data-dither]', root).map(el => {
    const c = el.querySelector(':scope > canvas');
    const cell = innerWidth < 640 ? 2 : 3;
    const band = (parseFloat(getComputedStyle(el).paddingLeft) || 24) / cell * 1.4;
    const it = { el, c, cell, field: frameField(band), phase: 0 };
    paint(c, it.field, cell); el.classList.add('is-drawn');
    return it;
  });
  const haze = $('[data-haze]', root);
  if (haze) paint(haze, hazeField, 3);
  const dots = $('[data-dots]', root);
  if (dots) halftone(dots);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { items.forEach(i => paint(i.c, i.field, i.cell, i.phase)); if (haze) paint(haze, hazeField, 3); if (dots) halftone(dots); });
    items.forEach(i => ro.observe(i.el));
  }
  if (gsapOk() && !reduced()) {
    items.forEach(i => ScrollTrigger.create({
      trigger: i.el, start: 'top bottom', end: 'bottom top',
      onUpdate: s => { i.phase = s.progress * 7; paint(i.c, i.field, i.cell, i.phase); }
    }));
  }
}

/* Solidroad's halftone field in the footer: coral dots whose size follows a soft wave */
function halftone(canvas) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ff6b4a';
  const step = 9;
  for (let y = 0; y < r.height; y += step) for (let x = 0; x < r.width; x += step) {
    const v = (Math.sin(x * .006 + y * .004) + Math.sin(y * .011 - x * .003) + 2) / 4;
    const rad = Math.max(0, (v - .3) * 3.6);
    if (rad > .25) { ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.fill(); }
  }
}

/* ---------- nav sheet ---------- */
export function navSheet() {
  const t = $('.nav__toggle'), s = $('#menu');
  if (!t || !s) return;
  const set = open => { t.setAttribute('aria-expanded', open); t.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç'); s.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; };
  t.addEventListener('click', () => set(t.getAttribute('aria-expanded') !== 'true'));
  s.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && set(false));
}

/* ---------- FAQ: one open at a time, height animated ---------- */
export function faq() {
  const btns = $$('[data-faq] button');
  const toggle = (b, open) => {
    const a = document.getElementById(b.getAttribute('aria-controls'));
    b.setAttribute('aria-expanded', open);
    if (!gsapOk() || reduced()) { a.hidden = !open; return; }
    if (open) { a.hidden = false; gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: .45, ease: 'expo.out' }); }
    else gsap.to(a, { height: 0, duration: .3, ease: 'power2.out', onComplete: () => { a.hidden = true; gsap.set(a, { clearProps: 'height' }); } });
  };
  btns.forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    btns.forEach(o => o !== b && o.getAttribute('aria-expanded') === 'true' && toggle(o, false));
    toggle(b, open);
  }));
}

/* ---------- the sponsor form: checked on submit, then saved to Supabase (or handed to the mail app) ---------- */
export function form() {
  $$('[data-mail]').forEach(a => { a.href = `mailto:${iletisim.eposta}`; if (a.textContent.includes('@')) a.textContent = iletisim.eposta; });
  const f = $('[data-form]');
  if (!f) return;
  const db = dbAcik();
  const status = $('[data-status]', f), btn = $('button[type="submit"]', f), note = $('.form__note', f);
  if (db) { f.removeAttribute('action'); note.textContent = 'Talebiniz NIFL ARGE ekibine iletilir. Size e-postayla dönüş yapılır.'; }
  else f.action = `mailto:${iletisim.eposta}?subject=${encodeURIComponent('Sponsorluk talebi')}`;
  f.addEventListener('submit', async e => {
    const bad = [];
    $$('[required]', f).forEach(el => {
      const err = document.getElementById(el.getAttribute('aria-describedby'));
      const ok = el.type === 'checkbox' ? el.checked
        : el.value.trim() && (el.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.hidden = !!ok;
      if (!ok) bad.push(el);
    });
    if (bad.length) {
      e.preventDefault();
      status.textContent = bad.length === 1 ? '1 alanı düzeltin.' : `${bad.length} alanı düzeltin.`;
      bad[0].focus();
      return;
    }
    if (!db) { status.textContent = 'E-posta uygulamanız açılıyor. Mesajı oradan gönderin.'; return; }
    e.preventDefault();
    const v = n => (f.elements[n]?.value || '').trim();
    const eposta = v('eposta');
    const tamam = () => { f.reset(); status.textContent = `Talebiniz alındı. ${eposta} adresinize en kısa sürede yazacağız.`; };
    if (v('web')) { tamam(); return; } // bot tuzağı: insanlar bu gizli alanı görmez
    btn.disabled = true;
    status.textContent = 'Gönderiliyor…';
    try {
      await talepGonder({ ad: v('ad'), kurum: v('kurum'), eposta, proje: v('proje'), mesaj: v('destek') ? `Destek türü: ${v('destek')}\n\n${v('mesaj')}` : v('mesaj'), aydinlatma: true });
      tamam();
    } catch (err) {
      status.innerHTML = err.kod === 'sinir'
        ? `Kısa sürede çok fazla talep geldi. Bir saat sonra yeniden deneyin ya da bize doğrudan yazın: <a class="link" href="mailto:${esc(iletisim.eposta)}">${esc(iletisim.eposta)}</a>`
        : `Talep gönderilemedi. Bağlantınızı kontrol edip yeniden deneyin ya da bize doğrudan yazın: <a class="link" href="mailto:${esc(iletisim.eposta)}">${esc(iletisim.eposta)}</a>`;
    } finally { btn.disabled = false; }
  });
}

/* ---------- Supabase'den gelen sayfa metinleri ve görselleri ---------- */
// İzin verilen biçimler: <span class="dim|accent">, <strong>, <b>, <em>, <small>, <br>, <a class="link" href="...">
const IZINLI = { SPAN: ['class'], STRONG: [], B: [], EM: [], SMALL: [], BR: [], TIME: [], A: ['href', 'class', 'target', 'rel'] };
function temizle(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  const gez = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) return;
    if (c.nodeType !== 1 || !IZINLI[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; }
    [...c.attributes].forEach(a => { if (!IZINLI[c.tagName].includes(a.name)) c.removeAttribute(a.name); });
    if (c.tagName === 'A' && !/^(https?:|mailto:|tel:|[a-z0-9_-]+\.html|#)/i.test(c.getAttribute('href') || '')) c.removeAttribute('href');
    gez(c);
  });
  gez(t.content);
  return t.innerHTML;
}
export function icerikUygula(rows) {
  if (!rows?.length) return;
  const m = new Map(rows.map(r => [r.anahtar, r.deger ?? '']));
  if (m.get('ortak.eposta')) iletisim.eposta = m.get('ortak.eposta').trim();
  $$('[data-cms]').forEach(el => {
    if (!m.has(el.dataset.cms)) return;
    const v = m.get(el.dataset.cms);
    if (el.hasAttribute('data-cms-html')) el.innerHTML = temizle(v);
    else if (el.hasAttribute('data-cms-ilk')) {
      const t = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (t) t.textContent = t.textContent.replace(t.textContent.trim(), v);
    } else el.textContent = v;
  });
  $$('[data-cms-img]').forEach(img => {
    const k = img.dataset.cmsImg;
    if (m.get(k)) { img.src = m.get(k); img.removeAttribute('srcset'); }
    if (m.has(k + '.alt')) img.alt = m.get(k + '.alt');
  });
}

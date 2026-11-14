/* NIFL ARGE — home: content from assets/data/site.js, then the GSAP layer. */
import { tarihYaz } from '../data/site.js?v=25';
import { $, $$, esc, ARROW, reduced, gsapOk, dithers, navSheet, faq, form, icerikUygula } from './common.js?v=25';
import { haberleriAl, sponsorlariAl, projeleriAl, icerikAl } from './db.js?v=25';

// projects and page texts come from Supabase (site.js if it can't be reached); texts land before anything is split or animated
const [projeler, sayfaMetni] = await Promise.all([projeleriAl(), icerikAl()]);
const proje = s => projeler.find(p => p.slug === s);
icerikUygula(sayfaMetni);

/* ---------------- content ---------------- */

const short = p => p.ad.split(' ')[0];

function renderShowcase() {
  const tabs = $('[data-tabs]'), stage = $('[data-stage]');
  tabs.insertAdjacentHTML('beforeend', projeler.map((p, i) =>
    `<button class="tab" role="tab" id="t-${p.slug}" aria-controls="s-${p.slug}" aria-selected="${!i}" tabindex="${i ? -1 : 0}">${esc(short(p) === 'Ekolojik' ? 'Ekoloji' : short(p))}</button>`).join(''));
  stage.innerHTML = projeler.map((p, i) => `
    <article class="slide" role="tabpanel" id="s-${p.slug}" aria-labelledby="t-${p.slug}" ${i ? 'hidden' : ''}>
      <img class="slide__img" src="${esc(p.gorsel)}" alt="${esc(p.gorselAlt)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
      <div class="slide__top"><span class="slide__mark">${esc(short(p))}</span><span class="slide__state"><i aria-hidden="true"></i>${esc(p.durum)}</span></div>
      <div class="slide__foot">
        <div>
          <h3 class="slide__title">${esc(p.baslik || p.ad)}</h3>
          <p class="slide__sum">${esc(p.ozet)}</p>
          <a class="slide__link" href="proje.html?p=${p.slug}">${esc(p.ad)} sayfası ${ARROW}</a>
        </div>
        <dl class="slide__facts">${(p.bilgiler || []).slice(0, 4).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
    </article>`).join('');
}

async function renderNews() {
  const box = $('[data-news]');
  const haberler = await haberleriAl(3);
  if (!haberler.length) { box.innerHTML = `<p class="lede">İlk haber yakında burada olacak.</p>`; return; }
  box.innerHTML = haberler.slice(0, 3).map((h, i) => {
    const href = h.link || (proje(h.proje) ? `proje.html?p=${h.proje}` : 'haberler.html');
    return `<a href="${esc(href)}"${h.link ? ' target="_blank" rel="noopener"' : ''}>
      ${i === 0 && h.gorsel ? `<div class="news__img"><img src="${esc(h.gorsel)}" alt="" loading="lazy"></div>` : ''}
      <span class="news__meta"><b>${esc(proje(h.proje)?.alan || 'Genel')}</b><time datetime="${esc(h.tarih)}">${tarihYaz(h.tarih)}</time>${h.kaynak ? `<span>${esc(h.kaynak)}</span>` : ''}</span>
      <span class="news__t">${esc(h.baslik)}</span>
      ${i ? `<span class="news__x">${esc(h.metin)}</span>` : ''}
      <span class="news__go">${h.link ? 'Haberi okuyun' : proje(h.proje) ? 'Projeye gidin' : 'Tüm haberler'} ${ARROW}</span>
    </a>`;
  }).join('');
}

function renderSponsorship() {
  $('[data-leaves]').innerHTML = projeler.map(p => `<a href="proje.html?p=${p.slug}"><b>${esc(short(p) === 'Ekolojik' ? 'Ekoloji' : short(p))}</b><span>${esc(p.alan)}</span></a>`).join('');
  const sel = $('[data-projects]');
  sel.insertAdjacentHTML('beforeend', projeler.map(p => `<option>${esc(p.ad)}</option>`).join(''));
  const want = projeler.find(p => p.slug === new URLSearchParams(location.search).get('proje'));
  if (want) sel.value = want.ad;
}

async function renderSponsors() {
  const box = $('[data-sponsors]');
  const sponsorlar = await sponsorlariAl();
  box.innerHTML = sponsorlar.length
    ? sponsorlar.map(s => {
      // a logo that is not an image address (e.g. typed by hand in the table editor) falls back to the sponsor's name
      const img = /^(https?:\/\/|assets\/).+\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(s.logo || '')
        ? `<img src="${esc(s.logo)}" alt="${esc(s.ad)}" loading="lazy">`
        : `<span class="sponsors__name">${esc(s.ad)}</span>`; return s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${img}</a>` : `<div>${img}</div>`; }).join('')
    : `<div class="sponsors__empty">Sponsor listemiz bu sezon açılıyor. İlk logo sizinki olabilir.</div>`;
}

/* ---------------- tabs ---------------- */

let cur = 0, pin = null;
const N = projeler.length;

function ink(instant) {
  const t = $$('.tab')[cur], i = $('.tabs__ink');
  const v = { x: t.offsetLeft - 4, width: t.offsetWidth };
  if (gsapOk()) gsap.to(i, { ...v, duration: instant || reduced() ? 0 : .55, ease: 'expo.out' });
  else Object.assign(i.style, { transform: `translateX(${v.x}px)`, width: v.width + 'px' });
  const bar = $('.tabs');
  if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - 40, behavior: instant ? 'auto' : 'smooth' });
}

function show(i, { focus, instant } = {}) {
  if (i === cur && !instant) return;
  const tabs = $$('.tab'), slides = $$('.slide');
  const prev = slides[cur], next = slides[i];
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
  if (focus) tabs[i].focus();
  const dir = i > cur ? 1 : -1;
  cur = i; ink(instant);
  if (!gsapOk() || reduced() || instant) { slides.forEach((s, k) => (s.hidden = k !== i)); return; }
  slides.forEach(s => { if (s !== prev && s !== next) s.hidden = true; });
  next.hidden = false;
  gsap.set(next, { zIndex: 2 }); gsap.set(prev, { zIndex: 1 });
  const title = $('.slide__title', next);
  title._s ||= SplitText.create(title, { type: 'lines', mask: 'lines' });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { if (prev !== next) prev.hidden = true; } });
  tl.fromTo(next, { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.05 }, 0)
    .fromTo($('.slide__img', next), { scale: 1.16, xPercent: 4 * dir }, { scale: 1, xPercent: 0, duration: 1.5 }, 0)
    .to($('.slide__img', prev), { xPercent: -8 * dir, duration: 1.05 }, 0)
    .fromTo(title._s.lines, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .08 }, .25)
    .fromTo($$('.slide__sum, .slide__link, .slide__facts > div, .slide__top > *', next), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .04 }, .35)
    .set($('.slide__img', prev), { xPercent: 0 });
}

function tabsInit() {
  const tabs = $$('.tab');
  const go = i => {
    if (pin) {
      const y = pin.start + (pin.end - pin.start) * (i / (N - 1));
      scrollTo({ top: y + 1, behavior: reduced() ? 'auto' : 'smooth' });
    }
    show(i);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(i));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: (i + 1) % N, ArrowLeft: (i - 1 + N) % N, Home: 0, End: N - 1 }[e.key];
      if (k !== undefined) { e.preventDefault(); show(k, { focus: true }); }
    });
  });
  $('[data-next]').addEventListener('click', () => go((cur + 1) % N));
  show(0, { instant: true });
  addEventListener('resize', () => ink(true));
}

/* ---------------- motion ---------------- */

function intro() {
  if (reduced()) return;
  const s = SplitText.create('[data-split]', { type: 'lines', mask: 'lines' });
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(s.lines, { yPercent: 105, duration: 1.2, stagger: .1 }, 0)
    .from('[data-rise]', { y: 18, autoAlpha: 0, duration: 1, stagger: .07 }, .25)
    .from('.showcase', { y: 60, autoAlpha: 0, duration: 1.4 }, .35)
    .from('.haze', { autoAlpha: 0, duration: 1.6 }, 0);
}

function showcasePin(mm) {
  mm.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
    pin = ScrollTrigger.create({
      trigger: '#projeler', start: () => `top top+=${$('.nav').offsetHeight - 1}`,
      end: () => '+=' + Math.round(innerHeight * .6 * (N - 1)),
      pin: true, anticipatePin: 1,
      snap: { snapTo: 1 / (N - 1), duration: { min: .25, max: .6 }, delay: .1, ease: 'power2.inOut' },
      onUpdate: self => { const i = Math.round(self.progress * (N - 1)); if (i !== cur) show(i); }
    });
    return () => { pin = null; };
  });
}

function manifesto() {
  if (reduced()) return;
  $$('[data-fill]').forEach(p => {
    const s = SplitText.create(p, { type: 'words', wordsClass: 'w' });
    s.words.forEach(w => { w.dataset.to = w.closest('.accent') ? '#c23a1e' : '#33373d'; });
    gsap.to(s.words, {
      color: (i, el) => el.dataset.to, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 50%', scrub: .5 }
    });
  });
}

/* Semrük's flight: the section pins, the amber line climbs to 3,350 m, the dotted descent follows,
   each marker arrives when the line reaches it. */
function flight(mm) {
  const sec = $('[data-flight]');
  if (!sec) return;
  const up = $('.flight__up', sec), down = $('.flight__down', sec);
  const alt = $('[data-alt]', sec);
  const marks = $$('.mark', sec);
  const fmt = v => Math.round(v).toLocaleString('tr-TR');
  // a phone shows only the middle of the landscape photo: the path and markers take their data-m layout there
  const layout = narrow => {
    [up, down].forEach(el => { el.dataset.d ||= el.getAttribute('d'); el.setAttribute('d', narrow ? el.dataset.m : el.dataset.d); });
    marks.forEach(m => {
      m.dataset.p ||= `${m.style.left};${m.style.top}`;
      const [l, t] = (narrow ? m.dataset.m : m.dataset.p).split(';');
      m.style.left = l; m.style.top = t;
    });
  };
  const narrowQ = matchMedia('(max-width: 700px)');
  layout(narrowQ.matches);
  narrowQ.addEventListener('change', e => { layout(e.matches); ScrollTrigger.refresh(); });
  if (reduced()) return;
  mm.add('(min-width: 0px)', () => {
    const lu = up.getTotalLength(), ld = down.getTotalLength();
    gsap.set(up, { strokeDasharray: lu, strokeDashoffset: lu });
    gsap.set(down, { autoAlpha: 0 });
    gsap.set(marks, { autoAlpha: 0, y: 12 });
    gsap.set('.flight__text', { autoAlpha: 0, x: -20 });
    const st = { a: 0 };
    alt.textContent = '0';
    const clipDown = v => { down.style.clipPath = `inset(0 0 0 ${100 - v}%)`; }; // the descent runs right to left
    clipDown(0);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // no GSAP pin: the section is position: sticky inside its track (see .flight-track), the timeline only scrubs
      scrollTrigger: { trigger: sec.parentElement, start: 'top top', end: 'bottom bottom', scrub: .7 }
    });
    tl.to('.flight__text', { autoAlpha: 1, x: 0, duration: .08, ease: 'power2.out' }, 0)
      .fromTo('.flight__img', { scale: 1.05 }, { scale: 1, duration: 1 }, 0)
      .to(marks[0], { autoAlpha: 1, y: 0, duration: .05 }, .02)
      .to(up, { strokeDashoffset: 0, duration: .48, ease: 'power1.in' }, .04)
      .to(st, { a: 3350, duration: .48, ease: 'power1.in', onUpdate: () => (alt.textContent = fmt(st.a)) }, .04)
      .to(marks[1], { autoAlpha: 1, y: 0, duration: .05 }, .5)
      .set(down, { autoAlpha: 1 }, .52)
      .to({ v: 0 }, { v: 100, duration: .4, onUpdate() { clipDown(this.targets()[0].v); } }, .52)
      .to(st, { a: 0, duration: .4, onUpdate: () => (alt.textContent = fmt(st.a)) }, .52)
      .to(marks[2], { autoAlpha: 1, y: 0, duration: .05 }, .66)
      .to(marks[3], { autoAlpha: 1, y: 0, duration: .05 }, .9);
    return () => { gsap.set([up, down, marks, '.flight__text'], { clearProps: 'all' }); alt.textContent = '3.350'; };
  });
}

function seasons() {
  const box = $('[data-seasons]');
  if (!box) return;
  const items = $$('.season', box);
  if (reduced()) { items.forEach(s => s.classList.add('is-on')); return; }
  gsap.fromTo(box, { '--bar': 0 }, { '--bar': 1, ease: 'none', scrollTrigger: { trigger: box, start: 'top 75%', end: 'bottom 60%', scrub: .5 } });
  items.forEach((s, i) => ScrollTrigger.create({ trigger: box, start: () => `top+=${(box.offsetHeight * .5) * (i / items.length)} 70%`, onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') }));
  gsap.from($$('.season__n', box), { yPercent: 40, autoAlpha: 0, stagger: .12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 70%' } });
}

function photos() {
  if (reduced()) return;
  $$('[data-parallax]').forEach(img => {
    gsap.fromTo(img, { clipPath: 'inset(12% 12% 12% 12% round 8px)', scale: 1.08 }, {
      clipPath: 'inset(0% 0% 0% 0% round 8px)', scale: 1, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top 90%', end: 'top 35%', scrub: .6 }
    });
  });
}

function hub() {
  const paths = $$('.hub__svg path');
  if (reduced() || !paths.length) return;
  gsap.to(paths, { strokeDashoffset: -42, duration: 2.4, ease: 'none', repeat: -1 });
  gsap.from('.hub__leaves a', { y: 16, autoAlpha: 0, stagger: .06, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.hub', start: 'top 75%' } });
}

/* ---------------- boot ---------------- */

renderShowcase();
renderSponsorship();
tabsInit();
navSheet();
faq();
form();
// news and sponsors may come from Supabase: once they land, page heights change, so the pinned sections re-measure
const remote = Promise.all([renderNews(), renderSponsors()]);

const boot = () => {
  remote.then(() => { if (gsapOk()) ScrollTrigger.refresh(); });
  if (!gsapOk()) { dithers(); $$('.season').forEach(s => s.classList.add('is-on')); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();
  intro();
  document.documentElement.classList.add('ready');
  showcasePin(mm);
  manifesto();
  flight(mm);
  seasons();
  photos();
  hub();
  dithers();
  ScrollTrigger.refresh();
  keepPinsMeasured();
};
// measure only after every Switzer weight is in: a late swap reflows the manifesto and would shift the flight
// (capped at 2.5 s on a slow connection; keepPinsMeasured catches anything later)
const fontsIn = document.fonts
  ? Promise.all(['400', '500', '600'].map(w => document.fonts.load(`${w} 16px Switzer`))).catch(() => {}).then(() => document.fonts.ready)
  : Promise.resolve();
Promise.race([fontsIn, new Promise(r => setTimeout(r, 2500))]).then(boot);

/* The pinned sections (projects, Semrük's flight) measure their start once. If anything above them changes
   height later — a late font swap reflowing the manifesto, an image, the news arriving — the flight would pin
   too early and slide over the text. So re-measure whenever a section's height actually changes. */
function keepPinsMeasured() {
  if (!('ResizeObserver' in window)) return;
  const heights = new Map();
  let t;
  const ro = new ResizeObserver(entries => {
    let changed = false;
    entries.forEach(e => {
      const h = Math.round(e.contentRect.height);
      if (heights.has(e.target) && heights.get(e.target) !== h) changed = true;
      heights.set(e.target, h);
    });
    if (changed) { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120); }
  });
  $$('main section, main .cut').forEach(el => ro.observe(el));
  document.fonts?.addEventListener?.('loadingdone', () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120); });
}

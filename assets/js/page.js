/* NİFL AR-GE — inner pages: proje.html?p=<slug> and haberler.html */
import { tarihYaz } from '../data/site.js?v=27';
import { $, $$, esc, ARROW, reduced, gsapOk, dithers, navSheet, form, icerikUygula } from './common.js?v=27';
import { haberleriAl, gunlukAl, projeleriAl, icerikAl } from './db.js?v=27';

const [projeler, sayfaMetni] = await Promise.all([projeleriAl(), icerikAl()]);
const proje = s => projeler.find(p => p.slug === s);
icerikUygula(sayfaMetni);

const linkOf = h => h.link || (proje(h.proje) ? `proje.html?p=${h.proje}` : 'haberler.html');
const ext = h => (h.link ? ' target="_blank" rel="noopener"' : '');

async function projectPage() {
  const slug = new URLSearchParams(location.search).get('p') || 'roket';
  const p = proje(slug);
  if (!p) { location.replace('404.html'); return; } // bilinmeyen proje adresi: sessizce Aurora'yı açmak yerine 404
  const i = projeler.indexOf(p);
  document.title = `${p.ad} · NİFL AR-GE`;
  $('meta[name="description"]').content = p.ozet;
  $('[data-p="ad"]').textContent = p.ad;
  $('[data-p="ozet"]').textContent = p.ozet;
  $('[data-p="kisaad"]').textContent = p.ad.split(' ')[0] === 'Ekolojik' ? 'Ekolojik okul projesine' : `${p.ad.split(' ')[0]} projesine`;
  $$('[data-sponsor-link]').forEach(a => (a.href = `index.html?proje=${p.slug}#form`));

  $('[data-p-slide]').innerHTML = `
    <img class="slide__img" src="${esc(p.gorsel)}" alt="${esc(p.gorselAlt)}" fetchpriority="high">
    <div class="slide__top"><span class="slide__mark">${esc(p.ad.split(' ')[0])}</span><span class="slide__state"><i aria-hidden="true"></i>${esc(p.durum)}</span></div>
    <div class="slide__foot"><div><p class="slide__title">${esc(p.baslik || p.ad)}</p></div>
      <dl class="slide__facts">${(p.bilgiler || []).slice(0, 4).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`;

  $('[data-p="bilgiler"]').innerHTML = (p.bilgiler || []).map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('');
  $('[data-p="hakkinda"]').innerHTML = p.hakkinda?.length
    ? p.hakkinda.map(t => `<p>${esc(t)}</p>`).join('')
    : `<div class="note"><p>Bu projenin tanıtım metni hazırlanıyor.</p><p>Takım bilgileri, hedefler ve fotoğraflar yakında burada olacak.</p></div>`;

  if (p.ekip?.length) {
    $('[data-p-team-wrap]').hidden = false;
    $('[data-p="ekip"]').innerHTML = p.ekip.map(([n, r]) => `<li><span>${esc(r)}</span><span>${esc(n)}</span></li>`).join('');
  }
  if (p.galeri?.length) {
    $('[data-p-gallery-wrap]').hidden = false;
    $('[data-p="galeri"]').innerHTML = p.galeri.map(g => `<figure><img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" width="${g.w || ''}" height="${g.h || ''}"></figure>`).join('');
  }
  const n = projeler[(i + 1) % projeler.length];
  const next = $('[data-next-project]');
  next.href = `proje.html?p=${n.slug}`;
  $('[data-next-name]').textContent = n.ad;

  // the log may come from Supabase, so it fills in last
  const log = await gunlukAl(p.slug);
  $('[data-p="gelismeler"]').innerHTML = log.length
    ? `<ul class="log">${log.map(g => `<li><time datetime="${esc(g.tarih)}">${tarihYaz(g.tarih)}</time><div><h3>${g.link ? `<a class="link" href="${esc(g.link)}" target="_blank" rel="noopener">${esc(g.baslik)}</a>` : esc(g.baslik)}</h3>${g.metin ? `<p>${esc(g.metin)}</p>` : ''}</div></li>`).join('')}</ul>`
    : `<div class="note"><p>İlk gelişme kaydı yakında eklenecek.</p></div>`;
}

async function newsPage() {
  const list = $('[data-news-list]'), bar = $('[data-filters]');
  const haberler = await haberleriAl();
  const used = projeler.filter(p => haberler.some(h => h.proje === p.slug));
  bar.innerHTML = `<button type="button" aria-pressed="true" data-f="">Tümü</button>` + used.map(p => `<button type="button" aria-pressed="false" data-f="${p.slug}">${esc(p.alan)}</button>`).join('');
  const draw = f => {
    const items = haberler.filter(h => !f || h.proje === f);
    list.innerHTML = items.map(h => `<li><time datetime="${esc(h.tarih)}">${tarihYaz(h.tarih)}<br><span style="color:var(--coral-ink)">${esc(proje(h.proje)?.alan || 'Genel')}</span></time>
      <div><h3><a class="link" href="${esc(linkOf(h))}"${ext(h)}>${esc(h.baslik)}</a></h3>${h.metin ? `<p>${esc(h.metin)}</p>` : ''}${h.kaynak ? `<p style="font-size:13px;color:var(--muted)">Kaynak: ${esc(h.kaynak)}</p>` : ''}</div></li>`).join('');
    $('[data-news-empty]').hidden = items.length > 0;
    if (gsapOk() && !reduced()) gsap.from(list.children, { y: 16, autoAlpha: 0, stagger: .05, duration: .7, ease: 'expo.out' });
  };
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
    draw(b.dataset.f);
  });
  draw('');
}

const content = $('[data-p-slide]') ? projectPage() : $('[data-news-list]') ? newsPage() : Promise.resolve();
navSheet();
form();

const boot = () => {
  if (gsapOk()) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (!reduced()) {
      const h1 = $('.page-head h1');
      const s = SplitText.create(h1, { type: 'lines', mask: 'lines' });
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from(s.lines, { yPercent: 105, duration: 1.1, stagger: .08 })
        .from('.page-head p, .page-head .crumbs, .page-head .filters', { y: 14, autoAlpha: 0, duration: .9, stagger: .06 }, .15)
        .from('.showcase', { y: 50, autoAlpha: 0, duration: 1.3 }, .25);
      const img = $('.showcase .slide__img');
      if (img) gsap.fromTo(img, { yPercent: -4, scale: 1.1 }, { yPercent: 4, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    content.then(() => ScrollTrigger.refresh());
  }
  document.documentElement.classList.add('ready');
  dithers();
};
(document.fonts?.ready || Promise.resolve()).then(boot);

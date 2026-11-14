/* NİFL AR-GE — yönetim sayfası: sponsorluk talepleri, haberler ve sponsorlar (Supabase). */
import { tarihYaz } from '../data/site.js?v=27';
import { projeleriAl } from './db.js?v=27';
const projeler = await projeleriAl();
const proje = s => projeler.find(p => p.slug === s);
import { $, $$, esc, dithers } from './common.js?v=27';
import { SUPABASE, dbAcik } from './db.js?v=27';

let sb = null;
const KOVA = 'gorseller';
const DURUM = { yeni: 'Yeni', gorusuluyor: 'Görüşülüyor', kapandi: 'Kapandı' };
const projeAdi = s => (s === 'genel' ? 'Genel' : proje(s)?.ad || s);
const projeSecenekleri = (bos = 'Genel') => `<option value="genel">${esc(bos)}</option>` + projeler.map(p => `<option value="${p.slug}">${esc(p.ad)}</option>`).join('');

/* ---------- views ---------- */
const views = { giris: $('[data-login]'), panel: $('[data-panel]'), kapali: $('[data-off]') };
const goster = ad => Object.entries(views).forEach(([k, el]) => (el.hidden = k !== ad));

function sekmeler() {
  const bar = $('[data-tabs]');
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('[data-view]').forEach(v => (v.hidden = v.dataset.view !== b.dataset.tab));
  });
}

const durumYaz = (el, metin) => { el.textContent = metin; };
const sor = metin => confirm(`${metin}\n\nBu işlem geri alınamaz.`);

/* ---------- auth ---------- */
async function gir() {
  const { data, error } = await sb.rpc('yonetici_mi');
  if (error || !data) {
    durumYaz($('[data-login-status]'), error ? 'Yetki kontrol edilemedi. Bağlantınızı kontrol edip yeniden deneyin.' : 'Bu hesabın yönetim yetkisi yok. Okuldaki site sorumlusuna başvurun.');
    await sb.auth.signOut();
    goster('giris');
    return;
  }
  const { data: { user } } = await sb.auth.getUser();
  $('[data-who]').textContent = `${user?.email || ''} olarak giriş yaptınız.`;
  goster('panel');
  await Promise.all([talepleriYukle(), haberleriYukle(), sponsorlariYukle()]);
}

function girisFormu() {
  const f = views.giris, st = $('[data-login-status]');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button', f);
    btn.disabled = true; durumYaz(st, 'Giriş yapılıyor…');
    const { error } = await sb.auth.signInWithPassword({ email: f.elements.eposta.value.trim(), password: f.elements.sifre.value });
    btn.disabled = false;
    if (error) { durumYaz(st, /invalid/i.test(error.message) ? 'E-posta ya da şifre hatalı.' : `Giriş yapılamadı: ${error.message}`); return; }
    f.reset(); durumYaz(st, '');
    gir();
  });
  $('[data-logout]').addEventListener('click', async () => { await sb.auth.signOut(); goster('giris'); });
}

/* ---------- images ---------- */
async function yukle(dosya, klasor) {
  if (dosya.size > 3 * 1024 * 1024) throw new Error('Görsel 3 MB’tan büyük olamaz.');
  const uzanti = (dosya.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const yol = `${klasor}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uzanti}`;
  const { error } = await sb.storage.from(KOVA).upload(yol, dosya, { contentType: dosya.type, upsert: false });
  if (error) throw error;
  return sb.storage.from(KOVA).getPublicUrl(yol).data.publicUrl;
}
async function gorseliSil(url) {
  const isaret = `/storage/v1/object/public/${KOVA}/`;
  if (url && url.includes(isaret)) await sb.storage.from(KOVA).remove([decodeURIComponent(url.split(isaret)[1])]);
}

/* ---------- sponsorship requests ---------- */
async function talepleriYukle() {
  const box = $('[data-talepler]');
  const { data, error } = await sb.from('sponsor_talepleri').select('*').order('created_at', { ascending: false });
  if (error) { box.innerHTML = `<div class="note"><p>Talepler yüklenemedi: ${esc(error.message)}</p></div>`; return; }
  const yeni = data.filter(t => t.durum === 'yeni').length;
  $('[data-count]').textContent = yeni ? ` (${yeni})` : '';
  box.innerHTML = data.length ? `<ul class="log">${data.map(t => `
    <li data-id="${t.id}">
      <time datetime="${esc(t.created_at)}">${esc(new Date(t.created_at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }))}</time>
      <div>
        <h3>${esc(t.ad)} · ${esc(t.kurum)}</h3>
        <p><a class="link" href="mailto:${esc(t.eposta)}?subject=${encodeURIComponent('NİFL AR-GE sponsorluk talebiniz')}">${esc(t.eposta)}</a> · ${esc(t.proje)}</p>
        <p class="adm-msg">${esc(t.mesaj)}</p>
        <div class="adm-actions">
          <label class="sr-only" for="d-${t.id}">Durum</label>
          <select id="d-${t.id}" data-durum>${Object.entries(DURUM).map(([k, v]) => `<option value="${k}"${k === t.durum ? ' selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn btn--ghost btn--sm" type="button" data-sil>Talebi silin</button>
        </div>
      </div>
    </li>`).join('')}</ul>`
    : `<div class="note"><p>Henüz sponsorluk talebi yok.</p><p>Formdan gelen talepler burada listelenir.</p></div>`;
}
function talepOlaylari() {
  const box = $('[data-talepler]');
  box.addEventListener('change', async e => {
    const s = e.target.closest('[data-durum]'); if (!s) return;
    const { error } = await sb.from('sponsor_talepleri').update({ durum: s.value }).eq('id', s.closest('li').dataset.id);
    if (error) alert(`Durum kaydedilemedi: ${error.message}`);
    talepleriYukle();
  });
  box.addEventListener('click', async e => {
    const b = e.target.closest('[data-sil]'); if (!b) return;
    const li = b.closest('li');
    if (!sor(`${$('h3', li).textContent} talebi kalıcı olarak silinsin mi?`)) return;
    const { error } = await sb.from('sponsor_talepleri').delete().eq('id', li.dataset.id);
    if (error) alert(`Silinemedi: ${error.message}`);
    talepleriYukle();
  });
}

/* ---------- news ---------- */
async function haberleriYukle() {
  const box = $('[data-haberler]');
  const { data, error } = await sb.from('haberler').select('*').order('tarih', { ascending: false }).order('created_at', { ascending: false });
  if (error) { box.innerHTML = `<div class="note"><p>Haberler yüklenemedi: ${esc(error.message)}</p></div>`; return; }
  box.innerHTML = data.length ? `<ul class="log">${data.map(h => `
    <li data-id="${h.id}" data-gorsel="${esc(h.gorsel || '')}">
      <time datetime="${esc(h.tarih)}">${tarihYaz(h.tarih)}<br><span style="color:var(--coral-ink)">${esc(projeAdi(h.proje))}</span></time>
      <div>
        <h3>${esc(h.baslik)}</h3>
        <p>${h.tur === 'haber' ? 'Haber' : 'Proje gelişmesi'}${h.yayinda ? '' : ' · <b>Yayında değil</b>'}${h.kaynak ? ` · Kaynak: ${esc(h.kaynak)}` : ''}</p>
        ${h.metin ? `<p class="adm-msg">${esc(h.metin)}</p>` : ''}
        <div class="adm-actions">
          <button class="btn btn--ghost btn--sm" type="button" data-yayin="${h.yayinda ? '0' : '1'}">${h.yayinda ? 'Yayından kaldırın' : 'Yayınlayın'}</button>
          <button class="btn btn--ghost btn--sm" type="button" data-sil>Silin</button>
        </div>
      </div>
    </li>`).join('')}</ul>` : `<div class="note"><p>Henüz haber yok. Soldaki formdan ilk haberi ekleyin.</p></div>`;
}
function haberFormu() {
  const f = $('[data-haber-form]'), st = $('[data-status]', f);
  f.elements.proje.innerHTML = projeSecenekleri('Genel (NİFL AR-GE)');
  f.elements.tarih.value = new Date().toLocaleDateString('sv-SE');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const v = n => f.elements[n].value.trim();
    if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(v('tarih'))) { durumYaz(st, 'Tarihi 2026-11-14, 2026-11 ya da 2026 biçiminde yazın.'); f.elements.tarih.focus(); return; }
    if (v('baslik').length < 3) { durumYaz(st, 'Bir başlık yazın.'); f.elements.baslik.focus(); return; }
    if (v('link') && !/^https?:\/\//.test(v('link'))) { durumYaz(st, 'Bağlantı https:// ile başlamalı.'); f.elements.link.focus(); return; }
    const btn = $('button[type="submit"]', f);
    btn.disabled = true; durumYaz(st, 'Kaydediliyor…');
    try {
      const dosya = f.elements.gorsel.files[0];
      const gorsel = dosya ? await yukle(dosya, 'haberler') : null;
      const { error } = await sb.from('haberler').insert({
        tarih: v('tarih'), tur: v('tur'), proje: v('proje'), baslik: v('baslik'),
        metin: v('metin') || null, link: v('link') || null, kaynak: v('kaynak') || null, gorsel
      });
      if (error) throw error;
      f.reset(); f.elements.tarih.value = new Date().toLocaleDateString('sv-SE');
      durumYaz(st, 'Haber eklendi ve sitede yayında.');
      haberleriYukle();
    } catch (err) { durumYaz(st, `Kaydedilemedi: ${err.message}`); }
    finally { btn.disabled = false; }
  });
  const box = $('[data-haberler]');
  box.addEventListener('click', async e => {
    const li = e.target.closest('li'); if (!li) return;
    if (e.target.closest('[data-yayin]')) {
      const { error } = await sb.from('haberler').update({ yayinda: e.target.closest('[data-yayin]').dataset.yayin === '1' }).eq('id', li.dataset.id);
      if (error) alert(`Kaydedilemedi: ${error.message}`);
      haberleriYukle();
    } else if (e.target.closest('[data-sil]')) {
      if (!sor(`“${$('h3', li).textContent}” kalıcı olarak silinsin mi?`)) return;
      const { error } = await sb.from('haberler').delete().eq('id', li.dataset.id);
      if (error) { alert(`Silinemedi: ${error.message}`); return; }
      await gorseliSil(li.dataset.gorsel);
      haberleriYukle();
    }
  });
}

/* ---------- sponsors ---------- */
async function sponsorlariYukle() {
  const box = $('[data-sponsorlar]');
  const { data, error } = await sb.from('sponsorlar').select('*').order('sira').order('created_at');
  if (error) { box.innerHTML = `<div class="note"><p>Sponsorlar yüklenemedi: ${esc(error.message)}</p></div>`; return; }
  box.innerHTML = data.length ? `<ul class="log">${data.map(s => `
    <li data-id="${s.id}" data-gorsel="${esc(s.logo)}">
      <div class="adm-logo"><img src="${esc(s.logo)}" alt="${esc(s.ad)} logosu"></div>
      <div>
        <h3>${esc(s.ad)}</h3>
        <p>${esc(projeAdi(s.proje))} · Sıra ${s.sira}${s.yayinda ? '' : ' · <b>Yayında değil</b>'}${s.url ? ` · <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">Web sitesi</a>` : ''}</p>
        <div class="adm-actions">
          <button class="btn btn--ghost btn--sm" type="button" data-yayin="${s.yayinda ? '0' : '1'}">${s.yayinda ? 'Yayından kaldırın' : 'Yayınlayın'}</button>
          <button class="btn btn--ghost btn--sm" type="button" data-sil>Silin</button>
        </div>
      </div>
    </li>`).join('')}</ul>` : `<div class="note"><p>Henüz sponsor yok. Soldaki formdan ilk sponsoru ekleyin.</p></div>`;
}
function sponsorFormu() {
  const f = $('[data-sponsor-form]'), st = $('[data-status]', f);
  f.elements.proje.innerHTML = projeSecenekleri('NİFL AR-GE’nin tamamı');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const v = n => f.elements[n].value.trim();
    const dosya = f.elements.logo.files[0];
    if (v('ad').length < 2) { durumYaz(st, 'Sponsorun adını yazın.'); f.elements.ad.focus(); return; }
    if (!dosya) { durumYaz(st, 'Bir logo dosyası seçin.'); f.elements.logo.focus(); return; }
    if (v('url') && !/^https?:\/\//.test(v('url'))) { durumYaz(st, 'Web sitesi https:// ile başlamalı.'); f.elements.url.focus(); return; }
    const btn = $('button[type="submit"]', f);
    btn.disabled = true; durumYaz(st, 'Kaydediliyor…');
    try {
      const logo = await yukle(dosya, 'sponsorlar');
      const { error } = await sb.from('sponsorlar').insert({ ad: v('ad'), logo, url: v('url') || null, proje: v('proje'), sira: +v('sira') || 100 });
      if (error) throw error;
      f.reset();
      durumYaz(st, 'Sponsor eklendi ve sitede yayında.');
      sponsorlariYukle();
    } catch (err) { durumYaz(st, `Kaydedilemedi: ${err.message}`); }
    finally { btn.disabled = false; }
  });
  const box = $('[data-sponsorlar]');
  box.addEventListener('click', async e => {
    const li = e.target.closest('li'); if (!li) return;
    if (e.target.closest('[data-yayin]')) {
      const { error } = await sb.from('sponsorlar').update({ yayinda: e.target.closest('[data-yayin]').dataset.yayin === '1' }).eq('id', li.dataset.id);
      if (error) alert(`Kaydedilemedi: ${error.message}`);
      sponsorlariYukle();
    } else if (e.target.closest('[data-sil]')) {
      if (!sor(`${$('h3', li).textContent} sponsor listesinden kalıcı olarak silinsin mi?`)) return;
      const { error } = await sb.from('sponsorlar').delete().eq('id', li.dataset.id);
      if (error) { alert(`Silinemedi: ${error.message}`); return; }
      await gorseliSil(li.dataset.gorsel);
      sponsorlariYukle();
    }
  });
}

/* ---------- boot ---------- */
async function basla() {
  document.documentElement.classList.add('ready');
  dithers();
  if (!dbAcik() || !window.supabase) { goster('kapali'); return; }
  sb = window.supabase.createClient(SUPABASE.url, SUPABASE.anahtar);
  sekmeler(); girisFormu(); talepOlaylari(); haberFormu(); sponsorFormu();
  const { data: { session } } = await sb.auth.getSession();
  if (session) gir(); else goster('giris');
}
basla();

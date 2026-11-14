/* NIFL ARGE — Supabase bağlantısı.
   Aşağıdaki iki değeri Supabase panelinden alın: Project Settings → API Keys (ve Data API → Project URL).
   - url:     https://<proje-kodu>.supabase.co
   - anahtar: "publishable" (sb_publishable_...) ya da eski "anon public" anahtarı. Bu anahtar herkese açıktır;
              tabloları satır düzeyi kurallar korur. service_role / secret anahtarını ASLA buraya yazmayın.
   İkisi boş kaldıkça site assets/data/site.js içeriğiyle çalışır ve form e-posta uygulamasını açar. */
export const SUPABASE = {
  url: 'https://zgdbcbzejfromgkmglyi.supabase.co',
  anahtar: 'sb_publishable_ZESNmssXSu5ZV2o8l1-Mwg_ZY6K87O9'
};

import * as yerel from '../data/site.js?v=19';

export const dbAcik = () => /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE.url) && SUPABASE.anahtar.length > 20;

const basliklar = () => ({
  apikey: SUPABASE.anahtar,
  // eski anon anahtarı bir JWT'dir ve Authorization'da da gönderilir; yeni publishable anahtar gönderilmez
  ...(SUPABASE.anahtar.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE.anahtar}` } : {})
});

async function istek(yol, ayar = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/${yol}`, { ...ayar, headers: { ...basliklar(), ...ayar.headers }, signal: ctl.signal });
    if (!r.ok) {
      const e = new Error(`supabase ${r.status}`);
      e.status = r.status;
      try { e.detay = await r.json(); } catch { /* gövdesiz hata */ }
      throw e;
    }
    return r.status === 204 || r.status === 201 ? null : r.json();
  } finally { clearTimeout(t); }
}

const ALANLAR = 'tarih,proje,tur,baslik,metin,link,kaynak,gorsel';
const SIRA = 'order=tarih.desc,created_at.desc';

/* Haberler (ana sayfa ve haberler sayfası). Supabase'e ulaşılamazsa site.js kullanılır. */
export async function haberleriAl(limit) {
  if (!dbAcik()) return limit ? yerel.haberler.slice(0, limit) : yerel.haberler;
  try {
    return await istek(`haberler?select=${ALANLAR}&tur=eq.haber&${SIRA}${limit ? `&limit=${limit}` : ''}`);
  } catch (e) {
    console.warn('Haberler Supabase’den alınamadı, yerel içerik gösteriliyor.', e);
    return limit ? yerel.haberler.slice(0, limit) : yerel.haberler;
  }
}

/* Bir projenin gelişmeler listesi: o projenin haberleri ve gelişme kayıtları. */
export async function gunlukAl(slug) {
  const yerelGunluk = () => {
    const p = yerel.proje(slug);
    const log = [...(p?.gelismeler || [])];
    yerel.haberler.filter(h => h.proje === slug && !log.some(g => g.baslik === h.baslik)).forEach(h => log.push(h));
    return log.sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
  };
  if (!dbAcik()) return yerelGunluk();
  try {
    return await istek(`haberler?select=${ALANLAR}&proje=eq.${encodeURIComponent(slug)}&${SIRA}`);
  } catch (e) {
    console.warn('Gelişmeler Supabase’den alınamadı, yerel içerik gösteriliyor.', e);
    return yerelGunluk();
  }
}

export async function sponsorlariAl() {
  if (!dbAcik()) return yerel.sponsorlar;
  try {
    return await istek('sponsorlar?select=ad,logo,url,proje&order=sira.asc,created_at.asc');
  } catch (e) {
    console.warn('Sponsorlar Supabase’den alınamadı, yerel içerik gösteriliyor.', e);
    return yerel.sponsorlar;
  }
}

/* Sponsorluk formu. Hata olursa fırlatır; e.kod 'sinir' ise spam freni devrededir. */
export async function talepGonder(kayit) {
  try {
    await istek('sponsor_talepleri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(kayit)
    });
  } catch (e) {
    if (e.detay?.message === 'cok_fazla_talep') e.kod = 'sinir';
    throw e;
  }
}

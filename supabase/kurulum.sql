-- NIFL ARGE · Supabase kurulumu
-- Supabase panelinde SQL Editor → New query → bu dosyanın tamamını yapıştırın → Run.
-- Birden fazla çalıştırmak güvenlidir: var olanı bozmaz, örnek kayıtları yalnızca tablo boşsa ekler.

-- ───────────────────────── yöneticiler ─────────────────────────
-- Yönetim sayfasına yalnızca bu tablodaki hesaplar girebilir.
create table if not exists public.yoneticiler (
  user_id uuid primary key references auth.users (id) on delete cascade,
  eposta text,
  created_at timestamptz not null default now()
);
alter table public.yoneticiler enable row level security;
revoke all on public.yoneticiler from anon, authenticated;

create or replace function public.yonetici_mi()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.yoneticiler where user_id = auth.uid());
$$;
grant execute on function public.yonetici_mi() to anon, authenticated;

-- ───────────────────────── haberler ve gelişmeler ─────────────────────────
-- tur = 'haber'   → ana sayfadaki "Günün haberleri", haberler sayfası ve proje sayfası
-- tur = 'gelisme' → yalnızca proje sayfasındaki "Gelişmeler" listesi
create table if not exists public.haberler (
  id uuid primary key default gen_random_uuid(),
  tarih text not null check (tarih ~ '^\d{4}(-\d{2}(-\d{2})?)?$'),
  proje text not null default 'genel',
  tur text not null default 'haber' check (tur in ('haber', 'gelisme')),
  baslik text not null check (char_length(baslik) between 3 and 200),
  metin text check (char_length(metin) <= 2000),
  link text check (link is null or link ~ '^https?://'),
  kaynak text check (char_length(kaynak) <= 80),
  gorsel text,
  yayinda boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists haberler_sira on public.haberler (tarih desc, created_at desc);
alter table public.haberler enable row level security;

drop policy if exists "herkes yayindakileri okur" on public.haberler;
create policy "herkes yayindakileri okur" on public.haberler
  for select to anon, authenticated using (yayinda or (select public.yonetici_mi()));
drop policy if exists "yonetici yazar" on public.haberler;
create policy "yonetici yazar" on public.haberler
  for all to authenticated using ((select public.yonetici_mi())) with check ((select public.yonetici_mi()));

revoke all on public.haberler from anon;
grant select on public.haberler to anon;
grant select, insert, update, delete on public.haberler to authenticated;

-- ───────────────────────── sponsorlar ─────────────────────────
create table if not exists public.sponsorlar (
  id uuid primary key default gen_random_uuid(),
  ad text not null check (char_length(ad) between 2 and 120),
  logo text not null,
  url text check (url is null or url ~ '^https?://'),
  proje text not null default 'genel',
  sira int not null default 100,
  yayinda boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.sponsorlar enable row level security;

drop policy if exists "herkes yayindakileri okur" on public.sponsorlar;
create policy "herkes yayindakileri okur" on public.sponsorlar
  for select to anon, authenticated using (yayinda or (select public.yonetici_mi()));
drop policy if exists "yonetici yazar" on public.sponsorlar;
create policy "yonetici yazar" on public.sponsorlar
  for all to authenticated using ((select public.yonetici_mi())) with check ((select public.yonetici_mi()));

revoke all on public.sponsorlar from anon;
grant select on public.sponsorlar to anon;
grant select, insert, update, delete on public.sponsorlar to authenticated;

-- ───────────────────────── sponsorluk talepleri (form) ─────────────────────────
-- Ziyaretçi yalnızca yeni talep ekleyebilir; okuyamaz, değiştiremez, silemez.
create table if not exists public.sponsor_talepleri (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ad text not null check (char_length(ad) between 2 and 120),
  kurum text not null check (char_length(kurum) between 2 and 160),
  eposta text not null check (char_length(eposta) <= 200 and eposta ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  proje text not null default 'NIFL ARGE’nin tamamı' check (char_length(proje) <= 120),
  mesaj text not null check (char_length(mesaj) between 2 and 4000),
  aydinlatma boolean not null check (aydinlatma),
  durum text not null default 'yeni' check (durum in ('yeni', 'gorusuluyor', 'kapandi'))
);
create index if not exists talepler_tarih on public.sponsor_talepleri (created_at desc);
alter table public.sponsor_talepleri enable row level security;

drop policy if exists "herkes talep gonderir" on public.sponsor_talepleri;
create policy "herkes talep gonderir" on public.sponsor_talepleri
  for insert to anon, authenticated with check (aydinlatma);
drop policy if exists "yonetici okur" on public.sponsor_talepleri;
create policy "yonetici okur" on public.sponsor_talepleri
  for select to authenticated using ((select public.yonetici_mi()));
drop policy if exists "yonetici gunceller" on public.sponsor_talepleri;
create policy "yonetici gunceller" on public.sponsor_talepleri
  for update to authenticated using ((select public.yonetici_mi())) with check ((select public.yonetici_mi()));
drop policy if exists "yonetici siler" on public.sponsor_talepleri;
create policy "yonetici siler" on public.sponsor_talepleri
  for delete to authenticated using ((select public.yonetici_mi()));

revoke all on public.sponsor_talepleri from anon;
grant insert (ad, kurum, eposta, proje, mesaj, aydinlatma) on public.sponsor_talepleri to anon;
grant select, insert, update, delete on public.sponsor_talepleri to authenticated;

-- Spam freni: aynı adresten saatte 3, toplamda 10 dakikada 30 talepten fazlası reddedilir.
create or replace function public.talep_siniri()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.sponsor_talepleri
        where lower(eposta) = lower(new.eposta) and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.sponsor_talepleri
        where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'cok_fazla_talep' using errcode = 'P0001';
  end if;
  new.created_at := now();
  new.durum := 'yeni';
  return new;
end;
$$;
drop trigger if exists talep_siniri on public.sponsor_talepleri;
create trigger talep_siniri before insert on public.sponsor_talepleri
  for each row execute function public.talep_siniri();

-- ───────────────────────── görseller (haber fotoğrafları, sponsor logoları) ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gorseller', 'gorseller', true, 3145728, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "yonetici gorsel yukler" on storage.objects;
create policy "yonetici gorsel yukler" on storage.objects
  for insert to authenticated with check (bucket_id = 'gorseller' and (select public.yonetici_mi()));
drop policy if exists "yonetici gorsel gunceller" on storage.objects;
create policy "yonetici gorsel gunceller" on storage.objects
  for update to authenticated using (bucket_id = 'gorseller' and (select public.yonetici_mi()));
drop policy if exists "yonetici gorsel siler" on storage.objects;
create policy "yonetici gorsel siler" on storage.objects
  for delete to authenticated using (bucket_id = 'gorseller' and (select public.yonetici_mi()));

-- ───────────────────────── mevcut içerik (yalnızca tablo boşsa) ─────────────────────────
-- Görsel yolları sitenin kendi klasörüne göredir (assets/img/...).
insert into public.haberler (tarih, proje, tur, baslik, metin, link, kaynak, gorsel)
select * from (values
  ('2026-10-30', 'roket', 'haber', 'Aurora Roket Takımı TEKNOFEST 2026’da Türkiye birincisi',
   'Semrük roketimiz 1.629 takımın yarıştığı Roket Yarışması’nda 1.000 puanlık tavanı aşarak 1.038 puan aldı.',
   'https://www.dha.com.tr/foto-galeri/efsanevi-kus-semrukun-ismini-verdikleri-roketle-teknofestin-tavan-puanini-astilar-2972145',
   'DHA', 'assets/img/roket-roketsan.jpg'),
  ('2026-10-30', 'roket', 'haber', 'Aurora 2027 sezonunda iki takımla yarışacak',
   'Takım, A1 ve A2 kategorilerinde ayrı ayrı yarışmak için hazırlanıyor.', null, null, null),
  ('2026-09', 'roket', 'haber', 'Semrük Aksaray’da 3.350 metreye çıktı',
   'Atış 7–13 Eylül arasında Hisar Atış Alanı’nda yapıldı. Gövdeyi ve faydalı yükü GPS ile 18 dakikada bulduk.', null, null, null),
  ('2026', 'iha', 'haber', 'GökTürk İHA Takımı kuruldu',
   'NIFL ARGE’nin en yeni takımı TEKNOFEST İnsansız Hava Aracı Yarışması’na hazırlanıyor.', null, null, null),
  ('2026', 'roket', 'gelisme', '25 finalistten biri olduk', 'ÖTR, KTR ve AHR raporlarını geçtik.', null, null, null),
  ('2025', 'roket', 'gelisme', 'İkinci sezon: roket düştü', 'Bu sezondan öğrendiklerimizle tasarımı yeniden kurduk.', null, null, null),
  ('2024', 'roket', 'gelisme', 'İlk sezon: Türkiye 8.si', 'Takım 2024’te kuruldu.', null, null, null)
) as v (tarih, proje, tur, baslik, metin, link, kaynak, gorsel)
where not exists (select 1 from public.haberler);

-- NİFL AR-GE · güncelleme (14 Kasım 2026)
-- kurulum.sql daha önce çalıştırıldıysa bunu da SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak güvenlidir.

-- 1) Spam freni: artık IP adresine göre sınırlar, formu herkese kapatmaz.
--    Eski kural "10 dakikada toplam 30 talep"ten sonra formu herkese kilitliyordu; bir saldırgan bunu tetikleyip
--    gerçek sponsorları engelleyebilirdi. Yeni kural:
--      - aynı IP'den saatte en fazla 5, günde en fazla 20 talep
--      - aynı e-postadan saatte en fazla 3 talep
--    IP adresinin kendisi saklanmaz; yalnızca geri çevrilemeyen özeti (sha256) talep kaydında tutulur.
alter table public.sponsor_talepleri add column if not exists ip_ozet text;
create index if not exists talepler_ip on public.sponsor_talepleri (ip_ozet, created_at desc);

create or replace function public.talep_siniri()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  basliklar json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(basliklar ->> 'cf-connecting-ip', split_part(basliklar ->> 'x-forwarded-for', ',', 1), '');
begin
  new.ip_ozet := case when ip = '' then null
                      else encode(pg_catalog.sha256(convert_to('nifl-arge:' || trim(ip), 'UTF8')), 'hex') end;
  if new.ip_ozet is not null and (
       (select count(*) from public.sponsor_talepleri
          where ip_ozet = new.ip_ozet and created_at > now() - interval '1 hour') >= 5
    or (select count(*) from public.sponsor_talepleri
          where ip_ozet = new.ip_ozet and created_at > now() - interval '1 day') >= 20) then
    raise exception 'cok_fazla_talep' using errcode = 'P0001';
  end if;
  if (select count(*) from public.sponsor_talepleri
        where lower(eposta) = lower(new.eposta) and created_at > now() - interval '1 hour') >= 3 then
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

-- 2) Ad birliği: NIFL ARGE → NİFL AR-GE
alter table public.sponsor_talepleri alter column proje set default 'NİFL AR-GE’nin tamamı';
update public.haberler set baslik = replace(baslik, 'NIFL ARGE', 'NİFL AR-GE'), metin = replace(metin, 'NIFL ARGE', 'NİFL AR-GE')
  where baslik like '%NIFL ARGE%' or metin like '%NIFL ARGE%';

-- "Basında biz" için yeni haberler (14 Kasım 2026)
-- Supabase → SQL Editor → New query → yapıştırın → Run. Aynı başlık zaten varsa tekrar eklemez.
insert into public.haberler (tarih, proje, tur, baslik, metin, link, kaynak)
select * from (values
  ('2026-10-29', 'genel', 'haber',
   'Tabiat ve Yaşanabilir Çevre Bilgi Yarışması’nda Bursa il birincisi olduk',
   'MEB’in COP31 Türkiye kapsamında düzenlediği yarışmanın 27 Ekim’deki il finalinde sekiz takım yarıştı. Tüm soruları doğru yanıtlayıp eşitlik bozma sorularıyla birinciliği aldık.',
   'https://www.bursasoylem.com/2026/10/29/tabiat-ve-yasanabilir-cevre-bilgi-yarismasi-bursa-il-finalinde-birincilik-niluferin-oldu/',
   'Bursa Söylem'),
  ('2022-04-15', 'genel', 'haber',
   'Okulumuzun NİF Matematik Yarışması ilk kez ulusal düzeyde yapıldı',
   'Bursa Büyükşehir Belediyesi ile birlikte düzenlediğimiz yarışmanın dördüncüsüne Bursa dışında dokuz ilden 8. sınıf öğrencileri katıldı.',
   'https://www.iscihaber.net/yasam/bursada-matematik-icin-ter-doktuler/67950',
   'İşçi Haber')
) as v (tarih, proje, tur, baslik, metin, link, kaynak)
where not exists (select 1 from public.haberler h where h.baslik = v.baslik);

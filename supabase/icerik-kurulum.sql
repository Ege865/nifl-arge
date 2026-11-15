-- NIFL ARGE · sitenin bütün metinleri, görselleri ve projeleri Supabase'den
-- SQL Editor → New query → yapıştırın → Run. Tekrar çalıştırmak güvenli: var olan satırlara dokunmaz.
-- Sonra Table Editor'dan "icerik" ve "projeler" tablolarını düzenleyin; site sayfa yenilenince değişir.

-- ───────── sayfa metinleri ve görselleri ─────────
-- anahtar: sayfa.bolum.ogeN (değiştirmeyin) · deger: yeni metin ya da görsel adresi
-- tur = 'html' olan satırlarda <span class="dim">gri kısım</span>, <strong>kalın</strong>, <br> kullanılabilir.
-- tur = 'gorsel': Storage → gorseller klasörüne yükleyin, "Get URL" ile aldığınız adresi deger'e yapıştırın.
create table if not exists public.icerik (
  anahtar text primary key,
  deger text not null default '',
  tur text not null default 'metin' check (tur in ('metin', 'html', 'gorsel')),
  sayfa text not null default 'index',
  sira int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.icerik enable row level security;
drop policy if exists "herkes okur" on public.icerik;
create policy "herkes okur" on public.icerik for select to anon, authenticated using (true);
drop policy if exists "yonetici yazar" on public.icerik;
create policy "yonetici yazar" on public.icerik for all to authenticated using ((select public.yonetici_mi())) with check ((select public.yonetici_mi()));
revoke all on public.icerik from anon;
grant select on public.icerik to anon;
grant select, insert, update, delete on public.icerik to authenticated;

-- ───────── projeler ─────────
-- bilgiler: [["Kuruluş","2024"], ...] · hakkinda: ["paragraf", ...] · ekip: [["Ad Soyad","Görev"], ...]
-- galeri: [{"src":"görsel adresi","alt":"açıklama"}, ...] · sira: sekmelerdeki sıra · yayinda=false gizler
create table if not exists public.projeler (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  sira int not null default 100,
  ad text not null,
  baslik text,
  alan text not null default '',
  kisa text,
  durum text,
  gorsel text not null,
  gorsel_alt text,
  ozet text,
  logo text,
  bilgiler jsonb not null default '[]',
  hakkinda jsonb not null default '[]',
  ekip jsonb not null default '[]',
  galeri jsonb not null default '[]',
  yayinda boolean not null default true
);
alter table public.projeler enable row level security;
drop policy if exists "herkes yayindakileri okur" on public.projeler;
create policy "herkes yayindakileri okur" on public.projeler for select to anon, authenticated using (yayinda or (select public.yonetici_mi()));
drop policy if exists "yonetici yazar" on public.projeler;
create policy "yonetici yazar" on public.projeler for all to authenticated using ((select public.yonetici_mi())) with check ((select public.yonetici_mi()));
revoke all on public.projeler from anon;
grant select on public.projeler to anon;
grant select, insert, update, delete on public.projeler to authenticated;

insert into public.icerik (anahtar, deger, tur, sayfa, sira) values
  ('ortak.eposta', 'iletisim@niflarge.example', 'metin', 'ortak', 0),
  ('index.hero.h11', 'NİFL AR-GE', 'metin', 'index', 1),
  ('index.hero.p1', 'Nilüfer Borsa İstanbul Fen Lisesi’nin Ar-Ge birimi. Aurora Roket Takımımız <strong>1.629 takım arasında Türkiye birincisi</strong> oldu.', 'html', 'index', 2),
  ('index.hero.a1', 'Sponsor olun / Bağış yapın', 'metin', 'index', 3),
  ('index.hero.a2', 'Projeleri inceleyin', 'metin', 'index', 4),
  ('index.hero.gorsel1', 'assets/img/logo-lockup.png', 'gorsel', 'index', 0),
  ('index.hero.gorsel1.alt', '', 'metin', 'index', 0),
  ('index.arge.p1', 'Birçok lisede bir fikir proje ödevi olarak başlar ve not alınınca biter. Bizde aynı fikir bir rapora, bir prototipe, sonra bir yarışma sahasına gider.', 'metin', 'index', 7),
  ('index.arge.p2', 'NİFL AR-GE’yi okul müdürümüz Mustafa Ersoy kurdu. Bugün roket, su altı, hava, ekoloji ve TÜBİTAK projelerinde çalışan öğrencileri aynı çatı altında topluyor. <span class="accent">Amacımız Ar-Ge kültürünü önce okulumuzda, sonra Bursa’da ve Türkiye’de yaymak.</span>', 'html', 'index', 8),
  ('index.haberler.h21', 'Basında biz. <span class="dim">Haberlerde NİFL AR-GE ve takımlarımızdan son gelişmeler.</span>', 'html', 'index', 9),
  ('index.haberler.a1', 'Tümünü görün', 'metin', 'index', 10),
  ('index.sponsor.h21', 'Desteğiniz doğrudan atölyeye gider. <span class="dim">Sponsor olun ya da bağış yapın; bir projeye ya da birimin tamamına.</span>', 'html', 'index', 11),
  ('index.sponsor.p1', 'Roket motorundan aviyonik kartlara, atış alanına ulaşımdan atölye malzemesine kadar her destek bir projeyi bir adım öne taşır.', 'metin', 'index', 12),
  ('index.sponsor.h31', 'Logonuz sahada', 'metin', 'index', 13),
  ('index.sponsor.p2', 'Roketin, aracın ya da takım formalarının üzerinde.', 'metin', 'index', 14),
  ('index.sponsor.h32', 'Adınız burada', 'metin', 'index', 15),
  ('index.sponsor.p3', 'Bu sitede ve sosyal medya hesaplarımızda.', 'metin', 'index', 16),
  ('index.sponsor.h33', 'Raporlarda teşekkür', 'metin', 'index', 17),
  ('index.sponsor.p4', 'Yarışma raporlarında ve sunumlarda.', 'metin', 'index', 18),
  ('index.sponsor.h34', 'Takımla tanışın', 'metin', 'index', 19),
  ('index.sponsor.p5', 'Atölye ziyareti ya da atış günü buluşması.', 'metin', 'index', 20),
  ('index.form.h21', 'Sorularınız varsa <span class="dim">burada.</span>', 'html', 'index', 21),
  ('index.form.button1', 'Sponsor olmak için ne yapmam gerekiyor?', 'metin', 'index', 22),
  ('index.q1.p1', 'Formu doldurmanız yeterli. Bir öğretmenimiz ve ilgili takımın kaptanı sizinle iletişime geçer, ihtiyaç listesini birlikte konuşuruz.', 'metin', 'index', 23),
  ('index.form.button2', 'Belirli bir projeyi destekleyebilir miyim?', 'metin', 'index', 24),
  ('index.q2.p1', 'Evet. Formda desteklemek istediğiniz projeyi seçin ya da “NİFL AR-GE’nin tamamı” deyin; destek seçtiğiniz yere gider.', 'metin', 'index', 25),
  ('index.form.button3', 'Para yerine malzeme ya da hizmet verebilir miyim?', 'metin', 'index', 26),
  ('index.q3.p1', 'Elektronik kart, baskı, kompozit malzeme, ulaşım gibi ayni destekleri de konuşabiliriz. Mesajınızda ne sunabileceğinizi yazın.', 'metin', 'index', 27),
  ('index.form.button4', 'Atölyeyi görebilir miyim?', 'metin', 'index', 28),
  ('index.q4.p1', 'Formdan bir gün önerin; okul yönetimiyle planlayıp sizi Teknonif atölyesinde ağırlayalım.', 'metin', 'index', 29),
  ('index.form.button5', 'Sponsor olmadan bağış yapabilir miyim?', 'metin', 'index', 30),
  ('index.q5.p1', 'Evet. Formda destek türü olarak “Bağış”ı seçin; bağışın nasıl yapılacağını size e-postayla iletelim. Her tutar bir projeyi bir adım öne taşır.', 'metin', 'index', 31),
  ('index.iletisim.h21', 'İletişim. <span class="dim">Bize yazın ya da atölyemize gelin.</span>', 'html', 'index', 32),
  ('index.iletisim.span1', 'E-posta', 'metin', 'index', 33),
  ('index.iletisim.span3', 'Adres', 'metin', 'index', 34),
  ('index.iletisim.span4', 'Nilüfer Borsa İstanbul Fen Lisesi<br/>Erdoğan Binyücel Caddesi, Odunluk, Nilüfer / Bursa', 'html', 'index', 35),
  ('index.iletisim.span5', 'Konum', 'metin', 'index', 36),
  ('index.iletisim.span6', '<a class="link" data-map="" href="https://www.openstreetmap.org/search?query=Erdo%C4%9Fan%20Biny%C3%BCcel%20Caddesi%20Odunluk%20Nil%C3%BCfer%20Bursa" rel="noopener" target="_blank">Haritada açın</a>', 'html', 'index', 37),
  ('index.close.h21', 'Rotayı biz çizeriz. <span class="dim">Bir sonraki fırlatmayı birlikte yapalım.</span>', 'html', 'index', 38),
  ('index.close.a1', 'Sponsor olun / Bağış yapın', 'metin', 'index', 39),
  ('ortak.foot.address1', 'Nilüfer Borsa İstanbul Fen Lisesi<br/>Erdoğan Binyücel Caddesi, Odunluk, Nilüfer / Bursa', 'html', 'ortak', 40),
  ('ortak.foot.h31', 'Projeler', 'metin', 'ortak', 41),
  ('ortak.foot.h32', 'Daha fazla', 'metin', 'ortak', 42),
  ('ortak.foot.h33', 'İletişim', 'metin', 'ortak', 43),
  ('haberler.pagehead.h11', 'Basında biz', 'metin', 'haberler', 44),
  ('haberler.pagehead.p1', 'Gazetelerde ve haber sitelerinde NİFL AR-GE, takımlarımızdan duyurular ve yarışma sonuçları.', 'metin', 'haberler', 45),
  ('proje.sec.h21', 'Hakkında', 'metin', 'proje', 46),
  ('proje.sec.h22', 'Ekip', 'metin', 'proje', 47),
  ('proje.sec.h23', 'Gelişmeler. <span class="dim">En yenisi üstte.</span>', 'html', 'proje', 48),
  ('proje.sec.h24', 'Fotoğraflar', 'metin', 'proje', 49),
  ('proje.close.a1', 'Sponsor olun', 'metin', 'proje', 50),
  ('kvkk.pagehead.h11', 'Kişisel verilerin korunması', 'metin', 'kvkk', 51),
  ('kvkk.pagehead.p1', 'Sponsorluk ve bağış formu ile e-posta yazışmaları için 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi kapsamında aydınlatma metni.', 'metin', 'kvkk', 52),
  ('kvkk.sec.h21', 'Veri sorumlusu', 'metin', 'kvkk', 53),
  ('kvkk.sec.p1', 'Kişisel verileriniz, veri sorumlusu sıfatıyla T.C. Millî Eğitim Bakanlığı’na bağlı Nilüfer Borsa İstanbul Fen Lisesi Müdürlüğü tarafından işlenir. NİFL AR-GE, okulun Ar-Ge birimidir ve ayrı bir tüzel kişiliği yoktur.', 'metin', 'kvkk', 54),
  ('kvkk.sec.span1', 'Adres', 'metin', 'kvkk', 55),
  ('kvkk.sec.span2', 'Erdoğan Binyücel Caddesi, Odunluk Mahallesi, Nilüfer / Bursa', 'metin', 'kvkk', 56),
  ('kvkk.sec.span3', 'E-posta', 'metin', 'kvkk', 57),
  ('kvkk.sec.h22', 'Hangi verileri, neden işliyoruz', 'metin', 'kvkk', 58),
  ('kvkk.sec.span5', 'Kimlik', 'metin', 'kvkk', 59),
  ('kvkk.sec.span6', 'Adınız ve soyadınız', 'metin', 'kvkk', 60),
  ('kvkk.sec.span7', 'İletişim', 'metin', 'kvkk', 61),
  ('kvkk.sec.span8', 'E-posta adresiniz', 'metin', 'kvkk', 62),
  ('kvkk.sec.span9', 'Kurum', 'metin', 'kvkk', 63),
  ('kvkk.sec.span10', 'Çalıştığınız ya da temsil ettiğiniz kurumun adı', 'metin', 'kvkk', 64),
  ('kvkk.sec.span11', 'Talep', 'metin', 'kvkk', 65),
  ('kvkk.sec.span12', 'Mesajınız, destek türü (sponsorluk, bağış ya da malzeme/hizmet) ve desteklemek istediğiniz proje', 'metin', 'kvkk', 66),
  ('kvkk.sec.span29', 'Teknik kayıt', 'metin', 'kvkk', 67),
  ('kvkk.sec.span30', 'Formun kötüye kullanılmasını önlemek için IP adresinizin geri çevrilemeyen özeti; IP adresinizin kendisi saklanmaz', 'metin', 'kvkk', 68),
  ('kvkk.sec.p2', 'Bu verileri yalnızca sponsorluk ya da bağış talebinizi değerlendirmek, size dönüş yapmak, destek ilişkisi kurulursa bunu yürütmek ve formun otomatik ya da toplu gönderimlerle kötüye kullanılmasını önlemek için işleriz. Verileriniz pazarlama, bülten ya da başka bir amaçla kullanılmaz.', 'metin', 'kvkk', 69),
  ('kvkk.sec.h23', 'Hukuki sebep ve toplama yöntemi', 'metin', 'kvkk', 70),
  ('kvkk.sec.p3', 'Verileriniz, KVKK’nın 5. maddesinin 2. fıkrasının (c) bendi uyarınca bir sözleşmenin kurulmasıyla doğrudan ilgili olması ve (f) bendi uyarınca talebinize yanıt verebilmemiz için meşru menfaatimiz bulunması hukuki sebeplerine dayanılarak işlenir. Kötüye kullanımı önlemek için tutulan IP özeti de (f) bendindeki meşru menfaatimize dayanır. Bu amaçlar için ayrıca açık rızanız istenmez.', 'metin', 'kvkk', 71),
  ('kvkk.sec.p4', 'Veriler, bu sitedeki sponsorluk ve bağış formunu gönderdiğinizde ya da bize doğrudan e-posta yazdığınızda elektronik ortamda toplanır. Formdaki bilgiler, yalnızca yetkili okul personelinin şifreyle erişebildiği bir veritabanına kaydedilir.', 'metin', 'kvkk', 72),
  ('kvkk.sec.h24', 'Kimlerle paylaşılır, ne kadar saklanır', 'metin', 'kvkk', 73),
  ('kvkk.sec.p5', 'Verileriniz okul yönetimi ve ilgili projenin danışman öğretmeniyle, talebinizi yanıtlamak için gerektiği kadar paylaşılır. Yasal bir zorunluluk olduğunda yetkili kamu kurum ve kuruluşlarına aktarılabilir. Üçüncü kişilere satılmaz ya da reklam amacıyla verilmez.', 'metin', 'kvkk', 74),
  ('kvkk.sec.p6', 'Form kayıtları, veritabanı hizmetini aldığımız Supabase Inc.’in Avrupa Birliği’ndeki (Frankfurt, Almanya) sunucularında saklanır. Bu, kişisel verilerinizin yurt dışına aktarılması anlamına gelir. Aktarım için KVKK’nın 9. maddesinde sayılan güvencelerden, Kişisel Verileri Koruma Kurulu’nun ilan ettiği standart sözleşmeye dayanılır. Supabase verilerinizi yalnızca bu hizmeti sağlamak için işler.', 'metin', 'kvkk', 75),
  ('kvkk.sec.p7', 'Verileriniz, talebiniz sonuçlandıktan sonra en fazla 2 yıl saklanır; bu sürenin sonunda IP özetiyle birlikte silinir ya da anonim hâle getirilir. Sponsorluk ilişkisi kurulursa ilgili mevzuatın öngördüğü süreler uygulanır.', 'metin', 'kvkk', 76),
  ('kvkk.sec.h25', 'Haklarınız', 'metin', 'kvkk', 77),
  ('kvkk.sec.p8', 'KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak şunları talep edebilirsiniz:', 'metin', 'kvkk', 78),
  ('kvkk.sec.span13', 'Bilgi', 'metin', 'kvkk', 79),
  ('kvkk.sec.span14', 'Verilerinizin işlenip işlenmediğini öğrenme, işlendiyse buna ilişkin bilgi isteme', 'metin', 'kvkk', 80),
  ('kvkk.sec.span15', 'Amaç', 'metin', 'kvkk', 81),
  ('kvkk.sec.span16', 'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme', 'metin', 'kvkk', 82),
  ('kvkk.sec.span17', 'Aktarım', 'metin', 'kvkk', 83),
  ('kvkk.sec.span18', 'Yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilme', 'metin', 'kvkk', 84),
  ('kvkk.sec.span19', 'Düzeltme', 'metin', 'kvkk', 85),
  ('kvkk.sec.span20', 'Eksik ya da yanlış işlenmişse düzeltilmesini isteme', 'metin', 'kvkk', 86),
  ('kvkk.sec.span21', 'Silme', 'metin', 'kvkk', 87),
  ('kvkk.sec.span22', 'KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini ya da yok edilmesini isteme', 'metin', 'kvkk', 88),
  ('kvkk.sec.span23', 'Bildirim', 'metin', 'kvkk', 89),
  ('kvkk.sec.span24', 'Düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme', 'metin', 'kvkk', 90),
  ('kvkk.sec.span25', 'İtiraz', 'metin', 'kvkk', 91),
  ('kvkk.sec.span26', 'Yalnızca otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuca itiraz etme', 'metin', 'kvkk', 92),
  ('kvkk.sec.span27', 'Tazmin', 'metin', 'kvkk', 93),
  ('kvkk.sec.span28', 'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme', 'metin', 'kvkk', 94),
  ('kvkk.sec.p9', 'Başvurunuzu yukarıdaki adrese yazılı olarak ya da e-posta ile iletebilirsiniz. Başvurular, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak en geç 30 gün içinde ücretsiz yanıtlanır.', 'metin', 'kvkk', 95),
  ('kvkk.sec.h26', 'Çerezler', 'metin', 'kvkk', 96),
  ('kvkk.sec.p10', 'Bu site çerez ya da ziyaretçi takip aracı kullanmaz. Yazı tipleri ve kütüphaneler sitenin kendi sunucusundan yüklenir. Haberler ve sponsor listesi sayfa açılırken veritabanından okunur; bu sırada tarayıcınızın IP adresi, teknik olarak zorunlu olduğu için veritabanı sunucusuna ulaşır ve hizmet sağlayıcının güvenlik kayıtlarında kısa süre tutulabilir.', 'metin', 'kvkk', 97),
  ('kvkk.sec.p11', 'Son güncelleme: 14 Kasım 2026', 'metin', 'kvkk', 98),
  ('404.pagehead.h11', 'Bu sayfa bulunamadı', 'metin', '404', 99),
  ('404.pagehead.p1', 'Aradığınız sayfa taşınmış, adı değişmiş ya da hiç olmamış olabilir. Aşağıdan devam edebilirsiniz.', 'metin', '404', 100),
  ('404.pagehead.a1', 'Ana sayfaya dönün', 'metin', '404', 101),
  ('404.pagehead.a2', 'Projeleri inceleyin', 'metin', '404', 102)
on conflict (anahtar) do nothing;

insert into public.projeler (slug, sira, ad, baslik, alan, kisa, durum, gorsel, gorsel_alt, ozet, logo, bilgiler, hakkinda, ekip, galeri) values
  ('roket', 10, 'Aurora Roket Takımı', 'Tavan puanın üstünde.', 'Roket', 'TEKNOFEST Roket Yarışması, A1 ve A2 kategorileri', 'TEKNOFEST 2026 Türkiye birincisi', 'assets/img/roket-takim-okul.jpg', 'Aurora Roket Takımı okulun önünde, ortada kırmızı roketleriyle', 'Semrük roketimiz 3.350 metreye çıktı ve 1.629 takım arasında Türkiye birincisi oldu.', null, '[["Kuruluş","2024"],["Ekip","16 öğrenci"],["Danışman","Aşir Çalışkan"],["Son sonuç","1.038 puan, Türkiye 1.si"]]'::jsonb, '["Aurora, TEKNOFEST Roket Yarışması için 2024’te kuruldu. Adını coğrafya öğretmenimiz Ali İhsan Ulu önerdi.","İlk yıl kısmi başarıyla Türkiye 8.si olduk. İkinci yıl roketimiz düştü. Üçüncü yıl ön tasarım, kritik tasarım ve atışa hazırlık raporlarını geçip 25 finalistten biri olduk.","Efsanevi iki başlı kuştan adını alan Semrük, 7–13 Eylül 2026’da Aksaray Hisar Atış Alanı’nda 3.350 metreye çıktı, ayrıldı, paraşütlerini açtı ve indi. GPS verisiyle gövdeyi ve faydalı yükü 18 dakikada bulduk. Sekiz saatlik montajı dört saatte bitirdik.","2027 sezonunda A1 ve A2 kategorilerinde iki ayrı takımla yarışıyoruz."]'::jsonb, '[["Samet Karabulut","Takım kaptanı"],["Nisa Göktekin","Takım kaptanı, aviyonik"],["Aşir Çalışkan","Danışman öğretmen"]]'::jsonb, '[{"src":"assets/img/roket-roketsan.jpg","alt":"Aurora Roket Takımı yarışma alanında, Roketsan yazısının önünde"},{"src":"assets/img/roket-takim-okul.jpg","alt":"Takım okulun önünde roketiyle"}]'::jsonb),
  ('denizalti', 20, 'Dalayhan Denizaltı Takımı', 'Su altına iniyoruz.', 'Su altı', 'İnsansız su altı aracı', 'Tasarım aşamasında', 'assets/img/dalayhan-rov.jpg', 'Dalayhan insansız su altı aracının bilgisayar tasarımı: lacivert gövde çerçevesi, turuncu motor yuvaları ve şeffaf tüpler', 'Takımımız insansız su altı aracını tasarlıyor ve yarışmalara hazırlanıyor.', null, '[["Alan","İnsansız su altı aracı"],["Durum","Tasarım"],["Hedef","Ulusal yarışmalar"]]'::jsonb, '["Dalayhan takımımız insansız su altı aracını tasarlıyor ve yarışmalara hazırlanıyor."]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('iha', 30, 'GökTürk İHA Takımı', 'İstikbal göklerde.', 'Hava', 'TEKNOFEST İnsansız Hava Aracı Yarışması', '2026’da kuruldu', 'assets/img/photo-f93507658-960.jpg', 'Havada süzülen dört pervaneli bir insansız hava aracı', 'NİFL AR-GE’nin en yeni takımı. Hedefimiz TEKNOFEST’te Türkiye birinciliği.', 'assets/img/gokturk-lockup.png', '[["Kuruluş","2026"],["Yarışma","TEKNOFEST İHA"],["Hedef","Türkiye birinciliği"]]'::jsonb, '["GökTürk, Nilüfer Borsa İstanbul Fen Lisesi öğrencilerinin 2026’da kurduğu insansız hava aracı takımı.","Vizyonumuz insansız hava aracı teknolojileri geliştirmek ve Ar-Ge kültürünü önce okulumuzda, sonra Bursa’da ve Türkiye’de yaymak. Misyonumuz TEKNOFEST İnsansız Hava Aracı Yarışması’nda Türkiye birincisi olmak.","İHA, TEKNOFEST’te rekabeti en yüksek kategorilerden biri. Zor bir alanı bilerek seçtik; güçlü rakipler bizi daha iyi mühendis yapacak."]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('eko-okul', 40, 'Ekolojik Okul Projesi', 'Okulu yeşile çeviriyoruz.', 'Ekoloji', 'Sera ve sürdürülebilir okul', 'Sürüyor', 'assets/img/ekolojik-sera.jpg', 'Kemer çatılı bir sera ve önündeki saksılarda çiçekler', 'Okulumuzu daha yeşil ve daha az tüketen bir yer yapmak için çalışıyoruz.', null, '[["Alan","Ekoloji, tarım"],["Durum","Sürüyor"]]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('tubitak', 50, 'TÜBİTAK Projeleri', 'Sorudan rapora.', 'Araştırma', 'Bilim fuarları ve araştırma projeleri', 'Her yıl', 'assets/img/photo-f4071999-960.jpg', 'Bir devre kartına cımbızla parça yerleştiren el', 'Öğrencilerimiz TÜBİTAK bilim fuarlarında ve araştırma projesi yarışmalarında yer alıyor.', null, '[["Alan","Fen, matematik, mühendislik"],["Durum","Her yıl"]]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('bireysel', 60, 'Bireysel Projeler', 'Kendi fikrin, kendi projen.', 'Bireysel', 'Öğrencilerin kendi fikirleri', 'Sürüyor', 'assets/img/photo-f163872371-960.jpg', 'Uzakta tarladan fırlayan bir model roket ve onu telefonla çeken biri', 'Bir takıma bağlı olmadan kendi fikrini geliştiren öğrencilerimizin projeleri.', null, '[["Alan","Serbest"],["Durum","Sürüyor"]]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
on conflict (slug) do nothing;

-- Ana sayfadan kaldırılan bölümlerin (Semrük uçuşu, sezonlar, okul) satırları
delete from public.icerik where anahtar like 'index.ucus.%' or anahtar like 'index.sezonlar.%' or anahtar like 'index.okul.%';

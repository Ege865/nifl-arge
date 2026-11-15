/* NİFL AR-GE — sitenin içerik dosyası.
   Projeleri, haberleri ve sponsorları buradan güncelleyin; sayfalar bu dosyadan okur.
   Supabase bağlandıktan sonra (assets/js/db.js) haberler, gelişmeler ve sponsorlar yönetim sayfasından
   (yonetim.html) yönetilir; buradaki haberler/gelismeler/sponsorlar yalnızca yedek olarak kullanılır.
   Kurallar:
   - Tarihler "YYYY-AA-GG" biçiminde (ör. "2026-10-30"). Gün bilinmiyorsa "2026-10" yazın.
   - Görseller assets/img/ klasöründe; en fazla 1600 px genişliğinde JPG/WebP önerilir.
   - Bir alanı boş bırakmak için "" ya da [] yazın; sayfa o bölümü gizler. */

export const iletisim = {
  eposta: 'aliege22022011@gmail.com', // GERÇEK ADRES GELİNCE DEĞİŞTİRİN
  adres: 'Erdoğan Binyücel Caddesi, Odunluk, Nilüfer / Bursa',
  harita: 'https://www.openstreetmap.org/search?query=Erdo%C4%9Fan%20Biny%C3%BCcel%20Caddesi%20Odunluk%20Nil%C3%BCfer%20Bursa',
  sosyal: [] // ör. { ad: 'Instagram', url: 'https://instagram.com/...' }
};

export const projeler = [
  {
    slug: 'roket',
    baslik: 'Tavan puanın üstünde.', // vitrin panelindeki büyük slogan
    ad: 'Aurora Roket Takımı',
    alan: 'Roket',
    kisa: 'TEKNOFEST Roket Yarışması, A1 ve A2 kategorileri',
    durum: 'TEKNOFEST 2026 Türkiye birincisi',
    gorsel: 'assets/img/roket-takim-okul.jpg',
    gorselAlt: 'Aurora Roket Takımı okulun önünde, ortada kırmızı roketleriyle',
    ozet: 'Semrük roketimiz 3.350 metreye çıktı ve 1.629 takım arasında Türkiye birincisi oldu.',
    bilgiler: [
      ['Kuruluş', '2024'],
      ['Ekip', '16 öğrenci'],
      ['Danışman', 'Aşir Çalışkan'],
      ['Son sonuç', '1.038 puan, Türkiye 1.si']
    ],
    hakkinda: [
      'Aurora, TEKNOFEST Roket Yarışması için 2024’te kuruldu. Adını coğrafya öğretmenimiz Ali İhsan Ulu önerdi.',
      'İlk yıl kısmi başarıyla Türkiye 8.si olduk. İkinci yıl roketimiz düştü. Üçüncü yıl ön tasarım, kritik tasarım ve atışa hazırlık raporlarını geçip 25 finalistten biri olduk.',
      'Efsanevi iki başlı kuştan adını alan Semrük, 7–13 Eylül 2026’da Aksaray Hisar Atış Alanı’nda 3.350 metreye çıktı, ayrıldı, paraşütlerini açtı ve indi. GPS verisiyle gövdeyi ve faydalı yükü 18 dakikada bulduk. Sekiz saatlik montajı dört saatte bitirdik.',
      '2027 sezonunda A1 ve A2 kategorilerinde iki ayrı takımla yarışıyoruz.'
    ],
    ekip: [
      ['Samet Karabulut', 'Takım kaptanı'],
      ['Nisa Göktekin', 'Takım kaptanı, aviyonik'],
      ['Aşir Çalışkan', 'Danışman öğretmen']
    ],
    galeri: [
      { src: 'assets/img/roket-roketsan.jpg', alt: 'Aurora Roket Takımı yarışma alanında, Roketsan yazısının önünde', w: 686, h: 457 },
      { src: 'assets/img/roket-takim-okul.jpg', alt: 'Takım okulun önünde roketiyle', w: 1150, h: 646 }
    ],
    gelismeler: [
      { tarih: '2026-10-30', baslik: 'TEKNOFEST 2026 Roket Yarışması’nda Türkiye birincisi olduk', metin: '1.000 puanlık tavanı aşıp 1.038 puan aldık.', link: 'https://www.dha.com.tr/foto-galeri/efsanevi-kus-semrukun-ismini-verdikleri-roketle-teknofestin-tavan-puanini-astilar-2972145' },
      { tarih: '2026-09', baslik: 'Semrük Aksaray’da 3.350 metreye çıktı', metin: 'Atış 7–13 Eylül arasında Hisar Atış Alanı’nda yapıldı.' },
      { tarih: '2026', baslik: '25 finalistten biri olduk', metin: 'ÖTR, KTR ve AHR raporlarını geçtik.' },
      { tarih: '2025', baslik: 'İkinci sezon: roket düştü', metin: 'Bu sezondan öğrendiklerimizle tasarımı yeniden kurduk.' },
      { tarih: '2024', baslik: 'İlk sezon: Türkiye 8.si', metin: 'Takım 2024’te kuruldu.' }
    ]
  },
  {
    slug: 'denizalti',
    baslik: 'Su altına iniyoruz.', // vitrin panelindeki büyük slogan
    ad: 'Dalayhan Denizaltı Takımı',
    alan: 'Su altı',
    kisa: 'İnsansız su altı aracı',
    durum: 'Tasarım aşamasında',
    gorsel: 'assets/img/dalayhan-rov.jpg',
    gorselAlt: 'Dalayhan insansız su altı aracının bilgisayar tasarımı: lacivert gövde çerçevesi, turuncu motor yuvaları ve şeffaf tüpler',
    ozet: 'Takımımız insansız su altı aracını tasarlıyor ve yarışmalara hazırlanıyor.',
    bilgiler: [
      ['Alan', 'İnsansız su altı aracı'],
      ['Durum', 'Tasarım'],
      ['Hedef', 'Ulusal yarışmalar']
    ],
    hakkinda: [
      'Dalayhan takımımız insansız su altı aracını tasarlıyor ve yarışmalara hazırlanıyor.'
    ],
    ekip: [],
    galeri: [],
    gelismeler: []
  },
  {
    slug: 'iha',
    baslik: 'İstikbal göklerde.', // vitrin panelindeki büyük slogan
    ad: 'GökTürk İHA Takımı',
    alan: 'Hava',
    kisa: 'TEKNOFEST İnsansız Hava Aracı Yarışması',
    durum: '2026’da kuruldu',
    gorsel: 'assets/img/photo-f93507658-960.jpg',
    gorselAlt: 'Havada süzülen dört pervaneli bir insansız hava aracı',
    ozet: 'NİFL AR-GE’nin en yeni takımı. Hedefimiz TEKNOFEST’te Türkiye birinciliği.',
    bilgiler: [
      ['Kuruluş', '2026'],
      ['Yarışma', 'TEKNOFEST İHA'],
      ['Hedef', 'Türkiye birinciliği']
    ],
    hakkinda: [
      'GökTürk, Nilüfer Borsa İstanbul Fen Lisesi öğrencilerinin 2026’da kurduğu insansız hava aracı takımı.',
      'Vizyonumuz insansız hava aracı teknolojileri geliştirmek ve Ar-Ge kültürünü önce okulumuzda, sonra Bursa’da ve Türkiye’de yaymak. Misyonumuz TEKNOFEST İnsansız Hava Aracı Yarışması’nda Türkiye birincisi olmak.',
      'İHA, TEKNOFEST’te rekabeti en yüksek kategorilerden biri. Zor bir alanı bilerek seçtik; güçlü rakipler bizi daha iyi mühendis yapacak.'
    ],
    logo: 'assets/img/gokturk-lockup.png',
    ekip: [],
    galeri: [],
    gelismeler: [
      { tarih: '2026', baslik: 'GökTürk İHA Takımı kuruldu', metin: 'Takım NİFL AR-GE çatısı altında çalışmaya başladı.' }
    ]
  },
  {
    slug: 'eko-okul',
    baslik: 'Okulu yeşile çeviriyoruz.', // vitrin panelindeki büyük slogan
    ad: 'Ekolojik Okul Projesi',
    alan: 'Ekoloji',
    kisa: 'Sera ve sürdürülebilir okul',
    durum: 'Sürüyor',
    gorsel: 'assets/img/ekolojik-sera.jpg',
    gorselAlt: 'Kemer çatılı bir sera ve önündeki saksılarda çiçekler',
    ozet: 'Okulumuzu daha yeşil ve daha az tüketen bir yer yapmak için çalışıyoruz.',
    bilgiler: [
      ['Alan', 'Ekoloji, tarım'],
      ['Durum', 'Sürüyor']
    ],
    hakkinda: [],
    ekip: [],
    galeri: [],
    gelismeler: []
  },
  {
    slug: 'tubitak',
    baslik: 'Sorudan rapora.', // vitrin panelindeki büyük slogan
    ad: 'TÜBİTAK Projeleri',
    alan: 'Araştırma',
    kisa: 'Bilim fuarları ve araştırma projeleri',
    durum: 'Her yıl',
    gorsel: 'assets/img/photo-f4071999-960.jpg',
    gorselAlt: 'Bir devre kartına cımbızla parça yerleştiren el',
    ozet: 'Öğrencilerimiz TÜBİTAK bilim fuarlarında ve araştırma projesi yarışmalarında yer alıyor.',
    bilgiler: [
      ['Alan', 'Fen, matematik, mühendislik'],
      ['Durum', 'Her yıl']
    ],
    hakkinda: [],
    ekip: [],
    galeri: [],
    gelismeler: []
  },
  {
    slug: 'bireysel',
    baslik: 'Kendi fikrin, kendi projen.', // vitrin panelindeki büyük slogan
    ad: 'Bireysel Projeler',
    alan: 'Bireysel',
    kisa: 'Öğrencilerin kendi fikirleri',
    durum: 'Sürüyor',
    gorsel: 'assets/img/photo-f163872371-960.jpg',
    gorselAlt: 'Uzakta tarladan fırlayan bir model roket ve onu telefonla çeken biri',
    ozet: 'Bir takıma bağlı olmadan kendi fikrini geliştiren öğrencilerimizin projeleri.',
    bilgiler: [
      ['Alan', 'Serbest'],
      ['Durum', 'Sürüyor']
    ],
    hakkinda: [],
    ekip: [],
    galeri: [],
    gelismeler: []
  }
];

/* Haberler: en yeni en üstte. proje: projeler listesindeki slug ya da "genel". */
export const haberler = [
  {
    tarih: '2026-10-30',
    proje: 'roket',
    baslik: 'Aurora Roket Takımı TEKNOFEST 2026’da Türkiye birincisi',
    metin: 'Semrük roketimiz 1.629 takımın yarıştığı Roket Yarışması’nda 1.000 puanlık tavanı aşarak 1.038 puan aldı.',
    gorsel: 'assets/img/roket-roketsan.jpg',
    link: 'https://www.dha.com.tr/foto-galeri/efsanevi-kus-semrukun-ismini-verdikleri-roketle-teknofestin-tavan-puanini-astilar-2972145',
    kaynak: 'DHA'
  },
  {
    tarih: '2026-10-30',
    proje: 'roket',
    baslik: 'Aurora 2027 sezonunda iki takımla yarışacak',
    metin: 'Takım, A1 ve A2 kategorilerinde ayrı ayrı yarışmak için hazırlanıyor.'
  },
  {
    tarih: '2026-10-29',
    proje: 'genel',
    baslik: 'Tabiat ve Yaşanabilir Çevre Bilgi Yarışması’nda Bursa il birincisi olduk',
    metin: 'MEB’in COP31 Türkiye kapsamında düzenlediği yarışmanın 27 Ekim’deki il finalinde sekiz takım yarıştı. Tüm soruları doğru yanıtlayıp eşitlik bozma sorularıyla birinciliği aldık.',
    link: 'https://www.bursasoylem.com/2026/10/29/tabiat-ve-yasanabilir-cevre-bilgi-yarismasi-bursa-il-finalinde-birincilik-niluferin-oldu/',
    kaynak: 'Bursa Söylem'
  },
  {
    tarih: '2026-09',
    proje: 'roket',
    baslik: 'Semrük Aksaray’da 3.350 metreye çıktı',
    metin: 'Atış 7–13 Eylül arasında Hisar Atış Alanı’nda yapıldı. Gövdeyi ve faydalı yükü GPS ile 18 dakikada bulduk.'
  },
  {
    tarih: '2026',
    proje: 'iha',
    baslik: 'GökTürk İHA Takımı kuruldu',
    metin: 'NİFL AR-GE’nin en yeni takımı TEKNOFEST İnsansız Hava Aracı Yarışması’na hazırlanıyor.'
  },
  {
    tarih: '2022-04-15',
    proje: 'genel',
    baslik: 'Okulumuzun NİF Matematik Yarışması ilk kez ulusal düzeyde yapıldı',
    metin: 'Bursa Büyükşehir Belediyesi ile birlikte düzenlediğimiz yarışmanın dördüncüsüne Bursa dışında dokuz ilden 8. sınıf öğrencileri katıldı.',
    link: 'https://www.iscihaber.net/yasam/bursada-matematik-icin-ter-doktuler/67950',
    kaynak: 'İşçi Haber'
  }
];

/* Aktif sponsorlar. Örnek: { ad: 'Firma Adı', logo: 'assets/img/sponsor-firma.png', url: 'https://...', proje: 'roket' } */
export const sponsorlar = [];

/* Yardımcılar */
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function tarihYaz(t) {
  const [y, m, d] = String(t).split('-');
  if (d) return `${+d} ${AYLAR[+m - 1]} ${y}`;
  if (m) return `${AYLAR[+m - 1]} ${y}`;
  return y;
}
export function proje(slug) { return projeler.find(p => p.slug === slug); }

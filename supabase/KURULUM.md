# NIFL ARGE · Supabase kurulumu

Supabase bağlanana kadar site eskisi gibi çalışır: içerik `assets/data/site.js` dosyasından gelir ve form e-posta uygulamasını açar. Aşağıdaki adımlardan sonra:

- Sponsorluk formu talepleri veritabanına kaydeder.
- Haberler, proje gelişmeleri ve sponsor logoları veritabanından gelir.
- `yonetim.html` sayfasından şifreyle giriş yapılarak bunlar kod yazmadan yönetilir.

Supabase'e ulaşılamazsa (internet sorunu, proje durdurulmuş vb.) site kendiliğinden `site.js` içeriğine döner.

## 1. Projeyi açın

1. supabase.com'da hesap açın, sonra **New project** deyin.
2. Proje adı olarak `nifl-arge` yazın.
3. **Region: Central EU (Frankfurt)** seçin. KVKK metni bu bölgeye göre yazıldı.
4. Veritabanı şifresini güçlü seçin ve şifre yöneticisine kaydedin. Siteye bu şifre yazılmaz.

## 2. Tabloları kurun

1. Sol menüden **SQL Editor**, ardından **New query**'ye girin.
2. `supabase/kurulum.sql` dosyasının tamamını yapıştırıp **Run** deyin.

Bu adım şunları kurar:

- haberler, sponsorlar, sponsorluk talepleri ve yöneticiler tabloları;
- erişim kuralları;
- spam freni;
- görsel klasörü;
- sitedeki mevcut haberler.

## 3. Dışarıdan kaydı kapatın

**Authentication → Sign In / Providers** sayfasında **Allow new users to sign up** seçeneğini kapatın. Böylece yönetim hesaplarını yalnızca siz açarsınız.

## 4. Yönetici hesabı açın

1. **Authentication → Users → Add user → Create new user** yolunu izleyin.
2. Öğretmenin ya da sorumlu öğrencinin e-postasını ve bir şifre yazın.
3. **Auto Confirm User** kutusunu işaretleyin.
4. Sonra SQL Editor'da şunu çalıştırın. E-postayı kendinizinkiyle değiştirin:

```sql
insert into public.yoneticiler (user_id, eposta)
select id, email from auth.users where email = 'ogretmen@ornek.com';
```

Bu tabloda olmayan bir hesap giriş yapsa bile hiçbir şeyi göremez ve değiştiremez.

## 5. Siteyi bağlayın

1. **Project Settings → API Keys** sayfasından **publishable** anahtarı kopyalayın. Eski projelerde bunun adı **anon public**'tir.
2. Proje adresini alın: üstteki **Connect** düğmesinde ya da **Data API** sayfasında `https://xxxx.supabase.co` biçiminde görünür.
3. İkisini `assets/js/db.js` dosyasının en üstüne yazın:

```js
export const SUPABASE = {
  url: 'https://xxxx.supabase.co',
  anahtar: 'sb_publishable_...'
};
```

Publishable anahtar herkese açık olacak şekilde tasarlanmıştır; tabloları erişim kuralları korur.

> **service_role** ya da **secret** anahtarını asla siteye, bu dosyaya ya da bir sohbete yazmayın. Bu anahtar bütün kuralları atlar.

## 6. Deneyin

1. Ana sayfadaki formu doldurup gönderin. "Talebiniz alındı" yazmalı.
2. `yonetim.html` sayfasını açıp giriş yapın. Talep **Talepler** sekmesinde görünmeli.
3. **Haberler** sekmesinden bir haber ekleyin. Ana sayfanın "Günün haberleri" bölümünde görünmeli.

## Bilmeniz gerekenler

- **KVKK:** Form kayıtları Frankfurt'ta tutulduğu için bu bir yurt dışına aktarımdır. Okul, Kurul'un standart sözleşmesini Supabase ile imzalamalı ve 5 iş günü içinde Kurum'a bildirmelidir. `kvkk.html` metni bu yapılmış varsayılarak yazıldı.
- **Saklama süresi:** Kapanan talepleri en geç 2 yıl sonra yönetim sayfasından silin.
- **Ücretsiz plan:** Proje bir hafta hiç kullanılmazsa durdurulur. Site bu durumda `site.js` içeriğine döner. Panelden **Restore** ile yeniden açılır.
- **Yedek:** Ücretsiz planda otomatik yedek yoktur. Önemli talepleri ara ara **Table Editor → sponsor_talepleri → Export** ile indirin.
- **Projeler:** Projelerin kendisi (ad, metin, ekip, fotoğraflar) hâlâ `assets/data/site.js` dosyasında. Veritabanından gelenler haberler, gelişmeler ve sponsorlar.

# Güvenli Bağlanma Merkezi — Yayına Alma (Cloudflare Pages)

Bu klasör (`site/`) tamamen statik bir sitedir: build adımı yoktur, olduğu gibi
yayınlanır. `edanurdagdeviren.com` domain'i Cloudflare'de olduğu için en kolay
yol **Cloudflare Pages**'tir (ücretsiz, otomatik SSL).

## Yöntem 1 — GitHub bağlantısıyla (önerilen)

Her `git push` sonrası site otomatik güncellenir.

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. GitHub hesabınızı bağlayın ve bu repoyu (`kilincfaruk/kilincfaruk`) seçin.
3. Ayarlar:
   - **Production branch:** `main` (site main'e merge edildikten sonra)
   - **Build command:** *(boş bırakın)*
   - **Build output directory:** `site`
4. **Save and Deploy** — site önce `*.pages.dev` adresinde yayınlanır.

## Yöntem 2 — Doğrudan yükleme (Git'siz)

1. **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. `site/` klasörünün **içeriğini** (index.html dahil) sürükleyip bırakın.

## Domain'i bağlama

1. Pages projesinde **Custom domains** → **Set up a custom domain**.
2. `edanurdagdeviren.com` yazın — domain zaten Cloudflare'de olduğundan DNS
   kaydı (CNAME) otomatik eklenir, onaylamanız yeterli.
3. İsterseniz `www.edanurdagdeviren.com`'u da ekleyin (yine otomatik).
4. SSL sertifikası birkaç dakika içinde kendiliğinden aktif olur.

> Not: Mevcut eski site hangi DNS kaydında yayındaysa (A/CNAME), Pages custom
> domain eklenirken Cloudflare bu kaydı yenisiyle değiştirmeyi önerir.

## İçerik güncelleme

- **WhatsApp numarası / Instagram:** `assets/site.js` dosyasının en üstündeki
  `CONTACT` bloğu. Tek yerden tüm butonlar güncellenir.
- **Galeri fotoğrafları:** `assets/img/` içindeki dosyaların yerine aynı
  isimle kendi fotoğraflarınızı koyun (merkezin gerçek fotoğrafları çekilince
  önerilir). Şu anki görseller Unsplash/Pexels lisanslı ücretsiz stok
  fotoğraflardır (ticari kullanım serbest, atıf gerekmez).
- **Metinler:** `index.html` içinde, bölüm başlıklarıyla işaretlenmiş halde.

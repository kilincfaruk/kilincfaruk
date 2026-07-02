# Flaş Testi — Nasıl Çalıştırılır

`index.html` tek dosyalık bir test sayfası: bu telefonun tarayıcıda flaşı (torch)
kontrol edip edemediğini kanıtlar.

## Neden HTTPS şart?
Tarayıcıda flaş, kamera erişimiyle (`getUserMedia` + `torch`) kontrol edilir ve bu
**yalnızca güvenli bağlamda** (HTTPS veya `localhost`) çalışır. `http://192.168...`
üzerinden **çalışmaz**. Ayrıca **iOS Safari torch API'sini desteklemez** — flaş testini
**Android Chrome**'da yap.

---

## Yol A — Vercel (kalıcı public HTTPS linki, önerilen)

Kendi bilgisayarında, repo kök dizininde:

```bash
npx vercel deploy prototype --yes
```

- İlk çalıştırmada tarayıcıda bir kez giriş yapmanı ister (GitHub ile olur).
- Sonra `https://...vercel.app` linki verir.
- Linki Android telefonunda Chrome'da aç → ekrana bir kez dokun → **kamera izni ver** → "Flaş AÇ".

## Yol B — Tamamen yerel, hesap yok

1. `prototype/` klasöründe bir sunucu başlat:
   ```bash
   python3 -m http.server 8000
   ```
2. Bilgisayarının yerel IP'sini öğren (ör. `192.168.1.20`).
3. Android telefonunda Chrome'da `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   sayfasını aç, kutuya `http://192.168.1.20:8000` yaz, **Enabled** yap, Chrome'u yeniden başlat.
   (Bu, o adresi "güvenli bağlam" sayar; aksi halde kamera açılmaz.)
4. Telefon ve bilgisayar **aynı WiFi'de** olmalı. Telefonda `http://192.168.1.20:8000` aç.

---

## Sayfada ne var
- **Flaş AÇ / KAPAT**, **Yanıp Sön** (strobe), ve flaş yoksa **Ekranı Beyaz Yak** yedeği.
- Üstte canlı tanılama: HTTPS güvenli bağlam mı, torch destekleniyor mu, cihaz iOS mu.

## Notlar
- Torch donanımsal olarak yavaş açılıp kapanır (~saniyede 1-2). Hızlı disko efekti flaşla
  değil, ekran rengiyle olur.
- Kamera iznini reddedersen flaş açılmaz.

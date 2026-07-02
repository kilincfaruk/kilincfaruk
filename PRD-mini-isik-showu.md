# PRD — Mini Telefon Işık Şovu (QR ile Senkron Işık Gösterisi)

> Küçük çaplı MVP. Referans: CUE Audio'nun stadyum "smartphone light show" teknolojisinin
> düşük maliyetli, uygulama gerektirmeyen, web tabanlı sürümü.

---

## 1. Özet

Seyirciler sahnedeki/ekrandaki bir **QR kodu** okutur, telefon tarayıcısında bir web sayfası
açılır, sayfa **ekran rengini ve (destekleniyorsa) flaşı** kontrol etmek için izin ister.
Merkezi bir sunucu tüm bağlı telefonlara **eş zamanlı komutlar** göndererek toplu bir ışık
gösterisi (renk dalgaları, yanıp sönme, yazı/desen) oluşturur.

**Uygulama indirme yok. Donanım yok. Sadece tarayıcı + WiFi/hücresel.**

### Küçük çaplı kapsam (bu MVP)
- Hedef kitle: **50–500 kişilik** salon etkinlikleri (düğün, konser, okul gösterisi, kurumsal lansman).
- Senkron yöntemi: **Sunucu tabanlı zamanlı komutlar (WebSocket)**. Ultrasonik "data-over-sound"
  *kapsam dışı* (v2'de değerlendirilir).
- Tek operatör, tek etkinlik, tek "oda" (event) aynı anda.

---

## 2. Problem & Amaç

Etkinliklerde toplu ışık efekti için LED bileklik / ışıklı kart dağıtmak pahalı, çöp üreten
ve lojistik olarak zor. Herkesin cebinde zaten bir ekran ve flaş var.

**Amaç:** Donanımsız, kurulumsuz, 5 dakikada devreye alınabilen web tabanlı bir senkron ışık
gösterisi aracı çıkarmak.

### Başarı Kriterleri (MVP)
| Metrik | Hedef |
|---|---|
| Katılım süresi (QR → ışık aktif) | < 15 sn |
| Eş zamanlılık (komut → ekran değişimi gecikmesi) | < 300 ms (aynı ağda) |
| Eş anlı bağlı telefon | ≥ 200 (test hedefi) |
| Uygulama indirme | 0 (yalnızca tarayıcı) |

---

## 3. Kullanıcı Rolleri

1. **Operatör** — Etkinliği oluşturur, QR'ı ekrana yansıtır, gösteriyi sahneden yönetir.
2. **Katılımcı (seyirci)** — QR okutur, izin verir, telefonu ışık pikseline dönüşür.

---

## 4. Kullanıcı Akışları

### Operatör
1. Panelde "Yeni Etkinlik" oluşturur → benzersiz `event_id` + QR üretilir.
2. QR'ı projeksiyona/ekrana yansıtır.
3. Kontrol panelinden efekt seçer (renk, yanıp sönme, dalga) ve **"Tetikle"** der.
4. Bağlı telefon sayısını canlı görür.

### Katılımcı
1. QR okutur → tarayıcıda etkinlik sayfası açılır.
2. "Işık gösterisine katıl" → ekran/flaş izni verir.
3. Telefon tam ekran renkli moda geçer, operatör komutlarıyla senkron değişir.
4. Sayfayı kapatınca izin ve bağlantı sona erer.

---

## 5. Fonksiyonel Gereksinimler

### Katılımcı istemcisi (telefon web sayfası)
- [ ] QR ile açılan mobil-öncelikli tam ekran sayfa (PWA gerekmez).
- [ ] Tek dokunuşla katılım + **Wake Lock** (ekran kapanmasın).
- [ ] Ekranı düz renkle doldurma (RGB komutu).
- [ ] Flaş/torch kontrolü — destekleniyorsa (bkz. Kısıt). Desteklenmiyorsa ekran parlaklığına düş.
- [ ] Sunucudan gelen komutu **< 300 ms** içinde uygula.
- [ ] Kopma/yeniden bağlanma (auto-reconnect).

### Operatör paneli
- [ ] Etkinlik oluştur / QR üret / QR'ı büyük göster.
- [ ] Canlı bağlı cihaz sayacı.
- [ ] Hazır efektler: **Düz renk**, **Yanıp sönme** (ayarlanabilir hız), **Renk dalgası**,
      **Rastgele parıltı**, **Kapat**.
- [ ] Anlık "Tetikle" ve basit zaman çizelgesi (opsiyonel, faz-2).

### Backend
- [ ] `event` oluşturma/yönetme (bellek içi veya hafif DB yeterli — Supabase uygun).
- [ ] WebSocket ile odaya (event) broadcast.
- [ ] Sunucu zaman damgası ile senkron tetikleme (`fireAt = now + buffer`).

---

## 6. Teknik Yaklaşım (öneri)

| Katman | Öneri |
|---|---|
| İstemci | Statik HTML/JS (Vanilla veya hafif framework), tam ekran Canvas/CSS |
| Gerçek zamanlı | WebSocket (native `ws` veya Supabase Realtime / Socket.IO) |
| Backend | Node.js küçük servis **veya** Supabase (Realtime + tablo) |
| QR | Sunucuda `event` URL'sinden QR üretimi |
| Senkron | Sunucu `fireAt` zaman damgası gönderir, istemciler o ana kadar bekler |

**Tarayıcı API'leri:** Screen Wake Lock, (deneysel) Torch via `ImageCapture`/`MediaStreamTrack`,
Fullscreen, `requestAnimationFrame`.

---

## 7. Kapsam Dışı (Bu MVP'de YOK)

- Ultrasonik / ses üzerinden senkron (WiFi'siz çalışma) — v2.
- Kamera ile QR desen oluşturma / tribün mozaiği koordinasyonu.
- Çoklu eş anlı etkinlik / çok kiracılı yönetim.
- Kullanıcı hesapları, ödeme, analitik dashboard.
- 10.000+ kişilik stadyum ölçeği ve ağ dayanıklılığı optimizasyonu.

---

## 8. Kısıtlar & Riskler

- **Flaş kontrolü tarayıcıda güvenilmez:** iOS Safari torch API'sini pratikte desteklemez.
  → **Birincil efekt ekran rengi olmalı**, flaş "nice-to-have".
- **Ağ tıkanması:** Çok sayıda telefon aynı WiFi'de → gecikme/kopma. Küçük çaplı hedefte
  (≤500) yönetilebilir; ölçek büyürse ultrasonik yaklaşım (v2) gerekir.
- **İzin/otomatik oynatma engelleri:** İlk kullanıcı etkileşimi (dokunuş) zorunlu.
- **Pil/ısınma:** Uzun gösteriler tam parlaklıkta pili hızlı tüketir → süre sınırı öner.
- **Gizlilik:** Sadece ekran/flaş kontrolü; konum, kişiler, kamera görüntüsü **saklanmaz**.
  Sayfa kapanınca erişim biter. (Referans üründeki gizlilik duruşuyla uyumlu.)

---

## 9. Yol Haritası

- **v0 (MVP):** Tek etkinlik, ekran rengi + 3-4 hazır efekt, WebSocket senkron, QR.
- **v1:** Flaş desteği (destekleyen cihazlarda), basit efekt zaman çizelgesi, reconnect iyileştirme.
- **v2:** Ultrasonik senkron (WiFi'siz), tribün/koltuk bazlı desen, çoklu etkinlik yönetimi.

---

## 10. Açık Sorular

1. Backend: sıfırdan Node servisi mi, yoksa **Supabase Realtime** mi? (Repo'da Supabase bağlı.)
2. İlk hedef etkinlik türü ne? (düğün / konser / kurumsal — UI tonunu belirler)
3. Flaş desteği v0'da denensin mi, yoksa doğrudan v1'e mi bırakılsın?

# 🤖 AI Ürün Ekibi (Claude Code Subagents)

Bu klasör, bir ürünü sıfırdan yayına taşıyacak sanal bir ekibi tanımlar. Her
`.md` dosyası bir ekip üyesidir (Claude Code "subagent"). Her dosyada üstte YAML
ayarları (isim, ne zaman çağrılacağı, kullanabileceği araçlar, model), altında o
kişinin sistem promptu (kişilik + görev) bulunur.

## Ekip

| Ajan | Rol | Ne zaman? |
|------|-----|-----------|
| **mike-team-lead** | Takım Lideri | Büyük/belirsiz işleri böler, ekibe dağıtır, sentezler |
| **iris-research** | Araştırma Uzmanı | Fikir aşaması: pazar trendi, rakip analizi, fizibilite |
| **ema-product-manager** | Ürün Yöneticisi | PRD, özellikler, kullanıcı akışı, MVP, yol haritası |
| **bob-system-architect** | Sistem Mimarı | Teknoloji seçimi, DB şeması, uygulama iskeleti |
| **alex-developer** | Yazılım Geliştirici | Kodlama, frontend/backend, bug fix |
| **david-data-analyst** | Veri Analisti | Yayın sonrası davranış analizi, büyüme |
| **sara-seo-expert** | SEO Uzmanı | SEO stratejisi, içerik/makale üretimi |
| **adrian-google-ads** | Google Ads Uzmanı | Reklam kampanyaları, pazar araştırması |

## Nasıl kullanılır?

### 1. Otomatik delegasyon
Sadece normal isteğini yaz; Claude görevin tanımına bakıp doğru ajanı kendisi
seçer:
> "Bu hatayı düzelt" → **Alex** devreye girer
> "Bu fikir tutar mı, rakipler kim?" → **Iris** devreye girer

### 2. Belirli birini çağırma
İsmini söyleyerek doğrudan bir uzmanı çalıştırabilirsin:
> "ema-product-manager ile bu uygulama için PRD çıkar"
> "bob ile veritabanı şemasını tasarla"

### 3. Tüm ekibi orkestrasyonla (önerilen)
Büyük işlerde Mike'a ver, o dağıtsın:
> "mike, restoran operasyonları için bir SaaS fikrim var. Ekibi topla:
>  Iris fizibiliteyi baksın, EMA PRD çıkarsın, Bob mimariyi kursun."

### Tipik akış (zero-to-one)
```
Iris (fizibilite) → EMA (PRD) → Bob (mimari + şema) → Alex (kod)
                                   → Sara (SEO) + Adrian (reklam) + David (analitik)
```

## Yönetim

- **Listele/düzenle:** Claude Code içinde `/agents` komutu.
- **Bu repoya özel:** Buradaki ajanlar bu projede geçerlidir (proje-kapsamlı).
- **Her projede kullanmak için:** Bu dosyaları `~/.claude/agents/` altına
  kopyala → tüm projelerde küresel olarak erişilebilir olur.
- **Yeni üye eklemek:** Aynı formatta yeni bir `.md` dosyası oluştur.
- **Model:** Hepsi `opus` ile çalışacak şekilde ayarlı; hız/maliyet için bazı
  üyeleri (örn. SEO/içerik) `sonnet`'e çekebilirsin.

# WortWeg Private Alpha Metadata Draft

This is internal draft copy for a future private alpha listing or tester invitation. It is not public launch copy.

Do not publish this copy until the phone smoke test passes and the backend/testing setup is ready.

## 1. One-Line Description

Option 1:

```text
Türkçe açıklamalarla Almanca öğrenmek için kısa dersler, tekrarlar ve konuşma pratiği.
```

Option 2:

```text
A0-A2 Almanca yolculuğu için Türkçe rehberli dersler, kelime tekrarı ve AI destekli pratik.
```

Option 3:

```text
WortWeg, Türkçe konuşanlar için Almanca ders, tekrar ve konuşma pratiği uygulamasıdır.
```

## 2. Short Description

```text
WortWeg, Türkçe açıklamalarla Almanca çalışmak isteyenler için hazırlanmış özel alpha sürümüdür. A0/A1/A2 seviyelerinde kısa dersler, kelime tekrarı, hata tekrarı, konuşma pratiği, AI destekli pratik ve sınav tarzı pratik akışlarını deneyebilirsin. B1 için kısa bir ön izleme vardır; tam B1/B2 yolları yakında.
```

## 3. Longer Private-Alpha Description

```text
WortWeg, Türkçe konuşan Almanca öğrenenler için tasarlanmış bir öğrenme uygulamasıdır. Amaç, kısa ve anlaşılır derslerle Almanca temelini kurmak; kelime, hata, konuşma ve pratik akışlarını tek yerde toplamaktır.

Bu özel alpha sürümünde A0, A1 ve A2 ders yolları oynanabilir durumdadır. Toplam 36 ders, 288 alıştırma ve 288 kelime öğesi bulunur. Ayrıca B1 için sınırlı ve isteğe bağlı bir “B1 Ön İzleme” alanı vardır. Bu alan tam B1 yolu değildir; tam B1/B2 yolları daha sonra hazırlanacaktır.

Test edilebilecek ana bölümler: onboarding, seviye yönlendirme, dersler, Kelime tekrarı, Hatalar tekrarı, Konuşma Pratiği, AI ile pratik, Sınav tarzı pratik ve B1 Ön İzleme.

Konuşma pratiği, söylediğin cümleyi hedef cümleyle karşılaştırarak anlaşılır geri bildirim verir. Bu sürümde geri bildirim transkript temellidir; seslerin tek tek telaffuzunu ölçen gelişmiş fonem düzeyi değerlendirme henüz yoktur. AI ve konuşma özellikleri güvenli bir backend üzerinden çalışacak şekilde tasarlanmıştır; teknik sağlayıcı ayrıntıları kullanıcı arayüzünde gösterilmez.

Bu sürüm özel alpha içindir. Bazı akışlar, görseller ve backend kurulumu final sürümden önce değişebilir. Lütfen karışık gelen ekranları, işe yarayan veya eksik kalan Türkçe açıklamaları ve pratik akışlarını geri bildirim olarak paylaş.
```

## 4. What Testers Should Try

Tester checklist:

- onboarding akışını tamamla
- bir A0 dersi aç ve birkaç alıştırma çöz
- bir A1 dersi aç ve birkaç alıştırma çöz
- bir A2 dersi aç ve birkaç alıştırma çöz
- Kelime review akışını dene
- Hatalar review akışını dene
- Konuşma Pratiği alanından bir cümle seç
- AI ile pratik ekranında kısa bir soru sor
- Sınav tarzı pratik ekranını dene
- isteğe bağlı B1 Ön İzleme derslerinden birini aç

## 5. Known Limitations

- Bu sürüm private alpha aşamasındadır; final release değildir.
- Backend phone smoke ve hosted deployment hazır olmadan dış test başlamamalıdır.
- Tam B1/B2 yolları hazır değildir.
- B1 alanı yalnızca sınırlı, isteğe bağlı ön izlemedir.
- Wolli final maskot asset'i hazır değildir.
- Konuşma geri bildirimi transkript temellidir; fonem düzeyi telaffuz değerlendirmesi değildir.
- Azure pronunciation assessment uygulanmamıştır.
- Uygulama hiçbir resmi sınav kurumu ile bağlı veya onaylı değildir.
- Genel yayın / public launch copy'si ayrıca hazırlanmalıdır.

## 6. Privacy Wording

Draft Turkish privacy-friendly wording:

```text
WortWeg, AI ve konuşma pratiği için gerekli işlemleri güvenli backend üzerinden çalıştıracak şekilde tasarlanır. API anahtarları mobil uygulamanın içinde tutulmaz. Konuşma pratiğinde ses, pratik geri bildirimi üretmek için kullanılır. Kullanıcı arayüzünde teknik sağlayıcı, model veya endpoint ayrıntıları gösterilmez. WortWeg’de public leaderboard veya sosyal sıralama yoktur.
```

Shorter variant:

```text
AI ve konuşma özellikleri için gerekli teknik anahtarlar uygulamanın içinde yer almaz. Konuşma pratiği, geri bildirim üretmek için kullanılır; public leaderboard veya sosyal sıralama yoktur.
```

## 7. Feedback Questions For Testers

- Hangi ekran karışıktı?
- Hangi Türkçe açıklama işe yaradı?
- Hangi Türkçe açıklama işe yaramadı?
- Konuşma pratiği anlaşılır mı?
- Konuşma geri bildirimi sana ne yapacağını söylüyor mu?
- Kelime tekrar akışı faydalı mı?
- Hatalar tekrar akışı faydalı mı?
- AI ile pratik ekranı hangi konuda yardımcı oldu?
- Sınav tarzı pratik net ve güvenli hissettiriyor mu?
- B1 Ön İzleme beklentiyi doğru anlatıyor mu?
- B1 Ön İzleme tam B1 yolu gibi mi görünüyor, yoksa sınırlı ön izleme olduğu açık mı?
- Bir sonraki en önemli özellik ne olmalı?

## 8. Store/Compliance Guardrails

Do not use public or tester-facing copy that claims:

- official Goethe/telc/ÖSD affiliation, approval, certification, or guarantee
- full B1/B2 path availability
- medical, immigration, visa, job, school admission, or legal guarantee
- “fluent fast” or guaranteed fluency in a short time
- child-directed product positioning unless reviewed separately
- public launch readiness before backend and phone smoke are ready
- advanced phoneme-level pronunciation scoring before it exists
- Azure-backed scoring before Azure is implemented and reviewed
- social leaderboard or public ranking

Safe wording:

- “sınav tarzı pratik”
- “B1 Ön İzleme”
- “tam B1/B2 yolları yakında”
- “özel alpha”
- “transkript temelli konuşma geri bildirimi”

## 9. Next Prompt Title

Create private alpha tester guide after phone smoke passes.

# WortWeg Private Alpha Tester Guide Draft

This is an older tester guide draft. For the current Android APK distribution process, use `docs/private-alpha-tester-distribution.md` and `docs/private-alpha-tester-message.md`.

## 1. Status Notice

- This guide is a draft.
- Do not send this guide directly to testers; use the current tester message draft instead.
- Hosted backend smoke, phone hosted AI/speech smoke, and installed Android APK smoke have passed.
- The APK link, feedback channel, support owner, and selected tester group must still be confirmed before sending.
- No public launch is implied.
- No app store account, tester invite, or external distribution has been created from this document.

## 2. Who This Alpha Is For

WortWeg private alpha is for Turkish speakers learning German who want:

- beginner-friendly German practice
- A0/A1/A2 lessons
- Turkish explanations
- vocabulary review
- mistake review
- speaking practice
- AI-supported practice
- short, practical study sessions

This alpha is not an official exam preparation guarantee. Full B1/B2 paths are not available yet.

## 3. What You Can Test

You can test:

- onboarding
- placement flow
- A0/A1/A2 lessons
- optional B1 Ön İzleme
- Kelime review
- Hatalar review
- Konuşma Pratiği
- AI ile pratik
- Sınav tarzı pratik
- review dashboard

Current content scope:

- 36 lessons
- 288 exercises
- 288 vocabulary items
- optional limited B1 preview with 8 lessons

## 4. What Is Not Ready Yet

Not ready yet:

- full B1 path
- full B2 path
- final Wolli mascot art
- iOS/TestFlight build
- phoneme-level pronunciation scoring
- Azure pronunciation assessment
- official exam affiliation
- public launch

## 5. How To Test

Lütfen test ederken şu adımları dene:

1. Uygulamayı aç.
2. Onboarding akışını tamamla.
3. Seviyeni dürüstçe seç veya seviye kontrolünü dene.
4. Bir kısa A0, A1 veya A2 dersi aç.
5. En az birkaç alıştırma çöz.
6. Bilerek bir yanlış cevap ver.
7. Hatalar ekranını kontrol et.
8. Kelime tekrarını dene.
9. Konuşma Pratiği ekranında bir cümle seç ve söyle.
10. AI ile pratik ekranında kısa bir soru sor.
11. Sınav tarzı pratik ekranını dene.
12. İstersen B1 Ön İzleme alanından bir ders aç.

Test ederken şunlara dikkat et:

- Ekranlar anlaşılır mı?
- Türkçe açıklamalar yardımcı oluyor mu?
- Butonlar ve yönlendirmeler net mi?
- Konuşma pratiği seni rahat yönlendiriyor mu?
- B1 Ön İzleme alanının sınırlı olduğu açık mı?

## 6. Feedback Questions

Lütfen geri bildirim verirken şu soruları düşünebilirsin:

- İlk açılış anlaşılır mı?
- Türkçe açıklamalar yeterli mi?
- Hangi ekranda kayboldun?
- Kelime tekrarı faydalı mı?
- Hatalar ekranı işe yarıyor mu?
- Konuşma pratiği korkutucu mu, kolay mı?
- AI cevapları faydalı mı?
- B1 Ön İzleme beklentiyi doğru anlatıyor mu?
- Sınav tarzı pratik açıklayıcı mı?
- Bir sonraki en önemli özellik ne olmalı?

## 7. Bug Report Template

Bir hata görürsen, mümkünse şu bilgileri paylaş:

```text
Telefon modeli:
iOS/Android sürümü:
Ne yapmak istedin?
Ne oldu?
Ne olmasını beklerdin?
Ekran görüntüsü/video var mı?
İnternet bağlantısı:
Yaklaşık saat:
```

Özel veya hassas kişisel bilgileri paylaşmana gerek yok.

## 8. Privacy Note For Testers

- AI sohbetine özel veya hassas kişisel bilgi yazma.
- Konuşma pratiği, pratik geri bildirimi üretmek içindir.
- Hassas kişisel veri girme.
- WortWeg'de public leaderboard veya sosyal sıralama yoktur.
- Alpha sürümde hatalar olabilir.
- Teknik sağlayıcı ayrıntıları kullanıcı arayüzünde gösterilmez.

## 9. Known Limitations

- Bu sürüm local/private alpha kalitesindedir.
- Backend test sırasında bazen kullanılamayabilir.
- Konuşma pratiği gürültülü ortamlarda başarısız olabilir.
- Tam B1/B2 yolları yakında.
- B1 yalnızca sınırlı Ön İzleme alanıdır.
- Bazı görseller ve Wolli maskotu placeholder olabilir.
- Konuşma geri bildirimi transkript temellidir; fonem düzeyi telaffuz değerlendirmesi değildir.
- Azure pronunciation assessment uygulanmamıştır.
- Resmi sınav kurumu bağlantısı veya onayı yoktur.

## 10. Internal Release Checklist Before Sending

Testerlarla paylaşmadan önce içeride şunlar tamamlanmalı:

- Android installed APK smoke passed
- hosted backend smoke passed
- approved APK link selected
- feedback channel selected
- support owner selected
- privacy wording reviewed
- feedback collection method decided
- support/contact channel decided
- `git status --short` clean
- `npm run quality` passed

Do not send if any required release path is still unclear.

## 11. Non-Goals

- no public launch
- no official certification claim
- no guaranteed exam success
- no production rollout
- no full B1/B2 availability claim
- no Azure claim
- no social ranking claim

## 12. Next Prompt Title

Finalize private alpha tester guide after phone smoke passes.

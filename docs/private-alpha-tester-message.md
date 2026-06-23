# WortWeg Private Alpha Tester Message

This is a copy-paste Turkish message draft for a small Android private alpha group. Replace placeholders before sending. Do not include secrets, API keys, or public launch claims.

## Copy-Paste Message

```text
Merhaba! WortWeg'in özel Android alpha sürümünü test etmek ister misin?

WortWeg, Türkçe açıklamalarla Almanca çalışmak için hazırladığım erken test sürümü. Bu public launch değil; sadece birkaç kişiden gerçek telefon geri bildirimi almak istiyorum.

APK indirme linki:
APK_LINK_HERE

Kurulum:
1. Linki Android telefonda aç.
2. APK dosyasını indir.
3. Android izin isterse bu kaynak üzerinden kurulum izni ver.
4. Uygulamayı aç.
5. Konuşma pratiğini denemek istersen mikrofon izni ver.

Lütfen özellikle şunları dene:
- Onboarding'i tamamla.
- Bir A0/A1/A2 dersi aç ve birkaç alıştırma çöz.
- Bilerek bir yanlış cevap ver, sonra Hatalar ekranını kontrol et.
- Kelime tekrarı ekranını dene.
- Konuşma Pratiği'nde bir cümle seçip söyle.
- Sessiz kalınca 100 puan vermediğini kontrol et.
- AI ile pratik ekranında kısa bir Türkçe soru sor.
- Sınav tarzı pratik ekranını dene.
- İstersen B1 Ön İzleme alanına bak; bu tam B1 yolu değil, sadece kısa ve sınırlı ön izleme.

Bilmen gerekenler:
- Bu sürüm final değil, hatalar olabilir.
- Tam B1/B2 yolları henüz hazır değil.
- iOS/TestFlight sürümü yok.
- Uygulama resmi Goethe/telc/OeSD bağlantısı veya sınav garantisi sunmuyor.
- Konuşma puanı şu an transkript temelli: doğru kelimeleri kontrol ediyor, ama aksan/akıcılık/fonem düzeyi telaffuz puanı vermiyor. Yavaş ama doğru söylenen cümle 100 alabilir.
- Azure telaffuz değerlendirmesi henüz yok.
- İkon/splash görselleri geçici alpha görselleri.

Geri bildirim kanalı:
FEEDBACK_CHANNEL_HERE

Hata bildirirken mümkünse şunları yaz:
- Telefon modeli:
- Android sürümü:
- Ne yapmak istedin?
- Ne oldu?
- Ne olmasını beklerdin?
- Hangi ekrandaydın?
- İnternet Wi-Fi mı mobil veri mi?
- Yaklaşık saat:
- Ekran görüntüsü veya kısa video var mı?

Lütfen şifre, API anahtarı, kimlik/pasaport, adres, ödeme bilgisi veya hassas kişisel bilgi gönderme. APK linkini de public olarak paylaşma.

Teşekkürler! En çok şunu bilmek istiyorum: Nerede takıldın, hangi açıklama işe yaradı, hangi özellik en faydalı geldi?
```

## Alpha 0.4.0 Güncelleme Notu (Özel Test)

- **Wolli artık hatalarını daha bağlamlı açıklayabilir.** Hatalar ve Zayıf Nokta Pratiği ekranlarından “Wolli’ye sor” ile ilgili soruyu otomatik hazırlanmış metinle sohbete taşıyabilirsin.
- **Ders bitince Wolli’den özet isteyebilirsin.** Ders tamamlandıktan sonra Wolli’ye o dersin kısa özetini ve örneklerini sorabilirsin.
- **Kelime tekrarında Wolli desteği eklendi.** Cevabı gösterdikten sonra “Wolli’ye sor” ile kelimenin artikelini, anlamını ve örnek cümlelerini sorabilirsin.

---

## Alpha 0.3.0 Güncelleme Notu (Özel Test)

- **Dersler artık kaldığın yeri hatırlar.** Dersi yarıda bırakırsan aynı derse döndüğünde “Kaldığın yerden devam et” seçeneği görünür.
- **Zayıf Nokta Pratiği eklendi.** Hatalar ekranından son yanlışlarını kısa bir pratikle tekrar edebilirsin.
- **Ana sayfaya “Son Çalışmalar” eklendi.** Son ders, konuşma pratiği, sınav veya Wolli kullanımın güvenli özet olarak görünür.

---

## Alpha 0.2.0 Güncelleme Notu (Özel Test)

Bu sürümde tester geri bildirimlerine göre aşağıdaki iyileştirmeler yapıldı:

- **Ana sayfada 'Bugünkü çalışma planı' eklendi.** Ders, kelime, konuşma, Wolli ve sınav adımları daha net bir sırayla görünür.
- **Ders bitince 'Şimdi ne yapalım?' adımı eklendi.** Kelime, konuşma, Wolli ve sınav seçenekleri daha kolay bulunur.
- **AI sohbet ve sesli pratik artık "Pratik" sekmesi altında birlikte bulunur.** Alt menüdeki "Pratik" sekmesine tıklayınca "Wolli ile yazış" ve "Sesli pratik yap" seçenekleri çıkar.
- **Klavye açılınca alt navigation gizlenir.** AI sohbeti veya Sınav ekranında klavye açıkken artık alt menü ekranı sıkıştırmaz.
- **Sınav ekranı daha rahat kullanılır.** Cevap butonu artık sayfanın akışı içinde; çift buton çakışması gitti.
- **Sınav bekleme butonu "Kontrol ediliyor…" yazar.** Cevap gönderildikten sonra yükleniyor simgesi yerine açık Türkçe metin görünür.
- **AI/konuşma sorunlarında test bilgileri daha yardımcı olur.** Bağlantı hatası olursa Profil ekranındaki log daha fazla ayrıntı içerir (hata türü, süre). Hiçbir mesaj, transkript veya kişisel veri kaydedilmez.
- **Çoktan seçmeli Sınav cevapları daha hızlı kontrol edilir.** Cevap artık anında değerlendirilir; açıklamalar önceden hazır olduğundan bekleme yoktur.
- **AI ve Sınav bekleme animasyonları daha tutarlı hale getirildi.** Yükleniyor göstergesi artık senkronize üç nokta olarak görünür.
- **Android alt navigation alanı için ekran boşlukları iyileştirildi.** Sınav ve AI sohbet ekranlarında içerik, Android sistem navigasyon çubuğuyla çakışmaz.

Bu sürümde değişmeyen şeyler: ders içeriği, AI promptları, konuşma puanlaması, B1/B2 yolları, backend davranışı.

Bu özel alpha testidir. Public sürüm, Play Store veya iOS/TestFlight hazırlığı yoktur.

---

## Before Sending

- Replace `APK_LINK_HERE`.
- Replace `FEEDBACK_CHANNEL_HERE`.
- Confirm the APK is the latest smoke-passed Android preview build.
- Confirm `npm run quality` passed after the latest changes.
- Confirm hosted AI/speech still work.
- Send only to the selected private tester group.

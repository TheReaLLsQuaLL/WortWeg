# WortWeg Private Alpha Test Kontrol Listesi

Bu liste 3-5 kişilik özel alpha testi içindir. Kısa tut: akış bozuluyor mu, metinler anlaşılır mı, telefon ekranında rahat mı?

## Başlamadan

- Telefon ve bilgisayar aynı Wi-Fi ağında olsun.
- Geliştirici backend'i ve Expo'yu başlatmış olsun.
- API anahtarlarını, terminaldeki gizli değerleri veya .env içeriğini paylaşma.

## Test Et

1. Uygulamayı sıfırla: Profil -> Geliştirici: Uygulama verisini sıfırla.
2. Onboarding'i yerleştirme testi olmadan bitir.
3. Home ekranına geldiğini kontrol et.
4. Expo Go'yu tamamen kapatıp yeniden aç. Home gelmeli, onboarding değil.
5. Tekrar sıfırla, bu kez seviye kontrolünü yap.
6. Önerilen seviyeyi seç ve Home'a geldiğini kontrol et.
7. Home'dan A0.1 dersini aç.
8. Bir soruyu yanlış cevapla; açıklama anlaşılır mı kontrol et.
9. Dersi bitir; XP ve ilerleme görünüyor mu kontrol et.
10. Kelime tekrarını aç.
11. Hatalarım bölümünü aç.
12. Yol haritasında A0/A1 derslerini açmayı dene.
13. A0/A1/A2 dersleri açılıyor mu, B1'de yalnızca “B1 Ön İzleme” görünüyor mu, tam B1/B2 modüllerinde yakında mesajı görünüyor mu kontrol et.
14. Wolli chat'e kısa bir A1 mesaj yaz.
15. Sesli pratikte mikrofon butonuna basılı tut, Almanca cümleyi söyle, bırak ve dinle.
16. Bırakınca analiz animasyonu başlıyor mu kontrol et.
17. Sonuçta şunları kontrol et: Beklenen cümle, Söylediğin cümle, Hedefe yakınlık, Pratik geri bildirimi.
18. Profil'den alpha test günlüğünü dışa aktar.

## iPhone Ses Testinden Önce

- Mac'te `ipconfig getifaddr en0` ile güncel LAN IP'yi bul, sonra iPhone Safari ile http://YOUR_MAC_LAN_IP:3001/health adresini aç.
- Açılmıyorsa aynı Wi-Fi, firewall veya Mac LAN IP ayarı sorunludur. Önce bunu düzelt.
- Backend IP değiştiyse .env içindeki EXPO_PUBLIC_AI_BACKEND_URL değerini güncelle ve Expo uygulamasını temiz önbellekle yeniden başlat.

## iOS Kontrolü

- Üstteki ilerleme alanı Dynamic Island veya çentikle çakışmıyor.
- Onboarding'de tek ilerleme göstergesi var; çift bar yok.
- Alttaki ana buton home indicator üstünde kalıyor.
- Kartlar küçük ekranda kesilmiyor, gerekirse kaydırılıyor.
- Mikrofon izni çıkıyor; basılı tut, bırak, dinle ve transcript çalışıyor.
- Bırakınca analiz animasyonu görünüyor.
- Sonuç ekranında mock/provider/fallback/model gibi geliştirici metinleri görünmüyor.
- Şu ekran görüntülerini iste: onboarding karşılama, onboarding soru ekranı, plan hazır, kayıt anı, analiz yükleniyor, konuşma sonucu.

## Android Kontrolü

- Status bar ve alttaki sistem navigasyonu UI ile çakışmıyor.
- Onboarding Home'a gidiyor; uygulamayı kapatıp açınca yine Home geliyor.
- A0.1 dersi, yanlış cevap açıklaması ve ders bitiş butonları çalışıyor.
- Sesli pratikte basılı tut, bırak, dinle ve transcript çalışıyor.

## Bilinen Alpha Kurtarma Adımları

- Ses analizi çalışmazsa Mac'te `ipconfig getifaddr en0` ile güncel IP'yi kontrol et, sonra telefondan http://YOUR_MAC_LAN_IP:3001/health adresini açmayı dene. Açılmıyorsa telefon ve bilgisayar aynı Wi-Fi ağında olmayabilir.
- Uygulama yeniden açıldığında onboarding tekrar gelirse Profil -> Geliştirici sıfırlama yap, akışı tekrar tamamla ve bunu geri bildirimde belirt.
- Analiz ekranı takılı kalırsa tekrar dene ve mümkünse DEV ortamındaki Speech debug panelinin ekran görüntüsünü gönder.
- Backend IP değiştiyse .env içindeki EXPO_PUBLIC_AI_BACKEND_URL değerini yeni LAN IP ile güncelle ve Expo uygulamasını temiz önbellekle yeniden başlat.
- Ses analizinde hata görürsen backend terminalinde /speech/transcribe isteği görünüyor mu kontrol et.

## Geri Bildirim Gönder

- Profil -> Test bilgilerini kopyala ile kısa rapor şablonunu al.
- Profil -> Alpha logunu dışa aktar ile yerel test günlüğünü al.
- Telefon modeli ve işletim sistemi.
- Hangi adımda kaldın?
- Ne bekliyordun, ne oldu?
- Ekran görüntüsü veya kısa video.
- Profil'den dışa aktarılan alpha test günlüğü.
- API anahtarı, .env ekran görüntüsü, terminal sırrı veya kişisel bilgi paylaşma.

## Bilinen Sınırlar

- A0/A1/A2 dersleri oynanabilir. B1'de yalnızca kısa “B1 Ön İzleme” vardır; tam B1/B2 yolu yakında olarak görünür.
- Ses yazıya çevirme backend ve OpenAI API kotasına bağlıdır.
- Konuşma geri bildirimi gerçek fonetik telaffuz puanı değildir; hedef cümle ile transcript karşılaştırmasına dayanır.
- Hesap, bulut senkronizasyonu ve Supabase henüz yok.
- Test şu an Expo Go/dev ortamı içindir.

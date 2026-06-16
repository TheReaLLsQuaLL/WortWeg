import type { Choice } from '../types/exercise';

export type ExamSection = 'reading' | 'listening' | 'writing' | 'speaking';

export type ExamQuestion = {
  id: string;
  section: ExamSection;
  cefrLevel: 'A1';
  title: string;
  promptTr: string;
  text?: string;
  questionTr: string;
  options?: string[];
  choices?: Choice[];
  correctAnswer?: string;
  correctChoiceId?: string;
  expectedText?: string;
  sampleAnswer?: string;
  explanationTr: string;
  xp: number;
};

export const examA1Questions: ExamQuestion[] = [
  {
    id: 'exam-a1-reading-1',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Kısa mesaj',
    promptTr: 'Metni oku ve doğru cevabı seç.',
    text:
      'Hallo Mert, ich bin heute im Deutschkurs. Danach kaufe ich Brot und Wasser. Um 18 Uhr bin ich zu Hause. Viele Grüße, Lina',
    questionTr: 'Lina kurstan sonra ne alıyor?',
    options: ['Brot und Wasser', 'Kaffee und Tee', 'Ein Buch', 'Eine Lampe'],
    correctAnswer: 'Brot und Wasser',
    explanationTr:
      'Metinde "Danach kaufe ich Brot und Wasser" yazıyor. Yani kurstan sonra ekmek ve su alıyor.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-2',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Duyuru',
    promptTr: 'Duyuruyu oku ve doğru cevabı seç.',
    text:
      'Deutschclub A1: Wir treffen uns am Montag um 17 Uhr im Raum 3. Bitte bringt ein Heft und einen Stift mit.',
    questionTr: 'Katılımcılar ne getirmeli?',
    options: ['Defter ve kalem', 'Kahve', 'Pasaport', 'Telefon'],
    correctAnswer: 'Defter ve kalem',
    explanationTr:
      '"ein Heft und einen Stift" defter ve kalem anlamına gelir.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-3',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Kısa not',
    promptTr: 'Metni oku ve doğru cevabı seç.',
    text: 'Liebe Anna, ich komme am Montag um 9 Uhr nach Berlin. Bis bald! - Maria',
    questionTr: 'Maria ne zaman geliyor?',
    options: ["Pazartesi saat 9'da", 'Salı akşamı', 'Pazar sabahı', "Cuma saat 9'da"],
    correctAnswer: "Pazartesi saat 9'da",
    explanationTr:
      '"am Montag" pazartesi günü, "um 9 Uhr" saat 9’da demektir.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-4',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Tabela',
    promptTr: 'Tabelayı oku ve doğru cevabı seç.',
    text: 'Geöffnet: Mo-Fr 8-18 Uhr. Samstag und Sonntag geschlossen.',
    questionTr: 'Mağaza cumartesi açık mı?',
    options: ['Hayır, kapalı', 'Evet, açık', 'Sadece sabah açık', 'Sadece öğleden sonra açık'],
    correctAnswer: 'Hayır, kapalı',
    explanationTr:
      '"geschlossen" kapalı demektir. Cumartesi ve pazar kapalı yazıyor.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-5',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Buluşma mesajı',
    promptTr: 'Mesajı oku ve doğru cevabı seç.',
    text: 'Hallo Tom, das Kino beginnt um 20 Uhr. Wir treffen uns um 19.30 am Eingang. - Lisa',
    questionTr: 'Lisa ve Tom saat kaçta buluşuyor?',
    options: ["19.30'da", "20.00'de", "18.30'da", "21.00'de"],
    correctAnswer: "19.30'da",
    explanationTr:
      'Film 20.00’de başlıyor ama "wir treffen uns" yani buluşma 19.30’da.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-6',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'İlan',
    promptTr: 'İlanı oku ve doğru cevabı seç.',
    text: 'Zimmer frei: 2 Zimmer, Küche, Bad. 450 Euro pro Monat. Tel: 030-1234',
    questionTr: 'Bu ilan ne hakkında?',
    options: ['Kiralık daire', 'Satılık araba', 'İş ilanı', 'Ders ilanı'],
    correctAnswer: 'Kiralık daire',
    explanationTr:
      '"Zimmer frei" boş oda/daire, "pro Monat" aylık anlamına gelir.',
    xp: 12,
  },
  {
    id: 'exam-a1-reading-7',
    section: 'reading',
    cefrLevel: 'A1',
    title: 'Randevu',
    promptTr: 'Mesajı oku ve doğru cevabı seç.',
    text: 'Lieber Herr Schmidt, der Termin am Freitag fällt aus. Neuer Termin: Dienstag, 10 Uhr.',
    questionTr: 'Cuma günkü randevuya ne oldu?',
    options: ['İptal edildi', 'Öne alındı', 'Aynı gün kaldı', 'Cumartesiye alındı'],
    correctAnswer: 'İptal edildi',
    explanationTr:
      '"fällt aus" iptal oldu anlamına gelir. Yeni randevu salı saat 10.',
    xp: 12,
  },
  {
    id: 'exam-a1-listening-1',
    section: 'listening',
    cefrLevel: 'A1',
    title: 'Telefon notu',
    promptTr: 'Cümleyi dinle ve doğru cevabı seç.',
    text:
      'Hallo, ich heiße Nora. Ich komme aus Köln und wohne jetzt in München.',
    questionTr: 'Nora şimdi nerede yaşıyor?',
    options: ['Münih', 'Köln', 'Berlin', 'Hamburg'],
    correctAnswer: 'Münih',
    explanationTr:
      'Dinleme metninde "wohne jetzt in München" deniyor. "München" Türkçede Münih.',
    xp: 12,
  },
  {
    id: 'exam-a1-writing-1',
    section: 'writing',
    cefrLevel: 'A1',
    title: 'Kısa tanıtım',
    promptTr:
      '3-4 Almanca cümle yaz: adın, nereden geldiğin, nerede yaşadığın ve ne öğrendiğin.',
    questionTr: 'Kendini Almanca kısaca tanıt.',
    sampleAnswer:
      'Ich heiße Selin. Ich komme aus der Türkei. Ich wohne in Berlin. Ich lerne Deutsch.',
    explanationTr:
      'A1 seviyesinde kısa, doğru ve net cümleler yeterlidir. Bu bölüm şu an mock AI ile değerlendirilir.',
    xp: 15,
  },
  {
    id: 'exam-a1-speaking-1',
    section: 'speaking',
    cefrLevel: 'A1',
    title: 'Sesli tekrar',
    promptTr: 'Cümleyi sesli oku. Şimdilik telaffuz puanı mock döner.',
    questionTr: 'Aşağıdaki cümleyi söyle.',
    expectedText: 'Ich lerne Deutsch jeden Tag.',
    explanationTr:
      'Gerçek telaffuz puanlama daha sonra Azure Pronunciation Assessment ile bağlanacak.',
    xp: 15,
  },
];

export const getExamQuestionById = (questionId: string) =>
  examA1Questions.find((question) => question.id === questionId);

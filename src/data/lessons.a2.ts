import type { Lesson } from '../types/lesson';
import {
  articleExercise,
  buildExercise,
  choiceExercise,
  grammarTip,
  makeLesson,
  textExercise,
} from './lessonFactory';

type A2ExerciseSeed = {
  lessonId: string;
  vocab: { question: string; correct: string; distractors: string[]; explanation: string };
  fill: { question: string; correct: string; distractors: string[]; explanation: string };
  article: { question: string; article: 'der' | 'die' | 'das'; explanation: string };
  deTr: { question: string; correct: string; distractors: string[]; explanation: string };
  trDe: { question: string; correct: string; accepted?: string[]; explanation: string };
  build: { question: string; correct: string; words: string[]; explanation: string; speechText?: string };
  listening: { question: string; correct: string; distractors: string[]; explanation: string; speechText: string };
  grammar: { question: string; correct: string; distractors: string[]; explanation: string; prompt?: string };
};

const a2Exercises = (seed: A2ExerciseSeed) => [
  choiceExercise({ id: 'ex-' + seed.lessonId + '-01', lessonId: seed.lessonId, prompt: 'Doğru anlamı seç.', question: seed.vocab.question, correct: seed.vocab.correct, distractors: seed.vocab.distractors, explanation: seed.vocab.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-02', lessonId: seed.lessonId, type: 'fillBlank', skill: 'grammar', prompt: 'Boşluğu tamamla.', question: seed.fill.question, correct: seed.fill.correct, distractors: seed.fill.distractors, explanation: seed.fill.explanation }),
  articleExercise({ id: 'ex-' + seed.lessonId + '-03', lessonId: seed.lessonId, question: seed.article.question, article: seed.article.article, explanation: seed.article.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-04', lessonId: seed.lessonId, skill: 'reading', prompt: 'Almancayı Türkçeye çevir.', question: seed.deTr.question, correct: seed.deTr.correct, distractors: seed.deTr.distractors, explanation: seed.deTr.explanation }),
  textExercise({ id: 'ex-' + seed.lessonId + '-05', lessonId: seed.lessonId, prompt: 'Almancaya çevir.', question: seed.trDe.question, correct: seed.trDe.correct, accepted: seed.trDe.accepted, explanation: seed.trDe.explanation }),
  buildExercise({ id: 'ex-' + seed.lessonId + '-06', lessonId: seed.lessonId, prompt: 'Kelime sırasını kur.', question: seed.build.question, correct: seed.build.correct, words: seed.build.words, explanation: seed.build.explanation, speechText: seed.build.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-07', lessonId: seed.lessonId, type: 'listening', skill: 'listening', prompt: 'Dinleme tarzı metin: doğru bilgiyi seç.', question: seed.listening.question, correct: seed.listening.correct, distractors: seed.listening.distractors, explanation: seed.listening.explanation, speechText: seed.listening.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-08', lessonId: seed.lessonId, skill: 'grammar', prompt: seed.grammar.prompt ?? 'Doğru cümleyi seç.', question: seed.grammar.question, correct: seed.grammar.correct, distractors: seed.grammar.distractors, explanation: seed.grammar.explanation }),
];

const a2Steps = (review: string) => [
  { type: 'intro' as const, titleTr: 'A2 hedefi', bodyTr: 'A2 cümleleri biraz daha bağlıdır: zaman ifadesi, ayrılabilir fiil veya kısa sebep ekleyebilirsin.' },
  { type: 'vocabulary' as const, titleTr: 'Kelime kartları' },
  { type: 'grammar' as const, titleTr: 'Türkçe gramer ipucu' },
  { type: 'speaking' as const, titleTr: 'Sesli pratik', promptDe: 'Ich lerne jeden Tag Deutsch.', promptTr: 'Cümleyi yavaş ve net oku.' },
  { type: 'writing' as const, titleTr: 'Kısa yazma', promptTr: 'İki kısa A2 cümlesi yaz.' },
  { type: 'review' as const, titleTr: 'Özet', bodyTr: review },
];

const v2Warning = 'Türkçedeki esnek sırayı Almancaya taşımadan çekimli fiili ikinci yerde tut.';
const articleWarning = 'Yeni isimleri artikel rengiyle birlikte öğren: der mavi, die pembe, das yeşil.';

export const lessonsA2: Lesson[] = [
  makeLesson({
    id: 'a2-01-gunluk-planlar',
    unit: 1,
    cefr: 'A2',
    titleTr: 'Günlük Planlar',
    titleDe: 'Tagespläne',
    subtitleTr: 'Ayrılabilir fiiller ve zaman ifadeleri',
    goalTr: 'Günün planını zaman ifadeleriyle ve ayrılabilir fiillerle anlatmak.',
    descriptionTr: 'A2 başlangıcında günlük akışı biraz daha bağlı cümlelerle anlatırsın: kalkmak, alışveriş yapmak, aramak ve akşam planı söylemek.',
    estimatedMinutes: 14,
    objectives: ['Ayrılabilir fiil sırasını kurma', 'um/am zaman ifadelerini kullanma', 'Günlük planı iki cümleyle anlatma'],
    vocabulary: [
      { id: 'der-plan', german: 'der Plan', turkish: 'plan', article: 'der', plural: 'die Pläne', exampleDe: 'Mein Plan ist einfach.', exampleTr: 'Planım basit.', tags: ['daily', 'article'] },
      { id: 'der-morgen', german: 'der Morgen', turkish: 'sabah', article: 'der', plural: 'die Morgen', exampleDe: 'Am Morgen stehe ich früh auf.', exampleTr: 'Sabah erken kalkarım.', tags: ['time', 'article'] },
      { id: 'der-abend', german: 'der Abend', turkish: 'akşam', article: 'der', plural: 'die Abende', exampleDe: 'Am Abend rufe ich meine Mutter an.', exampleTr: 'Akşam annemi ararım.', tags: ['time', 'article'] },
      { id: 'die-pause', german: 'die Pause', turkish: 'mola', article: 'die', plural: 'die Pausen', exampleDe: 'In der Pause trinke ich Tee.', exampleTr: 'Molada çay içerim.', tags: ['daily', 'article'] },
      { id: 'aufstehen', german: 'aufstehen', turkish: 'kalkmak', exampleDe: 'Ich stehe um sieben Uhr auf.', exampleTr: 'Saat yedide kalkarım.', tags: ['separable'] },
      { id: 'einkaufen', german: 'einkaufen', turkish: 'alışveriş yapmak', exampleDe: 'Am Abend kaufe ich ein.', exampleTr: 'Akşam alışveriş yaparım.', tags: ['separable'] },
      { id: 'anrufen', german: 'anrufen', turkish: 'aramak', exampleDe: 'Ich rufe heute meinen Freund an.', exampleTr: 'Bugün arkadaşımı ararım.', tags: ['separable'] },
      { id: 'vorbereiten', german: 'vorbereiten', turkish: 'hazırlamak', exampleDe: 'Ich bereite das Essen vor.', exampleTr: 'Yemeği hazırlarım.', tags: ['separable'] },
    ],
    grammar: [
      grammarTip('Ayrılabilir fiil', 'aufstehen, einkaufen, anrufen gibi fiillerde küçük parça ana cümlenin sonuna gider.', [
        { german: 'Ich stehe um sieben Uhr auf.', turkish: 'Saat yedide kalkarım.' },
        { german: 'Am Abend kaufe ich ein.', turkish: 'Akşam alışveriş yaparım.' },
      ]),
      grammarTip('Zaman başta olabilir', 'Zaman ifadesi başa gelirse fiil yine ikinci yerdedir: Am Abend kaufe ich ein.', [
        { german: 'Heute rufe ich Lina an.', turkish: 'Bugün Lina’yı ararım.' },
      ]),
    ],
    dialog: [
      { speaker: 'Mert', line: 'Was machst du heute?', translationTr: 'Bugün ne yapıyorsun?' },
      { speaker: 'Nina', line: 'Am Morgen lerne ich. Am Abend kaufe ich ein.', translationTr: 'Sabah ders çalışıyorum. Akşam alışveriş yapıyorum.' },
      { speaker: 'Mert', line: 'Rufst du später an?', translationTr: 'Sonra arar mısın?' },
      { speaker: 'Nina', line: 'Ja, ich rufe um acht Uhr an.', translationTr: 'Evet, saat sekizde ararım.' },
    ],
    commonMistakeTr: v2Warning + ' Ayrılabilir parça çoğu ana cümlede sona gider: Ich stehe ... auf.',
    speakingPrompt: { titleTr: 'Günlük planını söyle', promptDe: 'Ich stehe um sieben Uhr auf. Am Abend kaufe ich ein.', promptTr: 'İki cümleyi oku, sonra saatleri değiştirerek tekrar dene.' },
    writingPrompt: { titleTr: 'Bugünkü plan', promptTr: 'Bugün sabah ve akşam ne yaptığını iki Almanca cümleyle yaz.', sampleAnswerDe: 'Am Morgen lerne ich Deutsch. Am Abend rufe ich meine Mutter an.' },
    reviewSummaryTr: 'Ayrılabilir fiillerde parçanın sona gittiğini ve zaman başa gelse bile fiilin ikinci yerde kaldığını çalıştın.',
    steps: a2Steps('A2 günlük planlarında zaman + fiil ikinci yer + ayrılabilir parça sona düzenini koru.'),
    baseExercises: a2Exercises({
      lessonId: 'a2-01-gunluk-planlar',
      vocab: { question: 'aufstehen', correct: 'kalkmak', distractors: ['aramak', 'hazırlamak', 'alışveriş yapmak'], explanation: 'aufstehen ayrılabilir bir fiildir: Ich stehe ... auf.' },
      fill: { question: 'Ich stehe um sieben Uhr ___.', correct: 'auf', distractors: ['an', 'ein', 'vor'], explanation: 'aufstehen fiilinde parça sona gider: stehe ... auf.' },
      article: { question: '___ Plan', article: 'der', explanation: 'Plan kelimesi der alır. Artikel rengiyle birlikte öğren.' },
      deTr: { question: 'Am Abend kaufe ich ein.', correct: 'Akşam alışveriş yaparım.', distractors: ['Sabah kalkarım.', 'Bugün annemi ararım.', 'Molada çay içerim.'], explanation: 'einkaufen alışveriş yapmak; parça “ein” sona gider.' },
      trDe: { question: 'Bugün arkadaşımı ararım.', correct: 'Heute rufe ich meinen Freund an.', accepted: ['Heute rufe ich meine Freundin an.'], explanation: 'anrufen ayrılabilir: rufe ... an.' },
      build: { question: 'Saat yedide kalkarım.', correct: 'Ich stehe um sieben Uhr auf .', words: ['auf', 'um', 'stehe', 'sieben', 'Ich', '.', 'Uhr'], explanation: 'Ayrılabilir parça sonda: Ich stehe ... auf.', speechText: 'Ich stehe um sieben Uhr auf.' },
      listening: { question: 'Kişi akşam ne yapıyor?', correct: 'alışveriş yapıyor', distractors: ['kalkıyor', 'uyuyor', 'ders çalışıyor'], explanation: 'Cümlede “Am Abend kaufe ich ein” deniyor.', speechText: 'Am Abend kaufe ich ein.' },
      grammar: { question: 'Doğru kelime sırası hangisi?', correct: 'Heute rufe ich Lara an.', distractors: ['Heute ich rufe Lara an.', 'Heute rufe an ich Lara.', 'Ich heute Lara an rufe.'], explanation: 'Zaman başta olsa fiil ikinci yerde kalır: Heute rufe ich ... an.' },
    }),
  }),
  makeLesson({
    id: 'a2-02-gecmisten-bahsetmek',
    unit: 2,
    cefr: 'A2',
    titleTr: 'Geçmişten Bahsetmek',
    titleDe: 'Über Vergangenes sprechen',
    subtitleTr: 'Perfekt, haben/sein ve hafta sonu',
    goalTr: 'Dün veya hafta sonu yaptıklarını basit Perfekt cümleleriyle anlatmak.',
    descriptionTr: 'A2 başlangıcında geçmişi kısa ve anlaşılır anlatmak için haben/sein + Partizip yapısını tekrar eder ve gerçek hayata yakın cümleler kurarsın.',
    estimatedMinutes: 15,
    objectives: ['haben/sein yardımcısını seçme', 'Basit Perfekt cümlesi kurma', 'Geçmiş zaman ifadelerini anlama'],
    vocabulary: [
      { id: 'das-wochenende', german: 'das Wochenende', turkish: 'hafta sonu', article: 'das', plural: 'die Wochenenden', exampleDe: 'Am Wochenende habe ich gelernt.', exampleTr: 'Hafta sonu ders çalıştım.', tags: ['past', 'article'] },
      { id: 'die-reise', german: 'die Reise', turkish: 'seyahat', article: 'die', plural: 'die Reisen', exampleDe: 'Die Reise war kurz.', exampleTr: 'Seyahat kısaydı.', tags: ['travel', 'article'] },
      { id: 'der-zug', german: 'der Zug', turkish: 'tren', article: 'der', plural: 'die Züge', exampleDe: 'Ich bin mit dem Zug gefahren.', exampleTr: 'Trenle gittim.', tags: ['travel', 'article'] },
      { id: 'das-ticket', german: 'das Ticket', turkish: 'bilet', article: 'das', plural: 'die Tickets', exampleDe: 'Ich habe ein Ticket gekauft.', exampleTr: 'Bir bilet aldım.', tags: ['travel', 'article'] },
      { id: 'gelernt', german: 'gelernt', turkish: 'öğrendi / çalıştı', exampleDe: 'Ich habe Deutsch gelernt.', exampleTr: 'Almanca çalıştım.', tags: ['perfekt'] },
      { id: 'gekauft', german: 'gekauft', turkish: 'satın aldı', exampleDe: 'Ich habe Brot gekauft.', exampleTr: 'Ekmek aldım.', tags: ['perfekt'] },
      { id: 'gefahren', german: 'gefahren', turkish: 'gitti / sürdü', exampleDe: 'Ich bin nach Berlin gefahren.', exampleTr: 'Berlin’e gittim.', tags: ['perfekt'] },
      { id: 'gestern', german: 'gestern', turkish: 'dün', exampleDe: 'Gestern habe ich viel gelernt.', exampleTr: 'Dün çok çalıştım.', tags: ['time'] },
    ],
    grammar: [
      grammarTip('Perfekt: haben/sein + Partizip', 'Çoğu fiilde haben kullanılır. Yer değiştirme bildiren bazı fiillerde sein gelir.', [
        { german: 'Ich habe Deutsch gelernt.', turkish: 'Almanca çalıştım.' },
        { german: 'Ich bin nach Berlin gefahren.', turkish: 'Berlin’e gittim.' },
      ]),
      grammarTip('Partizip sona yakın durur', 'Türkçede geçmiş eki fiile yapışır; Almancada yardımcı fiil ikinci yerde, asıl geçmiş parça sona yakın durur.', [
        { german: 'Gestern habe ich Brot gekauft.', turkish: 'Dün ekmek aldım.' },
      ]),
    ],
    dialog: [
      { speaker: 'Sara', line: 'Was hast du am Wochenende gemacht?', translationTr: 'Hafta sonu ne yaptın?' },
      { speaker: 'Can', line: 'Ich habe Deutsch gelernt und Brot gekauft.', translationTr: 'Almanca çalıştım ve ekmek aldım.' },
      { speaker: 'Sara', line: 'Bist du gereist?', translationTr: 'Seyahat ettin mi?' },
      { speaker: 'Can', line: 'Ja, ich bin nach Berlin gefahren.', translationTr: 'Evet, Berlin’e gittim.' },
    ],
    commonMistakeTr: 'Türkçedeki tek geçmiş fiil mantığı yerine Almancada iki parça kullan: habe/bin + gelernt/gefahren.',
    speakingPrompt: { titleTr: 'Hafta sonunu anlat', promptDe: 'Am Wochenende habe ich Deutsch gelernt. Ich bin mit dem Zug gefahren.', promptTr: 'İki geçmiş cümleyi oku ve kendi hafta sonuna uyarla.' },
    writingPrompt: { titleTr: 'Dün ne yaptın?', promptTr: 'Dün yaptığın iki şeyi Perfekt ile yaz.', sampleAnswerDe: 'Gestern habe ich Deutsch gelernt. Ich habe Tee getrunken.' },
    reviewSummaryTr: 'Geçmişi anlatırken haben/sein yardımcısını ve Partizip yapısını kullandın.',
    steps: a2Steps('Perfekt cümlede yardımcı fiil ikinci yerde, Partizip sona yakın durur.'),
    baseExercises: a2Exercises({
      lessonId: 'a2-02-gecmisten-bahsetmek',
      vocab: { question: 'das Wochenende', correct: 'hafta sonu', distractors: ['tren', 'bilet', 'seyahat'], explanation: 'Wochenende hafta sonu demektir ve das alır.' },
      fill: { question: 'Ich ___ Deutsch gelernt.', correct: 'habe', distractors: ['bin', 'ist', 'hat'], explanation: 'lernen fiilinde Perfekt genelde haben ile kurulur.' },
      article: { question: '___ Ticket', article: 'das', explanation: 'Ticket kelimesi das alır.' },
      deTr: { question: 'Ich bin nach Berlin gefahren.', correct: 'Berlin’e gittim.', distractors: ['Berlin’de çalıştım.', 'Berlin’den geldim.', 'Berlin’de yaşıyorum.'], explanation: 'fahren yer değiştirme bildirdiği için burada sein ile geldi: bin gefahren.' },
      trDe: { question: 'Almanca çalıştım.', correct: 'Ich habe Deutsch gelernt.', explanation: 'Perfekt: habe + gelernt.' },
      build: { question: 'Dün ekmek aldım.', correct: 'Gestern habe ich Brot gekauft .', words: ['gekauft', 'ich', 'Gestern', '.', 'Brot', 'habe'], explanation: 'Zaman başta: Gestern habe ich ... gekauft.', speechText: 'Gestern habe ich Brot gekauft.' },
      listening: { question: 'Kişi ne yaptı?', correct: 'Almanca çalıştı', distractors: ['Bilet aldı', 'Berlin’e gitti', 'Arkadaşını aradı'], explanation: 'Cümlede “Ich habe Deutsch gelernt” deniyor.', speechText: 'Ich habe Deutsch gelernt.' },
      grammar: { question: 'Yer değiştirme için doğru yardımcı hangisi?', correct: 'Ich bin mit dem Zug gefahren.', distractors: ['Ich habe mit dem Zug gefahren.', 'Ich ist mit dem Zug gefahren.', 'Ich bin mit dem Zug gekauft.'], explanation: 'fahren ile yer değiştirme varsa çoğu zaman sein kullanılır: bin gefahren.' },
    }),
  }),
  makeLesson({
    id: 'a2-03-randevu-ve-plan-yapma',
    unit: 3,
    cefr: 'A2',
    titleTr: 'Randevu ve Plan Yapma',
    titleDe: 'Termine vereinbaren',
    subtitleTr: 'Modal fiiller ve kibar rica',
    goalTr: 'Bir randevu istemek, zamanı değiştirmek ve kibarca konuşmak.',
    descriptionTr: 'A2 seviyesinde konuşmayı daha doğal yapmak için können, möchten ve müssen ile kısa randevu cümleleri kurarsın.',
    estimatedMinutes: 14,
    objectives: ['Kibar soru sorma', 'möchte ile istek bildirme', 'Termin kalıplarını kullanma'],
    vocabulary: [
      { id: 'der-termin', german: 'der Termin', turkish: 'randevu', article: 'der', plural: 'die Termine', exampleDe: 'Ich möchte einen Termin machen.', exampleTr: 'Bir randevu almak istiyorum.', tags: ['appointment', 'article'] },
      { id: 'die-praxis', german: 'die Praxis', turkish: 'muayenehane / ofis', article: 'die', plural: 'die Praxen', exampleDe: 'Die Praxis ist heute offen.', exampleTr: 'Muayenehane bugün açık.', tags: ['appointment', 'article'] },
      { id: 'das-gespraech', german: 'das Gespräch', turkish: 'görüşme', article: 'das', plural: 'die Gespräche', exampleDe: 'Das Gespräch dauert zehn Minuten.', exampleTr: 'Görüşme on dakika sürer.', tags: ['appointment', 'article'] },
      { id: 'die-nachricht', german: 'die Nachricht', turkish: 'mesaj', article: 'die', plural: 'die Nachrichten', exampleDe: 'Ich schreibe eine Nachricht.', exampleTr: 'Bir mesaj yazıyorum.', tags: ['communication', 'article'] },
      { id: 'koennen', german: 'können', turkish: '-ebilmek', exampleDe: 'Können wir morgen sprechen?', exampleTr: 'Yarın konuşabilir miyiz?', tags: ['modal'] },
      { id: 'moechten', german: 'möchten', turkish: 'istemek / rica etmek', exampleDe: 'Ich möchte einen Termin machen.', exampleTr: 'Bir randevu almak istiyorum.', tags: ['modal'] },
      { id: 'verschieben', german: 'verschieben', turkish: 'ertelemek / değiştirmek', exampleDe: 'Ich muss den Termin verschieben.', exampleTr: 'Randevuyu ertelemem gerekiyor.', tags: ['appointment'] },
      { id: 'morgen', german: 'morgen', turkish: 'yarın', exampleDe: 'Morgen habe ich Zeit.', exampleTr: 'Yarın vaktim var.', tags: ['time'] },
    ],
    grammar: [
      grammarTip('Modal fiil + mastar', 'können, möchten, müssen gibi modal fiiller ikinci yerde çekilir; asıl fiil sona gider.', [
        { german: 'Können wir morgen sprechen?', turkish: 'Yarın konuşabilir miyiz?' },
        { german: 'Ich möchte einen Termin machen.', turkish: 'Bir randevu almak istiyorum.' },
      ]),
      grammarTip('Kibar soru', 'Resmi durumda kısa ve net soru güvenlidir: Können wir ...? / Ich möchte ...', [
        { german: 'Können wir morgen sprechen?', turkish: 'Yarın konuşabilir miyiz?' },
      ]),
    ],
    dialog: [
      { speaker: 'Hasta', line: 'Guten Tag, ich möchte einen Termin machen.', translationTr: 'İyi günler, bir randevu almak istiyorum.' },
      { speaker: 'Praxis', line: 'Können Sie morgen um zehn Uhr kommen?', translationTr: 'Yarın saat onda gelebilir misiniz?' },
      { speaker: 'Hasta', line: 'Ja, das passt. Danke.', translationTr: 'Evet, uygun. Teşekkürler.' },
    ],
    commonMistakeTr: 'Modal fiilden sonra ikinci fiili çekme: “Ich möchte mache” değil, “Ich möchte ... machen”.',
    speakingPrompt: { titleTr: 'Randevu iste', promptDe: 'Guten Tag, ich möchte einen Termin machen. Können wir morgen sprechen?', promptTr: 'Kibar ve yavaş okuyarak randevu iste.' },
    writingPrompt: { titleTr: 'Kısa randevu mesajı', promptTr: 'Yarın görüşmek istediğini kısa bir Almanca mesajla yaz.', sampleAnswerDe: 'Guten Tag, ich möchte morgen einen Termin machen. Können wir um zehn Uhr sprechen?' },
    reviewSummaryTr: 'Modal fiillerle kibar randevu ve plan cümleleri kurdun.',
    steps: a2Steps('Modal fiil ikinci yerde, asıl fiil sonda kalır.'),
    baseExercises: a2Exercises({
      lessonId: 'a2-03-randevu-ve-plan-yapma',
      vocab: { question: 'der Termin', correct: 'randevu', distractors: ['mesaj', 'görüşme', 'ofis'], explanation: 'Termin randevu demektir ve der alır.' },
      fill: { question: 'Ich möchte einen Termin ___.', correct: 'machen', distractors: ['mache', 'macht', 'gemacht'], explanation: 'möchte modal yapıdır; asıl fiil mastar olarak sona gelir: machen.' },
      article: { question: '___ Nachricht', article: 'die', explanation: 'Nachricht kelimesi die alır.' },
      deTr: { question: 'Können wir morgen sprechen?', correct: 'Yarın konuşabilir miyiz?', distractors: ['Yarın gelebilir miyim?', 'Bugün randevum var.', 'Mesaj yazmak istiyorum.'], explanation: 'können -ebilmek anlamı verir; wir = biz.' },
      trDe: { question: 'Bir randevu almak istiyorum.', correct: 'Ich möchte einen Termin machen.', explanation: 'Kibar istek: Ich möchte ... machen.' },
      build: { question: 'Yarın konuşabilir miyiz?', correct: 'Können wir morgen sprechen ?', words: ['wir', 'sprechen', '?', 'Können', 'morgen'], explanation: 'Soru cümlesinde modal fiil başa gelir: Können wir ...?', speechText: 'Können wir morgen sprechen?' },
      listening: { question: 'Kişi ne istiyor?', correct: 'randevu almak', distractors: ['bilet almak', 'yol tarifi sormak', 'alışveriş yapmak'], explanation: 'Cümlede “ich möchte einen Termin machen” deniyor.', speechText: 'Ich möchte einen Termin machen.' },
      grammar: { question: 'Doğru modal fiil sırası hangisi?', correct: 'Ich muss den Termin verschieben.', distractors: ['Ich muss verschiebe den Termin.', 'Ich den Termin muss verschieben.', 'Ich verschieben muss den Termin.'], explanation: 'Modal fiil çekilir, asıl fiil sonda mastar kalır.' },
    }),
  }),
  makeLesson({
    id: 'a2-04-yol-tarifi-ve-sehir',
    unit: 4,
    cefr: 'A2',
    titleTr: 'Yol Tarifi ve Şehir',
    titleDe: 'Wegbeschreibung und Stadt',
    subtitleTr: 'Yönler, şehir yerleri ve konum',
    goalTr: 'Şehirde basit yol tarifi sormak ve anlamak.',
    descriptionTr: 'Gerçek hayatta işe yarayan yön, şehir yeri ve konum ifadeleriyle kısa ve kibar yol tarifi cümleleri kurarsın.',
    estimatedMinutes: 15,
    objectives: ['Yol tarifi anlama', 'Şehir yerlerini artikel ile öğrenme', 'neben/gegenüber gibi konumları tanıma'],
    vocabulary: [
      { id: 'der-bahnhof', german: 'der Bahnhof', turkish: 'tren istasyonu', article: 'der', plural: 'die Bahnhöfe', exampleDe: 'Der Bahnhof ist geradeaus.', exampleTr: 'Tren istasyonu düz ileride.', tags: ['city', 'article'] },
      { id: 'die-apotheke', german: 'die Apotheke', turkish: 'eczane', article: 'die', plural: 'die Apotheken', exampleDe: 'Die Apotheke ist neben dem Bahnhof.', exampleTr: 'Eczane istasyonun yanında.', tags: ['city', 'article'] },
      { id: 'das-rathaus', german: 'das Rathaus', turkish: 'belediye binası', article: 'das', plural: 'die Rathäuser', exampleDe: 'Das Rathaus ist links.', exampleTr: 'Belediye binası solda.', tags: ['city', 'article'] },
      { id: 'die-kreuzung', german: 'die Kreuzung', turkish: 'kavşak', article: 'die', plural: 'die Kreuzungen', exampleDe: 'An der Kreuzung gehen Sie links.', exampleTr: 'Kavşakta sola gidin.', tags: ['directions', 'article'] },
      { id: 'geradeaus', german: 'geradeaus', turkish: 'düz ileri', exampleDe: 'Gehen Sie geradeaus.', exampleTr: 'Düz gidin.', tags: ['directions'] },
      { id: 'links', german: 'links', turkish: 'sol', exampleDe: 'Dann gehen Sie links.', exampleTr: 'Sonra sola gidin.', tags: ['directions'] },
      { id: 'rechts', german: 'rechts', turkish: 'sağ', exampleDe: 'Die Bank ist rechts.', exampleTr: 'Banka sağda.', tags: ['directions'] },
      { id: 'neben', german: 'neben', turkish: 'yanında', exampleDe: 'Die Apotheke ist neben dem Bahnhof.', exampleTr: 'Eczane istasyonun yanında.', tags: ['preposition'] },
    ],
    grammar: [
      grammarTip('Kibar yol tarifi', 'Resmi durumda “Gehen Sie ...” güvenli ve nettir. Sie burada kibar emir gibi çalışır.', [
        { german: 'Gehen Sie geradeaus.', turkish: 'Düz gidin.' },
        { german: 'Dann gehen Sie links.', turkish: 'Sonra sola gidin.' },
      ]),
      grammarTip('Konum: ist neben ...', 'A2 başlangıcında konum için kısa kalıp yeterli: Die Apotheke ist neben dem Bahnhof.', [
        { german: 'Die Apotheke ist neben dem Bahnhof.', turkish: 'Eczane istasyonun yanında.' },
      ]),
    ],
    dialog: [
      { speaker: 'Kişi', line: 'Entschuldigung, wo ist die Apotheke?', translationTr: 'Afedersiniz, eczane nerede?' },
      { speaker: 'Yerel', line: 'Gehen Sie geradeaus und dann links.', translationTr: 'Düz gidin ve sonra sola.' },
      { speaker: 'Yerel', line: 'Die Apotheke ist neben dem Bahnhof.', translationTr: 'Eczane istasyonun yanında.' },
    ],
    commonMistakeTr: articleWarning + ' Yol tarifinde “Sie” kibar/resmi kullanım olduğu için büyük yazılır.',
    speakingPrompt: { titleTr: 'Yol tarifi ver', promptDe: 'Gehen Sie geradeaus und dann links. Die Apotheke ist neben dem Bahnhof.', promptTr: 'Kibar yol tarifi cümlelerini net ve yavaş oku.' },
    writingPrompt: { titleTr: 'Kısa tarif yaz', promptTr: 'Eczanenin istasyonun yanında olduğunu ve düz gidilmesi gerektiğini yaz.', sampleAnswerDe: 'Gehen Sie geradeaus. Die Apotheke ist neben dem Bahnhof.' },
    reviewSummaryTr: 'Şehir yerleri, yönler ve kibar yol tarifi kalıplarıyla A2 başlangıç pratiği yaptın.',
    steps: a2Steps('Yol tarifinde kısa emir kalıpları ve artikel renkleri çok işe yarar.'),
    baseExercises: a2Exercises({
      lessonId: 'a2-04-yol-tarifi-ve-sehir',
      vocab: { question: 'die Apotheke', correct: 'eczane', distractors: ['tren istasyonu', 'belediye', 'kavşak'], explanation: 'Apotheke eczane demektir ve die alır.' },
      fill: { question: 'Gehen Sie ___ und dann links.', correct: 'geradeaus', distractors: ['neben', 'Bahnhof', 'rechts'], explanation: 'geradeaus düz ileri demektir.' },
      article: { question: '___ Bahnhof', article: 'der', explanation: 'Bahnhof kelimesi der alır.' },
      deTr: { question: 'Die Apotheke ist neben dem Bahnhof.', correct: 'Eczane istasyonun yanında.', distractors: ['Eczane solda.', 'İstasyon eczanenin içinde.', 'Belediye istasyonun yanında.'], explanation: 'neben yanında demektir.' },
      trDe: { question: 'Düz gidin.', correct: 'Gehen Sie geradeaus.', explanation: 'Kibar yol tarifi: Gehen Sie ...' },
      build: { question: 'Eczane istasyonun yanında.', correct: 'Die Apotheke ist neben dem Bahnhof .', words: ['Bahnhof', 'neben', 'ist', 'dem', '.', 'Die', 'Apotheke'], explanation: 'Konum kalıbı: Die Apotheke ist neben dem Bahnhof.', speechText: 'Die Apotheke ist neben dem Bahnhof.' },
      listening: { question: 'Önce ne yapılmalı?', correct: 'düz gitmek', distractors: ['sağa dönmek', 'eczane aramak', 'tren almak'], explanation: 'Cümle “Gehen Sie geradeaus und dann links” diye başlıyor.', speechText: 'Gehen Sie geradeaus und dann links.' },
      grammar: { question: 'Kibar yol tarifi hangisi?', correct: 'Gehen Sie geradeaus.', distractors: ['Gehst du geradeaus.', 'Sie gehen geradeaus?', 'Geradeaus Sie gehen.'], explanation: 'Yol tarifinde “Gehen Sie ...” kibar ve doğrudur.' },
    }),
  }),
];

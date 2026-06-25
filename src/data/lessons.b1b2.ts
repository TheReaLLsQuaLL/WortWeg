import type { Lesson } from '../types/lesson';
import type { Article } from '../types/lesson';
import {
  articleExercise,
  buildExercise,
  choiceExercise,
  makeLesson,
  textExercise,
} from './lessonFactory';

export const b1b2Steps = (tip: string) => [
  { type: 'intro' as const, titleTr: 'B1->B2 İpucu', bodyTr: tip },
];

type B1B2ExerciseSeed = {
  lessonId: string;
  vocab: { question: string; correct: string; distractors: string[]; explanation: string };
  fill: { question: string; correct: string; distractors: string[]; explanation: string };
  article: { question: string; article: Article; explanation: string };
  deTr: { question: string; correct: string; distractors: string[]; explanation: string };
  trDe: { question: string; correct: string; accepted?: string[]; explanation: string };
  build: { question: string; correct: string; words: string[]; explanation: string; speechText?: string };
  listening: { question: string; correct: string; distractors: string[]; explanation: string; speechText: string };
  grammar: { question: string; correct: string; distractors: string[]; explanation: string };
};

export const b1b2Exercises = (seed: B1B2ExerciseSeed) => [
  choiceExercise({ id: 'ex-' + seed.lessonId + '-01', lessonId: seed.lessonId, prompt: 'Doğru anlamı seç.', question: seed.vocab.question, correct: seed.vocab.correct, distractors: seed.vocab.distractors, explanation: seed.vocab.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-02', lessonId: seed.lessonId, type: 'fillBlank', skill: 'grammar', prompt: 'Boşluğu tamamla.', question: seed.fill.question, correct: seed.fill.correct, distractors: seed.fill.distractors, explanation: seed.fill.explanation }),
  articleExercise({ id: 'ex-' + seed.lessonId + '-03', lessonId: seed.lessonId, question: seed.article.question, article: seed.article.article, explanation: seed.article.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-04', lessonId: seed.lessonId, skill: 'reading', prompt: 'Almancayı Türkçeye çevir.', question: seed.deTr.question, correct: seed.deTr.correct, distractors: seed.deTr.distractors, explanation: seed.deTr.explanation }),
  textExercise({ id: 'ex-' + seed.lessonId + '-05', lessonId: seed.lessonId, prompt: 'Almancaya çevir.', question: seed.trDe.question, correct: seed.trDe.correct, accepted: seed.trDe.accepted, explanation: seed.trDe.explanation }),
  buildExercise({ id: 'ex-' + seed.lessonId + '-06', lessonId: seed.lessonId, question: seed.build.question, correct: seed.build.correct, words: seed.build.words, explanation: seed.build.explanation, speechText: seed.build.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-07', lessonId: seed.lessonId, type: 'listening', skill: 'listening', prompt: 'Dinle ve doğruyu seç.', question: seed.listening.question, correct: seed.listening.correct, distractors: seed.listening.distractors, explanation: seed.listening.explanation, speechText: seed.listening.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-08', lessonId: seed.lessonId, skill: 'grammar', prompt: 'Dil bilgisi kuralını seç.', question: seed.grammar.question, correct: seed.grammar.correct, distractors: seed.grammar.distractors, explanation: seed.grammar.explanation }),
];

export const lessonsB1B2: Lesson[] = [
  makeLesson({
    id: 'b1b2-01-fikir-belirtme',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1’den B2’ye fikir belirtme',
    titleDe: 'Übergang: Meinung begründen',
    subtitleTr: 'Daha uzun cümleler',
    goalTr: 'Fikrini belirtirken daha uzun ve detaylı nedenler sunmayı öğrenmek.',
    descriptionTr: 'B1 seviyesinde kullandığımız basit "weil" (çünkü) kalıplarını B2 seviyesine taşımaya hazırlık yapıyoruz.',
    estimatedMinutes: 15,
    objectives: ['Fikir belirtme', 'Neden-sonuç yapıları', 'Daha zengin kelimeler'],
    vocabulary: [
      { id: 'v-b1b2-01-01', german: 'begründen', turkish: 'gerekçelendirmek', exampleDe: 'Ich möchte das begründen.', exampleTr: 'Bunu gerekçelendirmek istiyorum.' },
      { id: 'v-b1b2-01-02', german: 'überzeugt', turkish: 'ikna olmuş, emin', exampleDe: 'Ich bin überzeugt.', exampleTr: 'İkna oldum.' },
      { id: 'v-b1b2-01-03', german: 'der Standpunkt', turkish: 'görüş, bakış açısı', article: 'der', exampleDe: 'Das ist mein Standpunkt.', exampleTr: 'Bu benim bakış açım.' },
      { id: 'v-b1b2-01-04', german: 'darum', turkish: 'bu nedenle, bu yüzden', exampleDe: 'Darum komme ich nicht.', exampleTr: 'Bu yüzden gelmiyorum.' },
      { id: 'v-b1b2-01-05', german: 'ausführlich', turkish: 'ayrıntılı, detaylı', exampleDe: 'Bitte erklären Sie das ausführlich.', exampleTr: 'Lütfen bunu detaylı açıklayın.' },
      { id: 'v-b1b2-01-06', german: 'aufgrund', turkish: 'nedeniyle, yüzünden', exampleDe: 'Aufgrund des Regens...', exampleTr: 'Yağmur nedeniyle...' },
      { id: 'v-b1b2-01-07', german: 'der Beweis', turkish: 'kanıt, ispat', article: 'der', exampleDe: 'Ich habe einen Beweis.', exampleTr: 'Bir kanıtım var.' },
      { id: 'v-b1b2-01-08', german: 'die Meinung', turkish: 'fikir, düşünce', article: 'die', exampleDe: 'Meiner Meinung nach ist das gut.', exampleTr: 'Benim fikrime göre bu iyi.' },
    ],
    grammar: [],
    speakingPrompt: {
      titleTr: 'Fikrini söyle',
      promptDe: 'Was denken Sie darüber? Begründen Sie Ihre Meinung.',
      promptTr: 'Bu konuda ne düşünüyorsunuz? Fikrinizi gerekçelendirin.',
    },
    writingPrompt: {
      titleTr: 'Yazılı fikrini belirt',
      promptTr: 'Bu konuda kısa bir metin yaz ve fikrini detaylıca savun.',
      sampleAnswerDe: 'Ich bin davon überzeugt, dass es eine gute Idee ist.',
    },
    reviewSummaryTr: 'B2 seviyesinde fikir belirtirken daha güçlü kalıplar kullanmayı öğrendiniz.',
    steps: b1b2Steps('B2’ye geçerken, "Ich denke, dass..." (Düşünüyorum ki...) yerine "Ich bin davon überzeugt, dass..." (Şundan eminim ki...) gibi daha güçlü ifadeler kullanmaya başlarız.'),
    baseExercises: b1b2Exercises({
      lessonId: 'b1b2-01-fikir-belirtme',
      vocab: { question: 'ikna olmuş, emin', correct: 'überzeugt', distractors: ['begründen', 'Standpunkt', 'Beweis'], explanation: 'überzeugt = ikna olmuş.' },
      fill: { question: 'Ich bin davon ___, dass es klappt.', correct: 'überzeugt', distractors: ['darum', 'begründen', 'Meinung'], explanation: 'Kalıp: Ich bin davon überzeugt, dass... (Şundan eminim ki...)' },
      article: { question: '___ Standpunkt', article: 'der', explanation: 'Standpunkt (görüş) der artikeli alır.' },
      deTr: { question: 'Ich möchte meinen Standpunkt ausführlich begründen.', correct: 'Görüşümü ayrıntılı olarak gerekçelendirmek istiyorum.', distractors: ['Görüşümü bu yüzden değiştirmek istiyorum.', 'Bunun kanıtını bulmak istiyorum.', 'Fikrimi açıkça söylemek istemiyorum.'], explanation: 'ausführlich = ayrıntılı, begründen = gerekçelendirmek.' },
      trDe: { question: 'Bu yüzden gelemiyorum.', correct: 'Darum kann ich nicht kommen.', accepted: ['Deshalb kann ich nicht kommen.', 'Aus diesem Grund kann ich nicht kommen.'], explanation: 'darum = bu yüzden, bu nedenle (Fiil hemen ardından gelir: darum kann ich...).' },
      build: { question: 'Şundan eminim ki bu doğru.', correct: 'Ich bin davon überzeugt , dass das richtig ist .', words: ['Ich', 'dass', 'bin', 'überzeugt', ',', 'ist', 'richtig', 'davon', 'das', '.'], explanation: 'Ich bin davon überzeugt, dass... kalıbı.', speechText: 'Ich bin davon überzeugt, dass das richtig ist.' },
      listening: { question: 'Kişi neden bahsediyor?', correct: 'kendi bakış açısından', distractors: ['yeni bir kanıttan', 'ayrıntılı bir plandan', 'emin olmadığı bir konudan'], explanation: 'Ses: Aus meinem Standpunkt ist das klar.', speechText: 'Aus meinem Standpunkt ist das klar.' },
      grammar: { question: '"aufgrund" (nedeniyle) edatı hangi hal (Kasus) ile kullanılır?', correct: 'Genitiv', distractors: ['Dativ', 'Akkusativ', 'Nominativ'], explanation: 'aufgrund + Genitiv (aufgrund des Wetters).' },
    }),
  }),
  makeLesson({
    id: 'b1b2-02-baglaclar',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1’den B2’ye bağlaçlar',
    titleDe: 'Übergang: Konnektoren',
    subtitleTr: 'Cümleleri bağlamak',
    goalTr: 'obwohl, trotzdem, einerseits, andererseits gibi bağlaçları B2 seviyesine hazırlık olarak daha akıcı kullanmak.',
    descriptionTr: 'İleri seviye Almancanın sırrı doğru bağlaçları kullanmaktır. Zıtlık, sebep ve ekleme bağlaçlarını pekiştiriyoruz.',
    estimatedMinutes: 15,
    objectives: ['Zıtlık bağlaçları', 'Sıralama', 'Çoklu cümle kurma'],
    vocabulary: [
      { id: 'v-b1b2-02-01', german: 'obwohl', turkish: 'rağmen (...-diği halde)', exampleDe: 'Obwohl es regnet, gehe ich.', exampleTr: 'Yağmur yağmasına rağmen gidiyorum.' },
      { id: 'v-b1b2-02-02', german: 'trotzdem', turkish: 'buna rağmen, yine de', exampleDe: 'Es regnet, trotzdem gehe ich.', exampleTr: 'Yağmur yağıyor, buna rağmen gidiyorum.' },
      { id: 'v-b1b2-02-03', german: 'einerseits', turkish: 'bir yandan', exampleDe: 'Einerseits ist das wahr.', exampleTr: 'Bir yandan bu doğru.' },
      { id: 'v-b1b2-02-04', german: 'andererseits', turkish: 'öte yandan, diğer yandan', exampleDe: 'Andererseits ist es falsch.', exampleTr: 'Diğer yandan bu yanlış.' },
      { id: 'v-b1b2-02-05', german: 'außerdem', turkish: 'ayrıca, bunun dışında', exampleDe: 'Außerdem brauche ich Zeit.', exampleTr: 'Ayrıca zamana ihtiyacım var.' },
      { id: 'v-b1b2-02-06', german: 'dennoch', turkish: 'yine de, buna rağmen', exampleDe: 'Dennoch war es schön.', exampleTr: 'Yine de güzeldi.' },
      { id: 'v-b1b2-02-07', german: 'deshalb', turkish: 'bu nedenle, bu yüzden', exampleDe: 'Deshalb lerne ich.', exampleTr: 'Bu yüzden öğreniyorum.' },
      { id: 'v-b1b2-02-08', german: 'weder ... noch', turkish: 'ne ... ne de', exampleDe: 'Ich habe weder Zeit noch Geld.', exampleTr: 'Ne zamanım ne de param var.' },
    ],
    grammar: [],
    speakingPrompt: {
      titleTr: 'Zıtlıkları anlat',
      promptDe: 'Nennen Sie Vor- und Nachteile.',
      promptTr: 'Avantaj ve dezavantajları sayın.',
    },
    writingPrompt: {
      titleTr: 'Bağlaçlarla yaz',
      promptTr: 'obwohl ve trotzdem kullanarak iki zıt durumu anlatan bir metin yaz.',
      sampleAnswerDe: 'Obwohl es regnet, gehe ich spazieren.',
    },
    reviewSummaryTr: 'Zıtlık bağlaçlarıyla daha karmaşık cümleler kurmayı öğrendiniz.',
    steps: b1b2Steps('B2’de "aber" (ama) yerine daha sık "dennoch" (yine de) veya "einerseits... andererseits" (bir yandan... diğer yandan) kullanılarak argümanlar zenginleştirilir.'),
    baseExercises: b1b2Exercises({
      lessonId: 'b1b2-02-baglaclar',
      vocab: { question: 'bir yandan', correct: 'einerseits', distractors: ['andererseits', 'außerdem', 'obwohl'], explanation: 'einerseits = bir yandan.' },
      fill: { question: 'Es regnet, ___ gehen wir spazieren. (yine de)', correct: 'dennoch', distractors: ['obwohl', 'außerdem', 'einerseits'], explanation: 'dennoch = yine de (trotzdem ile eşanlamlıdır).' },
      article: { question: '___ Grund (sebep)', article: 'der', explanation: 'Grund der artikeli alır.' },
      deTr: { question: 'Einerseits ist es teuer, andererseits sehr gut.', correct: 'Bir yandan pahalı, öte yandan çok iyi.', distractors: ['Ne pahalı ne de çok iyi.', 'Pahalı olmasına rağmen yine de çok iyi.', 'Ayrıca hem pahalı hem de çok iyi.'], explanation: 'einerseits ... andererseits = bir yandan ... diğer yandan.' },
      trDe: { question: 'Hastaydı, yine de geldi.', correct: 'Er war krank, trotzdem kam er.', accepted: ['Er war krank, dennoch ist er gekommen.', 'Er war krank, trotzdem ist er gekommen.'], explanation: 'trotzdem / dennoch = yine de. Kendisinden sonra hemen fiil gelir.' },
      build: { question: 'O ne zamanı ne de parası var.', correct: 'Er hat weder Zeit noch Geld .', words: ['Er', 'Zeit', 'weder', 'noch', 'hat', 'Geld', '.'], explanation: 'weder ... noch = ne ... ne de.', speechText: 'Er hat weder Zeit noch Geld.' },
      listening: { question: 'Kişi ne ekliyor?', correct: 'başka bir bilgi', distractors: ['zıt bir fikir', 'bir soru', 'bir neden'], explanation: 'Ses: Außerdem möchte ich sagen, dass... (Ayrıca söylemek isterim ki...)', speechText: 'Außerdem möchte ich sagen, dass...' },
      grammar: { question: '"obwohl" (rağmen) ile başlayan bir yan cümlede (Nebensatz) fiil nerede yer alır?', correct: 'Cümlenin en sonunda.', distractors: ['Öznenin hemen arkasında.', 'Cümlenin en başında.', 'Virgülden hemen önce ikinci sırada.'], explanation: 'obwohl bir yan cümle bağlacıdır, fiili sona atar.' },
    }),
  }),
  makeLesson({
    id: 'b1b2-03-resmi-konusma',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1’den B2’ye resmi konuşma',
    titleDe: 'Übergang: höflich und formell sprechen',
    subtitleTr: 'İş dünyasına hazırlık',
    goalTr: 'Daha resmi, nazik ve dolaylı yoldan taleplerde bulunmayı öğrenmek.',
    descriptionTr: 'Almanya’da iş hayatında veya resmi kurumlarda (Behörde) doğrudan "Bunu istiyorum" demek yerine "Acaba mümkün mü?" demek daha kibardır. Konjunktiv II formunu pekiştiriyoruz.',
    estimatedMinutes: 15,
    objectives: ['Dolaylı sorular', 'Konjunktiv II pratik', 'Resmi kelimeler'],
    vocabulary: [
      { id: 'v-b1b2-03-01', german: 'Wäre es möglich, dass', turkish: '... olması mümkün müydü?', exampleDe: 'Wäre es möglich, dass Sie kommen?', exampleTr: 'Gelmeniz mümkün müydü?' },
      { id: 'v-b1b2-03-02', german: 'Ich hätte gern', turkish: '... isterdim (rica)', exampleDe: 'Ich hätte gern einen Tee.', exampleTr: 'Bir çay isterdim.' },
      { id: 'v-b1b2-03-03', german: 'Könnten Sie mir sagen', turkish: 'Bana söyleyebilir misiniz?', exampleDe: 'Könnten Sie mir sagen, wo das ist?', exampleTr: 'Bunun nerede olduğunu bana söyleyebilir misiniz?' },
      { id: 'v-b1b2-03-04', german: 'die Unterlagen', turkish: 'belgeler, evraklar', article: 'die', plural: 'die Unterlagen', exampleDe: 'Hier sind die Unterlagen.', exampleTr: 'Belgeler burada.' },
      { id: 'v-b1b2-03-05', german: 'zuständig', turkish: 'yetkili, sorumlu', exampleDe: 'Wer ist hier zuständig?', exampleTr: 'Burada yetkili kim?' },
      { id: 'v-b1b2-03-06', german: 'die Behörde', turkish: 'resmi kurum, daire', article: 'die', exampleDe: 'Ich muss zur Behörde.', exampleTr: 'Daireye gitmeliyim.' },
      { id: 'v-b1b2-03-07', german: 'die Auskunft', turkish: 'bilgi, danışma', article: 'die', exampleDe: 'Ich brauche eine Auskunft.', exampleTr: 'Bir bilgiye ihtiyacım var.' },
      { id: 'v-b1b2-03-08', german: 'höflich', turkish: 'kibar, nazik', exampleDe: 'Er ist sehr höflich.', exampleTr: 'O çok kibardır.' },
    ],
    grammar: [],
    speakingPrompt: {
      titleTr: 'Kibarca sor',
      promptDe: 'Fragen Sie höflich nach Informationen.',
      promptTr: 'Kibarca bilgi isteyin.',
    },
    writingPrompt: {
      titleTr: 'Resmi e-posta',
      promptTr: 'Bir resmi kuruma kibarca bilgi soran kısa bir e-posta yaz.',
      sampleAnswerDe: 'Könnten Sie mir bitte sagen, wo die Behörde ist?',
    },
    reviewSummaryTr: 'İş dünyasında ve resmi kurumlarda kibar konuşma kalıplarını öğrendiniz.',
    steps: b1b2Steps('B2 sınavlarında ve Alman iş hayatında "Könnten Sie mir bitte sagen, wo..." gibi dolaylı soru cümleleri standarttır. Bu yapıda soru kelimesinden sonra fiil en sona gider.'),
    baseExercises: b1b2Exercises({
      lessonId: 'b1b2-03-resmi-konusma',
      vocab: { question: 'belgeler, evraklar', correct: 'Unterlagen', distractors: ['Behörde', 'Auskunft', 'höflich'], explanation: 'die Unterlagen = evraklar.' },
      fill: { question: '___ Sie mir sagen, wo das Büro ist?', correct: 'Könnten', distractors: ['Hätten', 'Wären', 'Müssten'], explanation: 'Könnten Sie mir sagen = Bana söyleyebilir miydiniz? (Çok kibar rica)' },
      article: { question: '___ Auskunft', article: 'die', explanation: 'Auskunft (bilgi) die artikeli alır.' },
      deTr: { question: 'Wäre es möglich, dass Sie mir die Unterlagen schicken?', correct: 'Bana evrakları göndermeniz mümkün müydü?', distractors: ['Evraklar için yetkili kişi siz misiniz?', 'Bana evrakların ne zaman geleceğini söyleyebilir misiniz?', 'Evrakları resmi kuruma gönderdim.'], explanation: 'Wäre es möglich, dass... = ... mümkün müydü?' },
      trDe: { question: 'Daha fazla bilgi isterdim.', correct: 'Ich hätte gern mehr Auskunft.', accepted: ['Ich hätte gerne weitere Auskünfte.', 'Ich würde gern mehr Informationen haben.'], explanation: 'Ich hätte gern = ... isterdim (kibar).' },
      build: { question: 'Sorumlu kişi kim acaba, söyleyebilir misiniz?', correct: 'Könnten Sie mir sagen , wer zuständig ist ?', words: ['Sie', 'Könnten', 'wer', 'ist', 'mir', 'sagen', ',', 'zuständig', '?'], explanation: 'Dolaylı soruda fiil sona gider (wer zuständig ist).', speechText: 'Könnten Sie mir sagen, wer zuständig ist?' },
      listening: { question: 'Kişi ne arıyor?', correct: 'resmi kurum / daire', distractors: ['evrak', 'yetkili', 'bilgi'], explanation: 'Ses: Wo befindet sich die Behörde?', speechText: 'Wo befindet sich die Behörde?' },
      grammar: { question: 'Dolaylı bir soruda (Örn: Könnten Sie mir sagen, wo...) yan cümlenin fiili nereye konur?', correct: 'Cümlenin en sonuna.', distractors: ['Hemen soru kelimesinden sonra.', 'Virgülden hemen önce.', 'Cümlenin en başına.'], explanation: 'Dolaylı sorular yan cümledir (Nebensatz) ve fiil sona gider.' },
    }),
  }),
  makeLesson({
    id: 'b1b2-04-kisa-tartisma',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1’den B2’ye kısa tartışma',
    titleDe: 'Übergang: kurze Diskussion',
    subtitleTr: 'Katılmak ve itiraz etmek',
    goalTr: 'Bir tartışma esnasında bir fikre kibarca katılmayı veya itiraz etmeyi öğrenmek.',
    descriptionTr: 'B2 sözlü sınavında partnerinle tartışman gerekecek. "Das stimmt nicht" demek yerine "Da muss ich widersprechen" demek seni daha yüksek puana götürür.',
    estimatedMinutes: 15,
    objectives: ['Fikre katılmak', 'İtiraz etmek', 'Alternatif sunmak'],
    vocabulary: [
      { id: 'v-b1b2-04-01', german: 'zustimmen', turkish: 'katılmak (bir fikre)', exampleDe: 'Ich stimme dir zu.', exampleTr: 'Sana katılıyorum.' },
      { id: 'v-b1b2-04-02', german: 'widersprechen', turkish: 'itiraz etmek, karşı çıkmak', exampleDe: 'Da muss ich widersprechen.', exampleTr: 'Orada itiraz etmeliyim.' },
      { id: 'v-b1b2-04-03', german: 'völlig', turkish: 'tamamen', exampleDe: 'Sie haben völlig Recht.', exampleTr: 'Tamamen haklısınız.' },
      { id: 'v-b1b2-04-04', german: 'teilweise', turkish: 'kısmen', exampleDe: 'Ich stimme teilweise zu.', exampleTr: 'Kısmen katılıyorum.' },
      { id: 'v-b1b2-04-05', german: 'der Vorschlag', turkish: 'öneri, teklif', article: 'der', exampleDe: 'Das ist ein guter Vorschlag.', exampleTr: 'Bu iyi bir öneri.' },
      { id: 'v-b1b2-04-06', german: 'der Kompromiss', turkish: 'uzlaşma', article: 'der', exampleDe: 'Wir brauchen einen Kompromiss.', exampleTr: 'Bir uzlaşmaya ihtiyacımız var.' },
      { id: 'v-b1b2-04-07', german: 'Recht haben', turkish: 'haklı olmak', exampleDe: 'Du hast Recht.', exampleTr: 'Haklısın.' },
      { id: 'v-b1b2-04-08', german: 'die Alternative', turkish: 'alternatif, seçenek', article: 'die', exampleDe: 'Haben wir eine Alternative?', exampleTr: 'Bir alternatifimiz var mı?' },
    ],
    grammar: [],
    speakingPrompt: {
      titleTr: 'İtiraz et',
      promptDe: 'Widersprechen Sie Ihrem Partner höflich.',
      promptTr: 'Partnerinize kibarca itiraz edin.',
    },
    writingPrompt: {
      titleTr: 'Alternatif sun',
      promptTr: 'Bir fikre kısmen katılıp kendi alternatifini sunduğun bir metin yaz.',
      sampleAnswerDe: 'Da haben Sie Recht, aber ich habe eine gute Alternative.',
    },
    reviewSummaryTr: 'Tartışma sırasında fikirlere katılıp itiraz etme yollarını öğrendiniz.',
    steps: b1b2Steps('Tartışırken karşınızdakine hak veriyorsanız "Da haben Sie völlig Recht" (Orada tamamen haklısınız), itiraz ediyorsanız "Da muss ich Ihnen leider widersprechen" (Orada size maalesef itiraz etmeliyim) kalıpları hayat kurtarır.'),
    baseExercises: b1b2Exercises({
      lessonId: 'b1b2-04-kisa-tartisma',
      vocab: { question: 'itiraz etmek, karşı çıkmak', correct: 'widersprechen', distractors: ['zustimmen', 'völlig', 'teilweise'], explanation: 'widersprechen = itiraz etmek (Datif alır).' },
      fill: { question: 'Ich muss Ihnen da leider ___. (itiraz etmeliyim)', correct: 'widersprechen', distractors: ['zustimmen', 'völlig', 'Recht haben'], explanation: 'İtiraz etmek = widersprechen.' },
      article: { question: '___ Vorschlag', article: 'der', explanation: 'Vorschlag (öneri) der artikeli alır.' },
      deTr: { question: 'Wir müssen einen Kompromiss finden.', correct: 'Bir uzlaşma bulmalıyız.', distractors: ['Bir alternatif bulmalıyız.', 'Tamamen haklı olmalıyız.', 'Kısmen itiraz etmeliyiz.'], explanation: 'Kompromiss = uzlaşma.' },
      trDe: { question: 'Orada size tamamen katılıyorum.', correct: 'Da stimme ich Ihnen völlig zu.', accepted: ['Ich stimme Ihnen da völlig zu.', 'Da gebe ich Ihnen völlig Recht.'], explanation: 'zustimmen (katılmak) ayrılabilen bir fiildir ve Datif alır.' },
      build: { question: 'Orada haklısınız ama iyi bir alternatifim var.', correct: 'Da haben Sie Recht , aber ich habe eine gute Alternative .', words: ['Recht', 'Sie', 'Da', 'haben', ',', 'habe', 'ich', 'Alternative', 'eine', 'gute', 'aber', '.'], explanation: 'Da haben Sie Recht = Orada haklısınız.', speechText: 'Da haben Sie Recht, aber ich habe eine gute Alternative.' },
      listening: { question: 'Kişi fikre nasıl yaklaşıyor?', correct: 'kısmen katılıyor', distractors: ['tamamen reddediyor', 'tamamen katılıyor', 'umursamıyor'], explanation: 'Ses: Ich stimme dir teilweise zu. (Sana kısmen katılıyorum.)', speechText: 'Ich stimme dir teilweise zu.' },
      grammar: { question: '"zustimmen" ve "widersprechen" fiilleri kişi zamiriyle kullanıldığında hangi hali (Kasus) alırlar?', correct: 'Dativ', distractors: ['Akkusativ', 'Genitiv', 'Nominativ'], explanation: 'Ich stimme DIR zu. / Ich widerspreche IHNEN. İkisi de Dativ alır.' },
    }),
  }),
];

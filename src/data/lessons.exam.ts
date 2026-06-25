import type { Lesson } from '../types/lesson';
import type { Article } from '../types/lesson';
import {
  articleExercise,
  buildExercise,
  choiceExercise,
  makeLesson,
  textExercise,
} from './lessonFactory';

export const examSteps = (tip: string) => [
  { type: 'intro' as const, titleTr: 'Sınav İpucu', bodyTr: tip },
];

type ExamExerciseSeed = {
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

export const examExercises = (seed: ExamExerciseSeed) => [
  choiceExercise({ id: 'ex-' + seed.lessonId + '-01', lessonId: seed.lessonId, prompt: 'Doğru anlamı seç.', question: seed.vocab.question, correct: seed.vocab.correct, distractors: seed.vocab.distractors, explanation: seed.vocab.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-02', lessonId: seed.lessonId, type: 'fillBlank', skill: 'grammar', prompt: 'Boşluğu tamamla.', question: seed.fill.question, correct: seed.fill.correct, distractors: seed.fill.distractors, explanation: seed.fill.explanation }),
  articleExercise({ id: 'ex-' + seed.lessonId + '-03', lessonId: seed.lessonId, question: seed.article.question, article: seed.article.article, explanation: seed.article.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-04', lessonId: seed.lessonId, skill: 'reading', prompt: 'Almancayı Türkçeye çevir.', question: seed.deTr.question, correct: seed.deTr.correct, distractors: seed.deTr.distractors, explanation: seed.deTr.explanation }),
  textExercise({ id: 'ex-' + seed.lessonId + '-05', lessonId: seed.lessonId, prompt: 'Almancaya çevir.', question: seed.trDe.question, correct: seed.trDe.correct, accepted: seed.trDe.accepted, explanation: seed.trDe.explanation }),
  buildExercise({ id: 'ex-' + seed.lessonId + '-06', lessonId: seed.lessonId, question: seed.build.question, correct: seed.build.correct, words: seed.build.words, explanation: seed.build.explanation, speechText: seed.build.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-07', lessonId: seed.lessonId, type: 'listening', skill: 'listening', prompt: 'Dinle ve doğruyu seç.', question: seed.listening.question, correct: seed.listening.correct, distractors: seed.listening.distractors, explanation: seed.listening.explanation, speechText: seed.listening.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-08', lessonId: seed.lessonId, skill: 'grammar', prompt: 'Dil bilgisi kuralını seç.', question: seed.grammar.question, correct: seed.grammar.correct, distractors: seed.grammar.distractors, explanation: seed.grammar.explanation }),
];

export const lessonsExam: Lesson[] = [
  makeLesson({
    id: 'exam-style-b1-speaking-intro',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1 Konuşma Hazırlığı',
    titleDe: 'B1 Mündlicher Ausdruck',
    subtitleTr: 'Sınav stili pratik',
    goalTr: 'B1 konuşma sınavlarındaki ortak planlama ve resim anlatma görevlerine giriş.',
    descriptionTr: 'Sınav ortamında partnerinle birlikte bir etkinlik planlarken (etwas gemeinsam planen) kullanabileceğin anahtar kalıpları öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Birlikte plan yapma', 'Öneri sunma', 'Fikre katılma veya reddetme'],
    vocabulary: [
      { id: 'vorschlagen', german: 'vorschlagen', turkish: 'önermek', exampleDe: 'Ich schlage vor, dass wir am Wochenende fahren.', exampleTr: 'Hafta sonu gitmemizi öneriyorum.', tags: ['exam', 'verb'] },
      { id: 'der-vorschlag', german: 'der Vorschlag', turkish: 'öneri / teklif', article: 'der', plural: 'die Vorschläge', exampleDe: 'Das ist ein guter Vorschlag.', exampleTr: 'Bu iyi bir öneri.', tags: ['exam', 'article'] },
      { id: 'einverstanden', german: 'einverstanden', turkish: 'kabul / anlaştık', exampleDe: 'Bist du damit einverstanden?', exampleTr: 'Bunu kabul ediyor musun? (Bununla anlaştık mı?)', tags: ['exam', 'adjective'] },
      { id: 'stattdessen', german: 'stattdessen', turkish: 'bunun yerine', exampleDe: 'Lass uns stattdessen ins Kino gehen.', exampleTr: 'Bunun yerine sinemaya gidelim.', tags: ['exam', 'adverb'] },
      { id: 'sich-treffen', german: 'sich treffen', turkish: 'buluşmak', exampleDe: 'Wann wollen wir uns treffen?', exampleTr: 'Ne zaman buluşalım?', tags: ['exam', 'verb'] },
      { id: 'der-treffpunkt', german: 'der Treffpunkt', turkish: 'buluşma noktası', article: 'der', plural: 'die Treffpunkte', exampleDe: 'Wo ist der Treffpunkt?', exampleTr: 'Buluşma noktası neresi?', tags: ['exam', 'article'] },
      { id: 'besorgen', german: 'besorgen', turkish: 'temin etmek / halletmek', exampleDe: 'Ich werde die Getränke besorgen.', exampleTr: 'İçecekleri ben temin edeceğim.', tags: ['exam', 'verb'] },
      { id: 'kuemmern', german: 'sich kümmern um', turkish: 'ilgilenmek / halletmek', exampleDe: 'Ich kümmere mich um die Tickets.', exampleTr: 'Biletlerle ben ilgileneceğim.', tags: ['exam', 'verb'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Prüfer', line: 'Sie möchten gemeinsam einen Ausflug planen.', translationTr: 'Birlikte bir gezi planlamak istiyorsunuz.' },
      { speaker: 'Ece', line: 'Ich schlage vor, dass wir am Samstag fahren. Bist du einverstanden?', translationTr: 'Cumartesi gitmemizi öneriyorum. Katılıyor musun (Kabul mü)?' },
    ],
    commonMistakeTr: 'sich kümmern um (ilgilenmek) kalıbı her zaman Akkusativ (i hali) gerektirir: Ich kümmere mich um den Kuchen.',
    speakingPrompt: { titleTr: 'Öneri sun', promptDe: 'Ich schlage vor, dass wir am Wochenende fahren.', promptTr: 'Karşındaki partnerine söyler gibi net oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Biletlerle senin ilgileneceğini yaz.', sampleAnswerDe: 'Ich kümmere mich um die Tickets.' },
    reviewSummaryTr: 'B1 konuşma sınavının "birlikte plan yapma" (gemeinsam planen) bölümü için temel kalıpları öğrendin.',
    steps: examSteps('B1 konuşma sınavlarında kendi cümleni kurduktan sonra mutlaka partnerine soru sor (Was denkst du? / Bist du einverstanden?).'),
    baseExercises: examExercises({
      lessonId: 'exam-style-b1-speaking-intro',
      vocab: { question: 'besorgen', correct: 'temin etmek / halletmek', distractors: ['buluşmak', 'önermek', 'ilgilenmek'], explanation: 'besorgen = bir şeyi alıp getirmek, temin etmek (örneğin içecekleri).' },
      fill: { question: 'Ich ___ vor, dass wir ins Kino gehen. (öneriyorum)', correct: 'schlage', distractors: ['treffe', 'kümmere', 'besorge'], explanation: 'vorschlagen = önermek.' },
      article: { question: '___ Vorschlag', article: 'der', explanation: 'Vorschlag (öneri) der artikeli alır.' },
      deTr: { question: 'Lass uns stattdessen ins Kino gehen.', correct: 'Bunun yerine sinemaya gidelim.', distractors: ['Hadi sinemada buluşalım.', 'Sinema için biletleri sen hallet.', 'Sinemaya gitmeyi öneriyorum.'], explanation: 'stattdessen = bunun yerine.' },
      trDe: { question: 'Bunu kabul ediyor musun? (Bununla anlaştık mı?)', correct: 'Bist du damit einverstanden?', explanation: 'einverstanden sein = aynı fikirde olmak, kabul etmek.' },
      build: { question: 'Ne zaman buluşalım?', correct: 'Wann wollen wir uns treffen ?', words: ['treffen', 'Wann', 'uns', '?', 'wir', 'wollen'], explanation: 'sich treffen = buluşmak.', speechText: 'Wann wollen wir uns treffen?' },
      listening: { question: 'Partner biletlerle ne yapacak?', correct: 'İlgilenecek', distractors: ['İade edecek', 'Unutacak', 'Başkasından isteyecek'], explanation: 'Ses: Ich kümmere mich um die Tickets.', speechText: 'Ich kümmere mich um die Tickets.' },
      grammar: { question: 'sich kümmern fiili hangi edat ve durumla (Kasus) kullanılır?', correct: 'um + Akkusativ', distractors: ['für + Akkusativ', 'an + Dativ', 'mit + Dativ'], explanation: 'sich kümmern um + Akkusativ (bir şeyle ilgilenmek).' },
    }),
  }),
  makeLesson({
    id: 'exam-style-b1-writing-email',
    unit: 1,
    cefr: 'B1',
    titleTr: 'B1 E-posta Yazma',
    titleDe: 'B1 E-Mail schreiben',
    subtitleTr: 'Sınav stili pratik',
    goalTr: 'B1 sınavlarında sıkça sorulan yarı resmi ve resmi e-postaları doğru kalıplarla yazmak.',
    descriptionTr: 'Bir daveti reddetme, özür dileme ve alternatif sunma gibi yazılı görevleri nasıl şekillendireceğini öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['E-posta giriş ve çıkışları', 'Özür dileme', 'Daveti kibarca reddetme'],
    vocabulary: [
      { id: 'die-einladung', german: 'die Einladung', turkish: 'davet / davetiye', article: 'die', plural: 'die Einladungen', exampleDe: 'Vielen Dank für die Einladung.', exampleTr: 'Davet için çok teşekkürler.', tags: ['exam', 'article'] },
      { id: 'absagen', german: 'absagen', turkish: 'iptal etmek / reddetmek (daveti)', exampleDe: 'Ich muss den Termin leider absagen.', exampleTr: 'Maalesef randevuyu iptal etmeliyim.', tags: ['exam', 'verb'] },
      { id: 'verschieben', german: 'verschieben', turkish: 'ertelemek', exampleDe: 'Können wir das Treffen auf morgen verschieben?', exampleTr: 'Buluşmayı yarına erteleyebilir miyiz?', tags: ['exam', 'verb'] },
      { id: 'leider', german: 'leider', turkish: 'maalesef', exampleDe: 'Ich habe leider keine Zeit.', exampleTr: 'Maalesef vaktim yok.', tags: ['exam', 'adverb'] },
      { id: 'es-tut-mir-leid', german: 'Es tut mir leid', turkish: 'üzgünüm', exampleDe: 'Es tut mir leid, dass ich nicht kommen kann.', exampleTr: 'Gelemediğim için üzgünüm.', tags: ['exam', 'phrase'] },
      { id: 'die-verspaetung-exam', german: 'die Verspätung', turkish: 'gecikme', article: 'die', plural: 'die Verspätungen', exampleDe: 'Entschuldigen Sie die Verspätung.', exampleTr: 'Gecikme için özür dilerim.', tags: ['exam', 'article'] },
      { id: 'ausmachen', german: 'einen neuen Termin ausmachen', turkish: 'yeni bir randevu ayarlamak', exampleDe: 'Wir müssen einen neuen Termin ausmachen.', exampleTr: 'Yeni bir randevu ayarlamalıyız.', tags: ['exam', 'phrase'] },
      { id: 'sich-bedanken', german: 'sich bedanken', turkish: 'teşekkür etmek', exampleDe: 'Ich möchte mich bedanken.', exampleTr: 'Teşekkür etmek istiyorum.', tags: ['exam', 'verb'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Ali', line: 'Vielen Dank für die Einladung. Leider muss ich absagen.', translationTr: 'Davet için çok teşekkürler. Maalesef iptal etmek (reddetmek) zorundayım.' },
      { speaker: 'Ali', line: 'Können wir den Termin auf Freitag verschieben?', translationTr: 'Randevuyu Cumaya erteleyebilir miyiz?' },
    ],
    commonMistakeTr: 'verschieben auf (ertelemek) edatı Akkusativ gerektirir: auf den (der->den) Freitag verschieben.',
    speakingPrompt: { titleTr: 'Özür dile', promptDe: 'Es tut mir leid, dass ich nicht kommen kann.', promptTr: 'Mahcup bir tonla oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Davet için teşekkür et.', sampleAnswerDe: 'Vielen Dank für die Einladung.' },
    reviewSummaryTr: 'B1 yazma görevlerinde sıkça çıkan daveti iptal etme (absagen) ve erteleme (verschieben) yapılarını öğrendin.',
    steps: examSteps('B1 yazma sınavlarında (Schreiben) senden istenen 3 maddeyi de (özür dile, sebep belirt, yeni zaman öner) paragraf paragraf mutlaka işlemelisin.'),
    baseExercises: examExercises({
      lessonId: 'exam-style-b1-writing-email',
      vocab: { question: 'verschieben', correct: 'ertelemek', distractors: ['iptal etmek', 'teşekkür etmek', 'ayarlamak'], explanation: 'verschieben = ertelemek (genelde "auf" edatıyla kullanılır).' },
      fill: { question: 'Ich muss den Termin leider ___. (iptal etmeliyim)', correct: 'absagen', distractors: ['verschieben', 'ausmachen', 'bedanken'], explanation: 'absagen = iptal etmek.' },
      article: { question: '___ Einladung', article: 'die', explanation: 'Einladung (-ung) die artikeli alır.' },
      deTr: { question: 'Wir müssen einen neuen Termin ausmachen.', correct: 'Yeni bir randevu ayarlamalıyız.', distractors: ['Randevuyu maalesef iptal etmeliyiz.', 'Gecikme için yeni bir randevu almalıyız.', 'Yeni bir davet ayarlamalıyız.'], explanation: 'einen Termin ausmachen = randevu ayarlamak.' },
      trDe: { question: 'Maalesef vaktim yok.', correct: 'Ich habe leider keine Zeit.', explanation: 'leider = maalesef.' },
      build: { question: 'Buluşmayı yarına erteleyebilir miyiz?', correct: 'Können wir das Treffen auf morgen verschieben ?', words: ['auf', 'Treffen', 'Können', 'verschieben', 'morgen', 'wir', 'das', '?'], explanation: 'verschieben auf = ...-e ertelemek.', speechText: 'Können wir das Treffen auf morgen verschieben?' },
      listening: { question: 'Konuşmacı ne istiyor?', correct: 'Randevuyu iptal etmek', distractors: ['Randevuyu ertelemek', 'Davet etmek', 'Teşekkür etmek'], explanation: 'Ses: Ich muss den Termin leider absagen.', speechText: 'Ich muss den Termin leider absagen.' },
      grammar: { question: '"verschieben" (ertelemek) fiili ile haftanın bir gününe erteleme yaparken hangi edat kullanılır?', correct: 'auf (auf Freitag)', distractors: ['an (am Freitag)', 'zu (zum Freitag)', 'in (im Freitag)'], explanation: 'auf + Akkusativ verschieben.' },
    }),
  }),
  makeLesson({
    id: 'exam-style-b2-opinion-speaking',
    unit: 2,
    cefr: 'B2',
    titleTr: 'B2 Fikir Belirtme',
    titleDe: 'B2 Diskussion und Meinung',
    subtitleTr: 'Sınav stili pratik',
    goalTr: 'B2 konuşma sınavlarında bir konu hakkında yapılandırılmış ve akıcı bir şekilde görüş bildirmek.',
    descriptionTr: 'Sınavın "Tartışma" bölümünde (Diskussion) fikrini nasıl savunacağını ve partnerinin fikrine nasıl profesyonelce karşı çıkacağını öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Fikir belirtme', 'Avantaj/dezavantaj tartışma', 'Profesyonel itiraz'],
    vocabulary: [
      { id: 'der-standpunkt', german: 'der Standpunkt', turkish: 'bakış açısı / görüş', article: 'der', plural: 'die Standpunkte', exampleDe: 'Das ist mein persönlicher Standpunkt.', exampleTr: 'Bu benim kişisel bakış açım.', tags: ['exam', 'article'] },
      { id: 'vertreten', german: 'vertreten', turkish: 'savunmak / temsil etmek', exampleDe: 'Ich vertrete die Meinung, dass...', exampleTr: '... fikrini savunuyorum.', tags: ['exam', 'verb'] },
      { id: 'teilen', german: 'teilen (eine Meinung)', turkish: 'paylaşmak (bir fikri)', exampleDe: 'Ich teile Ihre Meinung völlig.', exampleTr: 'Fikrinizi tamamen paylaşıyorum (katılıyorum).', tags: ['exam', 'verb'] },
      { id: 'die-erfahrung', german: 'die Erfahrung', turkish: 'deneyim / tecrübe', article: 'die', plural: 'die Erfahrungen', exampleDe: 'Meiner Erfahrung nach...', exampleTr: 'Tecrübelerime göre...', tags: ['exam', 'article'] },
      { id: 'zweifeln', german: 'zweifeln an', turkish: 'şüphe duymak', exampleDe: 'Ich zweifle an dieser Aussage.', exampleTr: 'Bu ifadeden şüphe duyuyorum.', tags: ['exam', 'verb'] },
      { id: 'einerseits-andererseits', german: 'einerseits ... andererseits', turkish: 'bir yandan ... diğer yandan', exampleDe: 'Einerseits ist es gut, andererseits teuer.', exampleTr: 'Bir yandan iyi, diğer yandan pahalı.', tags: ['exam', 'phrase'] },
      { id: 'hingegen', german: 'hingegen', turkish: 'buna karşın', exampleDe: 'Ich hingegen denke, dass...', exampleTr: 'Buna karşın ben düşünüyorum ki...', tags: ['exam', 'adverb'] },
      { id: 'ueberzeugen', german: 'überzeugen', turkish: 'ikna etmek', exampleDe: 'Dieses Argument überzeugt mich nicht.', exampleTr: 'Bu argüman beni ikna etmiyor.', tags: ['exam', 'verb'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Ece', line: 'Ich vertrete den Standpunkt, dass soziale Medien nützlich sind.', translationTr: 'Sosyal medyanın faydalı olduğu görüşünü savunuyorum.' },
      { speaker: 'Ali', line: 'Da zweifle ich dran. Meiner Erfahrung nach sind sie oft schädlich.', translationTr: 'Bundan şüphe duyuyorum. Tecrübelerime göre sıkça zararlılar.' },
    ],
    commonMistakeTr: 'Meiner Erfahrung nach (Tecrübelerime göre) dedikten sonra her zaman fiil gelir: Meiner Erfahrung nach IST es so.',
    speakingPrompt: { titleTr: 'Fikrini savun', promptDe: 'Ich vertrete die Meinung, dass...', promptTr: 'Kendinden emin bir B2 tonuyla oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Bu argümanın seni ikna etmediğini yaz.', sampleAnswerDe: 'Dieses Argument überzeugt mich nicht.' },
    reviewSummaryTr: 'B2 konuşma sınavlarında puan kazandıran profesyonel tartışma kalıplarını (Standpunkt vertreten, zweifeln) öğrendin.',
    steps: examSteps('B2 sınavında "Ich denke" demek yerine "Ich vertrete den Standpunkt" dersen anında yüksek puan alırsın.'),
    baseExercises: examExercises({
      lessonId: 'exam-style-b2-opinion-speaking',
      vocab: { question: 'vertreten', correct: 'savunmak / temsil etmek', distractors: ['şüphe duymak', 'paylaşmak', 'ikna etmek'], explanation: 'eine Meinung vertreten = bir fikri/duruşu savunmak.' },
      fill: { question: 'Ich ___ Ihre Meinung völlig. (Fikrinizi tamamen paylaşıyorum/katılıyorum)', correct: 'teile', distractors: ['vertrete', 'zweifle', 'überzeuge'], explanation: 'Meinung teilen = Fikri paylaşmak (katılmak).' },
      article: { question: '___ Standpunkt', article: 'der', explanation: 'Standpunkt (bakış açısı) der artikeli alır.' },
      deTr: { question: 'Meiner Erfahrung nach...', correct: 'Tecrübelerime göre...', distractors: ['Benim bakış açıma göre...', 'Bir yandan benim için...', 'Buna karşın benim için...'], explanation: 'Erfahrung = tecrübe.' },
      trDe: { question: 'Bu ifadeden şüphe duyuyorum.', correct: 'Ich zweifle an dieser Aussage.', explanation: 'zweifeln an = ...-den şüphe duymak.' },
      build: { question: 'Bu benim kişisel bakış açım.', correct: 'Das ist mein persönlicher Standpunkt .', words: ['ist', 'mein', 'Das', 'Standpunkt', 'persönlicher', '.'], explanation: 'Standpunkt = bakış açısı.', speechText: 'Das ist mein persönlicher Standpunkt.' },
      listening: { question: 'Kişi ne yapıyor?', correct: 'Fikre katıldığını belirtiyor.', distractors: ['Şüphe duyuyor.', 'Kendi argümanını sunuyor.', 'Karşı çıkıyor.'], explanation: 'Ses: Ich teile Ihre Meinung völlig.', speechText: 'Ich teile Ihre Meinung völlig.' },
      grammar: { question: 'zweifeln (şüphe duymak) fiili hangi edatla birlikte kullanılır?', correct: 'an (Dativ)', distractors: ['über (Akkusativ)', 'auf (Akkusativ)', 'mit (Dativ)'], explanation: 'zweifeln an + Dativ.' },
    }),
  }),
  makeLesson({
    id: 'testdaf-style-academic-speaking-intro',
    unit: 2,
    cefr: 'C1',
    titleTr: 'Akademik Konuşmaya Giriş',
    titleDe: 'C1 Wissenschaftlicher Ausdruck',
    subtitleTr: 'TestDaF stili pratik',
    goalTr: 'TestDaF ve DSH gibi akademik sınavlarda grafik anlatımı ve nesnel veri aktarımı yapmak.',
    descriptionTr: 'Üniversite ortamını baz alan sınavlarda grafiklerdeki verileri (der Anteil, im Vergleich zu) nesnel ve profesyonelce sunmayı öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Grafik giriş cümleleri', 'Verileri yorumlama', 'Akademik nesnellik'],
    vocabulary: [
      { id: 'die-schaubild', german: 'das Schaubild', turkish: 'grafik / tablo', article: 'das', plural: 'die Schaubilder', exampleDe: 'Das vorliegende Schaubild zeigt...', exampleTr: 'Mevcut grafik şunu gösteriyor...', tags: ['exam', 'article'] },
      { id: 'vorliegend', german: 'vorliegend', turkish: 'mevcut / eldeki', exampleDe: 'Die vorliegende Grafik informiert über...', exampleTr: 'Mevcut grafik ... hakkında bilgi veriyor.', tags: ['exam', 'adjective'] },
      { id: 'der-anteil', german: 'der Anteil', turkish: 'pay / oran', article: 'der', plural: 'die Anteile', exampleDe: 'Der Anteil der Studenten ist hoch.', exampleTr: 'Öğrencilerin oranı (payı) yüksek.', tags: ['exam', 'article'] },
      { id: 'betragen', german: 'betragen', turkish: 'tutmak / -e baliğ olmak (miktar/sayı)', exampleDe: 'Die Zahl beträgt 50 Prozent.', exampleTr: 'Sayı yüzde 50\'dir (yüzde 50 tutmaktadır).', tags: ['exam', 'verb'] },
      { id: 'sich-belauefen-auf', german: 'sich belaufen auf', turkish: 'ulaşmak / bulmak (sayısal olarak)', exampleDe: 'Die Kosten belaufen sich auf 100 Euro.', exampleTr: 'Maliyetler 100 Euro\'yu buluyor.', tags: ['exam', 'phrase'] },
      { id: 'kontinuierlich', german: 'kontinuierlich', turkish: 'sürekli / kesintisiz', exampleDe: 'Die Zahlen steigen kontinuierlich.', exampleTr: 'Sayılar sürekli (kesintisiz) artıyor.', tags: ['exam', 'adverb'] },
      { id: 'verzeichnen', german: 'verzeichnen', turkish: 'kaydetmek / göstermek (düşüş/artış vb.)', exampleDe: 'Es ist ein Rückgang zu verzeichnen.', exampleTr: 'Bir düşüş kaydediliyor (görülüyor).', tags: ['exam', 'verb'] },
      { id: 'die-quelle', german: 'die Quelle', turkish: 'kaynak', article: 'die', plural: 'die Quellen', exampleDe: 'Die Quelle der Daten ist das Amt.', exampleTr: 'Verilerin kaynağı dairedir (ofis).', tags: ['exam', 'article'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Ece', line: 'Das vorliegende Schaubild zeigt die Entwicklung der Studentenzahlen.', translationTr: 'Mevcut grafik öğrenci sayılarının gelişimini gösteriyor.' },
      { speaker: 'Ece', line: 'Der Anteil der internationalen Studenten beträgt 15 Prozent.', translationTr: 'Uluslararası öğrencilerin oranı yüzde 15\'tir.' },
    ],
    commonMistakeTr: 'betragen (miktar belirtmek) fiili arkasından direkt sayıyı alır. betragen auf veya betragen zu DENMEZ. (Es beträgt 10 Euro).',
    speakingPrompt: { titleTr: 'Grafiği tanıt', promptDe: 'Das vorliegende Schaubild zeigt...', promptTr: 'Nesnel bir akademik tonda oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Maliyetlerin 100 Euro\'yu bulduğunu yaz.', sampleAnswerDe: 'Die Kosten belaufen sich auf 100 Euro.' },
    reviewSummaryTr: 'Akademik sınavlarda (TestDaF/DSH) grafik okuma ve nesnel anlatım (Schaubild, betragen, verzeichnen) kelimelerini öğrendin.',
    steps: examSteps('TestDaF sınavlarında konuşmaya "Das vorliegende Schaubild zeigt..." kalıbıyla başlamak standart ve güvenli bir stratejidir.'),
    baseExercises: examExercises({
      lessonId: 'testdaf-style-academic-speaking-intro',
      vocab: { question: 'betragen', correct: 'tutmak / -e baliğ olmak (miktar/sayı)', distractors: ['ulaşmak / bulmak', 'kaydetmek / göstermek', 'sürekli'], explanation: 'betragen = sayısal bir miktarın/değerin ne olduğunu belirtir (örn. 50 Euro tutuyor).' },
      fill: { question: 'Die Kosten ___ sich auf 100 Euro. (buluyor / ulaşıyor)', correct: 'belaufen', distractors: ['betragen', 'verzeichnen', 'zeigen'], explanation: 'sich belaufen auf = bir sayıya ulaşmak, bulmak.' },
      article: { question: '___ Schaubild', article: 'das', explanation: 'Schaubild (grafik/tablo) das artikeli alır.' },
      deTr: { question: 'Es ist ein Rückgang zu verzeichnen.', correct: 'Bir düşüş kaydediliyor (görülüyor).', distractors: ['Mevcut grafik bir düşüş gösteriyor.', 'Oran sürekli düşüyor.', 'Kaynakta bir düşüş var.'], explanation: 'verzeichnen = kaydetmek/göstermek. zu + infinitive yapısıyla edilgen (passiv) anlam katar.' },
      trDe: { question: 'Sayılar sürekli (kesintisiz) artıyor.', correct: 'Die Zahlen steigen kontinuierlich.', explanation: 'kontinuierlich = sürekli, düzenli olarak.' },
      build: { question: 'Mevcut grafik öğrenci sayılarının gelişimini gösteriyor.', correct: 'Das vorliegende Schaubild zeigt die Entwicklung der Studentenzahlen .', words: ['Entwicklung', 'Schaubild', 'vorliegende', 'Das', 'zeigt', 'der', 'die', 'Studentenzahlen', '.'], explanation: 'vorliegend = eldeki/mevcut.', speechText: 'Das vorliegende Schaubild zeigt die Entwicklung der Studentenzahlen.' },
      listening: { question: 'Uluslararası öğrencilerin oranı nedir?', correct: 'Yüzde 15', distractors: ['Yüzde 50', 'Yüzde 100', 'Bilinmiyor'], explanation: 'Ses: Der Anteil der internationalen Studenten beträgt 15 Prozent.', speechText: 'Der Anteil der internationalen Studenten beträgt 15 Prozent.' },
      grammar: { question: '"sich belaufen" (sayısal olarak ulaşmak) fiili hangi edatla kullanılır?', correct: 'auf (Akkusativ)', distractors: ['an (Dativ)', 'zu (Dativ)', 'für (Akkusativ)'], explanation: 'sich belaufen auf + sayı (Akkusativ).' },
    }),
  }),
];

export const getLessonById = (lessonId: string) =>
  lessonsExam.find((lesson) => lesson.id === lessonId);

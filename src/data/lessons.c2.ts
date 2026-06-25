import type { Lesson } from '../types/lesson';
import type { Article } from '../types/lesson';
import {
  articleExercise,
  buildExercise,
  choiceExercise,
  makeLesson,
  textExercise,
} from './lessonFactory';

export const c2Steps = (tip: string) => [
  { type: 'intro' as const, titleTr: 'C2 İpucu', bodyTr: tip },
];

type C2ExerciseSeed = {
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

export const c2Exercises = (seed: C2ExerciseSeed) => [
  choiceExercise({ id: 'ex-' + seed.lessonId + '-01', lessonId: seed.lessonId, prompt: 'Doğru anlamı seç.', question: seed.vocab.question, correct: seed.vocab.correct, distractors: seed.vocab.distractors, explanation: seed.vocab.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-02', lessonId: seed.lessonId, type: 'fillBlank', skill: 'grammar', prompt: 'Boşluğu tamamla.', question: seed.fill.question, correct: seed.fill.correct, distractors: seed.fill.distractors, explanation: seed.fill.explanation }),
  articleExercise({ id: 'ex-' + seed.lessonId + '-03', lessonId: seed.lessonId, question: seed.article.question, article: seed.article.article, explanation: seed.article.explanation }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-04', lessonId: seed.lessonId, skill: 'reading', prompt: 'Almancayı Türkçeye çevir.', question: seed.deTr.question, correct: seed.deTr.correct, distractors: seed.deTr.distractors, explanation: seed.deTr.explanation }),
  textExercise({ id: 'ex-' + seed.lessonId + '-05', lessonId: seed.lessonId, prompt: 'Almancaya çevir.', question: seed.trDe.question, correct: seed.trDe.correct, accepted: seed.trDe.accepted, explanation: seed.trDe.explanation }),
  buildExercise({ id: 'ex-' + seed.lessonId + '-06', lessonId: seed.lessonId, question: seed.build.question, correct: seed.build.correct, words: seed.build.words, explanation: seed.build.explanation, speechText: seed.build.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-07', lessonId: seed.lessonId, type: 'listening', skill: 'listening', prompt: 'Dinle ve doğruyu seç.', question: seed.listening.question, correct: seed.listening.correct, distractors: seed.listening.distractors, explanation: seed.listening.explanation, speechText: seed.listening.speechText }),
  choiceExercise({ id: 'ex-' + seed.lessonId + '-08', lessonId: seed.lessonId, skill: 'grammar', prompt: 'Dil bilgisi kuralını seç.', question: seed.grammar.question, correct: seed.grammar.correct, distractors: seed.grammar.distractors, explanation: seed.grammar.explanation }),
];

export const lessonsC2: Lesson[] = [
  makeLesson({
    id: 'c2-01-ince-anlam-farklari',
    unit: 1,
    cefr: 'C2',
    titleTr: 'İnce Anlam Farkları',
    titleDe: 'Nuancen und feine Bedeutungsunterschiede',
    subtitleTr: 'Kelimelerin ruhu',
    goalTr: 'Benzer anlamlara gelen kelimeler arasındaki ince farkları ayırt edip doğru bağlamda kullanmak.',
    descriptionTr: 'C2 seviyesinde dilin sınırlarını zorlayarak "erkennen" ile "einsehen" veya "verlangen" ile "fordern" gibi kelimelerin alt metinlerini öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Nüansları anlama', 'Bağlama göre doğru fiil', 'Eşanlamlıların farkları'],
    vocabulary: [
      { id: 'einsehen', german: 'einsehen', turkish: 'hatasını kabul etmek / idrak etmek', exampleDe: 'Er hat seinen Fehler endlich eingesehen.', exampleTr: 'O sonunda hatasını idrak etti (kabul etti).', tags: ['nuance', 'verb'] },
      { id: 'erkennen', german: 'erkennen', turkish: 'fark etmek / tanımak', exampleDe: 'Ich habe das Problem sofort erkannt.', exampleTr: 'Sorunu hemen fark ettim.', tags: ['nuance', 'verb'] },
      { id: 'verlangen', german: 'verlangen', turkish: 'talep etmek (hakkı olarak)', exampleDe: 'Das Gesetz verlangt es so.', exampleTr: 'Kanun bunu böyle talep ediyor.', tags: ['nuance', 'verb'] },
      { id: 'fordern-c2', german: 'fordern', turkish: 'talep etmek (ısrarla)', exampleDe: 'Die Bürger fordern mehr Sicherheit.', exampleTr: 'Vatandaşlar daha fazla güvenlik talep ediyor.', tags: ['nuance', 'verb'] },
      { id: 'die-einsicht', german: 'die Einsicht', turkish: 'idrak / anlayış', article: 'die', plural: 'die Einsichten', exampleDe: 'Zur Einsicht gelangen.', exampleTr: 'İdrak etme noktasına gelmek.', tags: ['nuance', 'article'] },
      { id: 'ausloesen', german: 'auslösen', turkish: 'tetiklemek / yol açmak', exampleDe: 'Das kann eine Krise auslösen.', exampleTr: 'Bu bir krizi tetikleyebilir.', tags: ['nuance', 'verb'] },
      { id: 'bewirken', german: 'bewirken', turkish: 'sağlamak / neden olmak (olumlu)', exampleDe: 'Das Gesetz hat viel Gutes bewirkt.', exampleTr: 'Kanun çok iyi şeyler sağladı (neden oldu).', tags: ['nuance', 'verb'] },
      { id: 'das-feingefuehl', german: 'das Feingefühl', turkish: 'incelik / hassasiyet', article: 'das', plural: 'die Feingefühle', exampleDe: 'Man braucht diplomatisches Feingefühl.', exampleTr: 'Diplomatik bir incelik (hassasiyet) gerekir.', tags: ['nuance', 'article'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Professor', line: 'Sie müssen einsehen, dass diese Methode hier nicht wirkt.', translationTr: 'Bu yöntemin burada işe yaramadığını idrak etmelisiniz.' },
      { speaker: 'Doktorand', line: 'Das habe ich nun erkannt, danke.', translationTr: 'Bunu şimdi fark ettim, teşekkürler.' },
    ],
    commonMistakeTr: 'einsehen (idrak edip kabullenmek) ile erkennen (farkına varmak) aynı değildir. Einsicht, bir süreç veya kabullenme gerektirir.',
    speakingPrompt: { titleTr: 'İdrak et', promptDe: 'Er hat seinen Fehler endlich eingesehen.', promptTr: 'Kabullenmiş bir ses tonuyla oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Diplomatik bir incelik gerektiğini yaz.', sampleAnswerDe: 'Man braucht diplomatisches Feingefühl.' },
    reviewSummaryTr: 'Benzer kelimeler arasındaki ince C2 farklarını (einsehen/erkennen, bewirken/auslösen) öğrendin.',
    steps: c2Steps('C2 düzeyinde mesele kelimeyi bilmek değil, hangi bağlamda hangisinin daha zarif (Feingefühl) durduğunu bilmektir.'),
    baseExercises: c2Exercises({
      lessonId: 'c2-01-ince-anlam-farklari',
      vocab: { question: 'einsehen', correct: 'hatasını kabul etmek / idrak etmek', distractors: ['tanımak', 'talep etmek', 'tetiklemek'], explanation: 'einsehen = sadece görmek/anlamak değil, hatayı veya bir durumu içselleştirerek kabullenmek (idrak).' },
      fill: { question: 'Das Gesetz hat viel Gutes ___. (sağladı / neden oldu)', correct: 'bewirkt', distractors: ['ausgelöst', 'eingesehen', 'verlangt'], explanation: 'bewirken genelde olumlu ve kalıcı bir etki sağlamak için kullanılır.' },
      article: { question: '___ Einsicht', article: 'die', explanation: 'Einsicht (-sicht) die artikeli alır.' },
      deTr: { question: 'Das kann eine Krise auslösen.', correct: 'Bu bir krizi tetikleyebilir.', distractors: ['Bu bir krizi çözebilir.', 'Bu krizi idrak edebilir.', 'Bu krize neden olabilir (olumlu).'], explanation: 'auslösen = tetiklemek (genellikle tarafsız veya olumsuz olaylar).' },
      trDe: { question: 'O sonunda hatasını idrak etti.', correct: 'Er hat seinen Fehler endlich eingesehen.', accepted: ['Er sah seinen Fehler endlich ein.', 'Sie hat ihren Fehler endlich eingesehen.'], explanation: 'Fehler einsehen = hatasını idrak etmek.' },
      build: { question: 'Vatandaşlar daha fazla güvenlik talep ediyor.', correct: 'Die Bürger fordern mehr Sicherheit .', words: ['Sicherheit', 'fordern', 'Bürger', 'Die', 'mehr', '.'], explanation: 'fordern = güçlü bir şekilde, kitlelerin talep etmesi.', speechText: 'Die Bürger fordern mehr Sicherheit.' },
      listening: { question: 'Ne gerekliymiş?', correct: 'Diplomatik bir incelik', distractors: ['Büyük bir idrak', 'Hızlı bir çözüm', 'Güçlü bir talep'], explanation: 'Ses: Man braucht diplomatisches Feingefühl.', speechText: 'Man braucht diplomatisches Feingefühl.' },
      grammar: { question: '"erkennen" ve "einsehen" fiilleri arasındaki en büyük anlam farkı nedir?', correct: 'erkennen bir anlık fark ediş, einsehen kabullenmedir.', distractors: ['einsehen daha resmidir.', 'erkennen sadece objeler için kullanılır.', 'İkisi tamamen eşanlamlıdır.'], explanation: 'erkennen = realize, einsehen = admit/comprehend.' },
    }),
  }),
  makeLesson({
    id: 'c2-02-deyimler-ve-ifadeler',
    unit: 1,
    cefr: 'C2',
    titleTr: 'Deyimler ve İfadeler',
    titleDe: 'Idiomatische Sprache und Redewendungen',
    subtitleTr: 'Anadili gibi konuşmak',
    goalTr: 'Almancadaki köklü deyimleri ve kalıplaşmış ifadeleri doğru bağlamda kullanmak.',
    descriptionTr: 'Sadece kelime kelime çevrilemeyen, ancak Almanların günlük hayatta veya tartışmalarda çok sık kullandığı metaforik deyimleri öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Yaygın deyimler', 'Metaforik dil', 'Duruma uygun kalıplar'],
    vocabulary: [
      { id: 'auf-den-punkt-bringen', german: 'auf den Punkt bringen', turkish: 'kısaca özetlemek / sadede gelmek', exampleDe: 'Lassen Sie es uns auf den Punkt bringen.', exampleTr: 'Gelin sadede gelelim (özetleyelim).', tags: ['idiom', 'phrase'] },
      { id: 'im-dunkeln-tappen', german: 'im Dunkeln tappen', turkish: 'karanlıkta el yordamıyla aramak (hiçbir fikri olmamak)', exampleDe: 'Die Polizei tappt völlig im Dunkeln.', exampleTr: 'Polisin konu hakkında hiçbir fikri yok.', tags: ['idiom', 'phrase'] },
      { id: 'den-nagel-auf-den-kopf-treffen', german: 'den Nagel auf den Kopf treffen', turkish: 'tam üstüne basmak / taşı gediğine koymak', exampleDe: 'Damit hast du den Nagel auf den Kopf getroffen.', exampleTr: 'Bununla tam üstüne bastın.', tags: ['idiom', 'phrase'] },
      { id: 'ueber-den-tellerrand-schauen', german: 'über den Tellerrand schauen', turkish: 'dar görüşlü olmamak / vizyon sahibi olmak', exampleDe: 'Wir müssen über den Tellerrand schauen.', exampleTr: 'Olaylara daha geniş bir perspektiften bakmalıyız.', tags: ['idiom', 'phrase'] },
      { id: 'der-tellerrand', german: 'der Tellerrand', turkish: 'tabak kenarı (mecaz: ufuk çizgisi)', article: 'der', plural: 'die Tellerränder', exampleDe: 'Blick über den Tellerrand.', exampleTr: 'Geniş açıdan bakış.', tags: ['idiom', 'article'] },
      { id: 'etwas-ins-leben-rufen', german: 'etwas ins Leben rufen', turkish: 'hayata geçirmek / kurmak', exampleDe: 'Das Projekt wurde ins Leben gerufen.', exampleTr: 'Proje hayata geçirildi.', tags: ['idiom', 'phrase'] },
      { id: 'unter-vier-augen', german: 'unter vier Augen', turkish: 'baş başa (gizlice)', exampleDe: 'Wir sollten das unter vier Augen besprechen.', exampleTr: 'Bunu baş başa konuşmalıyız.', tags: ['idiom', 'phrase'] },
      { id: 'die-faustregel', german: 'die Faustregel', turkish: 'altın kural / genel kural', article: 'die', plural: 'die Faustregeln', exampleDe: 'Als Faustregel gilt...', exampleTr: 'Genel bir kural olarak...', tags: ['idiom', 'article'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Chef', line: 'Wir müssen das Projekt nun endlich ins Leben rufen.', translationTr: 'Projeyi artık nihayet hayata geçirmeliyiz.' },
      { speaker: 'Ali', line: 'Damit treffen Sie den Nagel auf den Kopf!', translationTr: 'Bununla tam üstüne bastınız (tam da öyle)!' },
    ],
    commonMistakeTr: 'Deyimleri kelimesi kelimesine Türkçeye çevirmek anlam kaybına yol açar. "Auf den Punkt bringen" noktaya getirmek değil, sadede gelmektir.',
    speakingPrompt: { titleTr: 'Deyim kullan', promptDe: 'Wir müssen über den Tellerrand schauen.', promptTr: 'Vizyoner bir vurguyla oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Gelin sadede gelelim.', sampleAnswerDe: 'Lassen Sie es uns auf den Punkt bringen.' },
    reviewSummaryTr: 'C2 düzeyinde Almancayı çok daha doğal kılan deyimleri (Nagel auf den Kopf treffen, ins Leben rufen) öğrendin.',
    steps: c2Steps('Sözlü sınavlarda "unter vier Augen" veya "auf den Punkt bringen" gibi ifadeler sınav gözetmenini etkiler.'),
    baseExercises: c2Exercises({
      lessonId: 'c2-02-deyimler-ve-ifadeler',
      vocab: { question: 'den Nagel auf den Kopf treffen', correct: 'tam üstüne basmak / taşı gediğine koymak', distractors: ['hayata geçirmek', 'sadede gelmek', 'hiçbir fikri olmamak'], explanation: 'Tam olarak doğru şeyi söylemek veya tahmin etmek.' },
      fill: { question: 'Die Polizei tappt völlig im ___. (hiçbir fikri yok)', correct: 'Dunkeln', distractors: ['Tellerrand', 'Leben', 'Punkt'], explanation: 'im Dunkeln tappen = karanlıkta (bilgisizlik içinde) el yordamıyla aramak.' },
      article: { question: '___ Faustregel', article: 'die', explanation: 'Faustregel (genel kural) die artikeli alır.' },
      deTr: { question: 'Wir sollten das unter vier Augen besprechen.', correct: 'Bunu baş başa konuşmalıyız.', distractors: ['Bunu dört kişiyle konuşmalıyız.', 'Bunu gözümüzün önünde konuşmalıyız.', 'Bunu dört gözle beklemeliyiz.'], explanation: 'unter vier Augen = iki kişi arasında, baş başa.' },
      trDe: { question: 'Proje hayata geçirildi.', correct: 'Das Projekt wurde ins Leben gerufen.', accepted: ['Man hat das Projekt ins Leben gerufen.'], explanation: 'etw. ins Leben rufen = hayata geçirmek, kurmak.' },
      build: { question: 'Bununla tam üstüne bastın.', correct: 'Damit hast du den Nagel auf den Kopf getroffen .', words: ['Nagel', 'den', 'hast', 'auf', 'getroffen', 'den', 'Kopf', 'Damit', 'du', '.'], explanation: 'den Nagel auf den Kopf treffen deyimi.', speechText: 'Damit hast du den Nagel auf den Kopf getroffen.' },
      listening: { question: 'Konuşmacı ne yapmayı öneriyor?', correct: 'Sadede gelmeyi (kısaca özetlemeyi)', distractors: ['Baş başa konuşmayı', 'Geniş açıdan bakmayı', 'Kural koymayı'], explanation: 'Ses: Lassen Sie es uns auf den Punkt bringen.', speechText: 'Lassen Sie es uns auf den Punkt bringen.' },
      grammar: { question: 'über den Tellerrand schauen (ufkunu geniş tutmak) deyimi hangi bağlamda kullanılır?', correct: 'Geniş bir perspektiften bakmak gerektiğinde.', distractors: ['Yemek yerken görgü kurallarına uyulduğunda.', 'Tamamen karanlıkta kalındığında.', 'Baş başa konuşurken.'], explanation: 'Mecazi olarak tabak kenarının (Tellerrand) ötesine bakmak demektir.' },
    }),
  }),
  makeLesson({
    id: 'c2-03-kesin-argumantasyon',
    unit: 2,
    cefr: 'C2',
    titleTr: 'Kesin Argümantasyon ve Üslup',
    titleDe: 'Präzise Argumentation und Stil',
    subtitleTr: 'Tavizsiz ve mantıksal',
    goalTr: 'Münazaralarda ve akademik yazılarda argümanları boşluk bırakmadan, tamamen mantıksal bir üslupla sunmak.',
    descriptionTr: 'Karşı tarafın argümanını zekice zayıflatan (entkräften) ve kendi duruşunu sağlamlaştıran (untermauern) fiilleri ustalıkla kullanmayı öğreneceksin.',
    estimatedMinutes: 15,
    objectives: ['Mantıksal argümanlar', 'Karşı tezi zayıflatma', 'Akademik üslup'],
    vocabulary: [
      { id: 'untermauern', german: 'untermauern', turkish: 'desteklemek / temelini sağlamlaştırmak', exampleDe: 'Sie müssen Ihre These mit Fakten untermauern.', exampleTr: 'Tezinizi gerçeklerle desteklemelisiniz (sağlamlaştırmalısınız).', tags: ['argumentation', 'verb'] },
      { id: 'entkraeften', german: 'entkräften', turkish: 'zayıflatmak / çürütmek (argümanı)', exampleDe: 'Er konnte dieses Argument nicht entkräften.', exampleTr: 'Bu argümanı zayıflatamadı (çürütemedi).', tags: ['argumentation', 'verb'] },
      { id: 'stichhaltig', german: 'stichhaltig', turkish: 'geçerli / sağlam (argüman)', exampleDe: 'Das ist ein stichhaltiger Beweis.', exampleTr: 'Bu geçerli (sağlam) bir kanıttır.', tags: ['argumentation', 'adjective'] },
      { id: 'die-diskrepanz', german: 'die Diskrepanz', turkish: 'tutarsızlık / çelişki', article: 'die', plural: 'die Diskrepanzen', exampleDe: 'Es gibt eine Diskrepanz zwischen Theorie und Praxis.', exampleTr: 'Teori ve pratik arasında bir tutarsızlık var.', tags: ['argumentation', 'article'] },
      { id: 'postulieren', german: 'postulieren', turkish: 'iddia etmek / varsaymak (akademik)', exampleDe: 'Der Forscher postuliert, dass...', exampleTr: 'Araştırmacı ... olduğunu iddia ediyor.', tags: ['argumentation', 'verb'] },
      { id: 'plausibel', german: 'plausibel', turkish: 'akla yatkın', exampleDe: 'Die Erklärung klingt sehr plausibel.', exampleTr: 'Açıklama kulağa çok akla yatkın geliyor.', tags: ['argumentation', 'adjective'] },
      { id: 'schlussfolgern', german: 'schlussfolgern', turkish: 'sonuç çıkarmak', exampleDe: 'Daraus lässt sich schlussfolgern, dass...', exampleTr: 'Buradan ... sonucu çıkarılabilir.', tags: ['argumentation', 'verb'] },
      { id: 'die-validitaet', german: 'die Validität', turkish: 'geçerlilik', article: 'die', plural: 'die Validitäten', exampleDe: 'Die Validität der Studie ist hoch.', exampleTr: 'Çalışmanın geçerliliği yüksek.', tags: ['argumentation', 'article'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Professor', line: 'Die Diskrepanz in Ihren Daten entkräftet Ihr Argument.', translationTr: 'Verilerinizdeki tutarsızlık argümanınızı zayıflatıyor.' },
      { speaker: 'Doktorand', line: 'Ich werde es durch neue Studien untermauern.', translationTr: 'Bunu yeni çalışmalarla sağlamlaştıracağım.' },
    ],
    commonMistakeTr: 'entkräften (kuvvetini almak) genelde karşı tarafın argümanı için kullanılırken, untermauern (altını örmek/desteklemek) kendi argümanın için kullanılır.',
    speakingPrompt: { titleTr: 'Argümanı güçlendir', promptDe: 'Die Erklärung klingt sehr plausibel.', promptTr: 'Analitik bir tavırla oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Teori ve pratik arasında bir tutarsızlık olduğunu yaz.', sampleAnswerDe: 'Es gibt eine Diskrepanz zwischen Theorie und Praxis.' },
    reviewSummaryTr: 'C2 münazara dilinde en güçlü silahlar olan (untermauern, entkräften, stichhaltig) kelimelerini öğrendin.',
    steps: c2Steps('C2 Goethe Sınavında "stichhaltige Argumente" (sağlam argümanlar) sunmak yazılı bölümün en önemli kuralıdır.'),
    baseExercises: c2Exercises({
      lessonId: 'c2-03-kesin-argumantasyon',
      vocab: { question: 'untermauern', correct: 'desteklemek / temelini sağlamlaştırmak', distractors: ['çürütmek', 'sonuç çıkarmak', 'varsaymak'], explanation: 'untermauern = (bir tezin) altını örmek, desteklemek.' },
      fill: { question: 'Er konnte dieses Argument nicht ___. (zayıflatamadı / çürütemedi)', correct: 'entkräften', distractors: ['untermauern', 'postulieren', 'schlussfolgern'], explanation: 'entkräften = kuvvetini (Kraft) almak, çürütmek.' },
      article: { question: '___ Diskrepanz', article: 'die', explanation: 'Diskrepanz (çelişki/tutarsızlık) die artikeli alır.' },
      deTr: { question: 'Das ist ein stichhaltiger Beweis.', correct: 'Bu geçerli (sağlam) bir kanıttır.', distractors: ['Bu çelişkili bir iddiadır.', 'Bu akla yatkın bir teoridir.', 'Bu zayıf bir argümandır.'], explanation: 'stichhaltig = su götürmez, sağlam, geçerli.' },
      trDe: { question: 'Buradan ... sonucu çıkarılabilir.', correct: 'Daraus lässt sich schlussfolgern, dass...', accepted: ['Daraus kann man schlussfolgern, dass...'], explanation: 'schlussfolgern = sonuç çıkarmak.' },
      build: { question: 'Açıklama kulağa çok akla yatkın geliyor.', correct: 'Die Erklärung klingt sehr plausibel .', words: ['klingt', 'Erklärung', 'plausibel', 'Die', 'sehr', '.'], explanation: 'plausibel = akla yatkın, mantıklı.', speechText: 'Die Erklärung klingt sehr plausibel.' },
      listening: { question: 'Araştırmacı ne yapıyor?', correct: 'İddia ediyor (varsayıyor)', distractors: ['Sonuç çıkarıyor', 'Sağlamlaştırıyor', 'Zayıflatıyor'], explanation: 'Ses: Der Forscher postuliert, dass...', speechText: 'Der Forscher postuliert, dass...' },
      grammar: { question: 'Hangi sıfat bir argümanın mantıklı ve ikna edici olduğunu (akla yatkın) belirtir?', correct: 'plausibel', distractors: ['bedenklich', 'fraglich', 'vermeintlich'], explanation: 'plausibel = mantıklı, akla yatkın.' },
    }),
  }),
  makeLesson({
    id: 'c2-04-dil-hassasiyeti',
    unit: 2,
    cefr: 'C2',
    titleTr: 'Profesyonel ve Akademik Dil Hassasiyeti',
    titleDe: 'Professionelle und akademische Sprachpräzision',
    subtitleTr: 'Kusursuz ifade',
    goalTr: 'Tam ve kusursuz (präzise) Almanca ile karmaşık akademik metinler ve profesyonel raporlar yazmak.',
    descriptionTr: 'Sadece doğru dil bilgisi değil, kelimelerin anlamsal (semantisch) kesinliği (gewährleisten, unabdingbar) üzerine ustalaşacaksın.',
    estimatedMinutes: 15,
    objectives: ['Dilde kesinlik (Präzision)', 'Resmi rapor dili', 'Zorunluluk ve güvence bildirme'],
    vocabulary: [
      { id: 'gewaehrleisten', german: 'gewährleisten', turkish: 'garanti etmek / sağlamak', exampleDe: 'Wir müssen die Sicherheit gewährleisten.', exampleTr: 'Güvenliği sağlamalıyız (garanti etmeliyiz).', tags: ['precision', 'verb'] },
      { id: 'unabdingbar', german: 'unabdingbar', turkish: 'vazgeçilmez / zorunlu', exampleDe: 'Vertrauen ist eine unabdingbare Voraussetzung.', exampleTr: 'Güven, vazgeçilmez bir ön koşuldur.', tags: ['precision', 'adjective'] },
      { id: 'ausschlaggebend', german: 'ausschlaggebend', turkish: 'belirleyici', exampleDe: 'Das ist der ausschlaggebende Punkt.', exampleTr: 'Belirleyici olan nokta budur.', tags: ['precision', 'adjective'] },
      { id: 'das-kriterium', german: 'das Kriterium', turkish: 'kriter / ölçüt', article: 'das', plural: 'die Kriterien', exampleDe: 'Das erfüllt alle Kriterien.', exampleTr: 'Bu tüm kriterleri karşılıyor.', tags: ['precision', 'article'] },
      { id: 'inhaerent', german: 'inhärent', turkish: 'doğasında olan / içkin', exampleDe: 'Das ist ein dem System inhärentes Problem.', exampleTr: 'Bu sistemin doğasında olan bir problemdir.', tags: ['precision', 'adjective'] },
      { id: 'manifestieren', german: 'manifestieren', turkish: 'belirmek / ortaya çıkmak', exampleDe: 'Die Krise manifestiert sich im Alltag.', exampleTr: 'Kriz günlük hayatta kendini gösteriyor (beliriyor).', tags: ['precision', 'verb'] },
      { id: 'fungieren', german: 'fungieren', turkish: 'görevini görmek / işlev görmek', exampleDe: 'Er fungiert als Vermittler.', exampleTr: 'O arabulucu işlevi (görevi) görüyor.', tags: ['precision', 'verb'] },
      { id: 'das-paradigma', german: 'das Paradigma', turkish: 'paradigma / model', article: 'das', plural: 'die Paradigmen', exampleDe: 'Wir erleben einen Paradigmenwechsel.', exampleTr: 'Bir paradigma (model) değişimi yaşıyoruz.', tags: ['precision', 'article'] },
    ],
    grammar: [],
    dialog: [
      { speaker: 'Direktor', line: 'Qualität ist unabdingbar. Wir müssen sie gewährleisten.', translationTr: 'Kalite vazgeçilmezdir. Onu garanti etmeliyiz.' },
      { speaker: 'Manager', line: 'Richtig, das ist das ausschlaggebende Kriterium.', translationTr: 'Doğru, belirleyici kriter budur.' },
    ],
    commonMistakeTr: 'gewährleisten (garanti etmek) ayrı yazılmaz ve ayrılabilen bir fiil değildir. Ich gewährleiste das (Ich leiste das gewahr DEĞİL).',
    speakingPrompt: { titleTr: 'Belirleyici noktayı söyle', promptDe: 'Das ist der ausschlaggebende Punkt.', promptTr: 'Kararlı bir profesyonel tonda oku.' },
    writingPrompt: { titleTr: 'Yaz', promptTr: 'Güvenin vazgeçilmez bir ön koşul olduğunu yaz.', sampleAnswerDe: 'Vertrauen ist eine unabdingbare Voraussetzung.' },
    reviewSummaryTr: 'C2 metinlerini zirveye taşıyan (unabdingbar, gewährleisten, ausschlaggebend) kelimelerini öğrendin.',
    steps: c2Steps('"unabdingbar" (vazgeçilmez/zorunlu) kelimesi "wichtig" (önemli) kelimesinin C2 versiyonudur ve raporlarda harika durur.'),
    baseExercises: c2Exercises({
      lessonId: 'c2-04-dil-hassasiyeti',
      vocab: { question: 'ausschlaggebend', correct: 'belirleyici', distractors: ['doğasında olan', 'vazgeçilmez', 'garanti eden'], explanation: 'ausschlaggebend = terazinin dengesini değiştiren, belirleyici (crucial/decisive).' },
      fill: { question: 'Wir müssen die Sicherheit ___. (garanti etmeliyiz)', correct: 'gewährleisten', distractors: ['manifestieren', 'fungieren', 'postulieren'], explanation: 'gewährleisten = garanti etmek, sağlamak.' },
      article: { question: '___ Kriterium', article: 'das', explanation: 'Kriterium (ölçüt) das artikeli alır (Çoğulu: Kriterien).' },
      deTr: { question: 'Vertrauen ist eine unabdingbare Voraussetzung.', correct: 'Güven, vazgeçilmez bir ön koşuldur.', distractors: ['Güven, belirleyici bir kriterdir.', 'Güven, doğasında olan bir histir.', 'Güven, garanti edilen bir şeydir.'], explanation: 'unabdingbar = vazgeçilmez, mutlak zorunlu.' },
      trDe: { question: 'O arabulucu işlevi (görevi) görüyor.', correct: 'Er fungiert als Vermittler.', accepted: ['Sie fungiert als Vermittlerin.', 'Er wirkt als Vermittler.'], explanation: 'fungieren als = ... olarak işlev görmek/görev yapmak.' },
      build: { question: 'Belirleyici olan nokta budur.', correct: 'Das ist der ausschlaggebende Punkt .', words: ['ist', 'Punkt', 'der', 'Das', 'ausschlaggebende', '.'], explanation: 'ausschlaggebend = belirleyici.', speechText: 'Das ist der ausschlaggebende Punkt.' },
      listening: { question: 'Problem sistemin neresindeymiş?', correct: 'Doğasında (İçkin)', distractors: ['Geçmişinde', 'Kriterlerinde', 'Modelinde'], explanation: 'Ses: Das ist ein dem System inhärentes Problem.', speechText: 'Das ist ein dem System inhärentes Problem.' },
      grammar: { question: 'gewährleisten fiili ayrılabilen bir fiil midir?', correct: 'Hayır, ayrılamaz (Ich gewährleiste das).', distractors: ['Evet, ayrılır (Ich leiste gewahr).', 'Evet, ama sadece geçmiş zamanda.', 'Hayır, çünkü dönüşlüdür.'], explanation: 'gewährleisten ayrılamayan ve düzensiz çekilmeyen (zayıf) bir fiildir.' },
    }),
  }),
];

export const getLessonById = (lessonId: string) =>
  lessonsC2.find((lesson) => lesson.id === lessonId);

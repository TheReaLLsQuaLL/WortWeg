export type SpeakingPrompt = {
  id: string;
  topicTitle: string;
  expectedText: string;
  meaningTr: string;
  tipTr: string;
};

export const speakingPromptsA1: SpeakingPrompt[] = [
  {
    id: 'a1-speaking-name',
    topicTitle: 'Tanışma',
    expectedText: 'Ich heiße Toprak.',
    meaningTr: 'Benim adım Toprak.',
    tipTr: "'heiße' kelimesinde ß sesini net ve kısa söyle.",
  },
  {
    id: 'a1-speaking-origin',
    topicTitle: 'Nerelisin?',
    expectedText: 'Ich komme aus der Türkei.',
    meaningTr: 'Türkiye’den geliyorum.',
    tipTr: "'aus der Türkei' bölümünü tek parça gibi akıcı oku.",
  },
  {
    id: 'a1-speaking-city',
    topicTitle: 'Yaşadığın yer',
    expectedText: 'Ich wohne in Istanbul.',
    meaningTr: 'İstanbul’da yaşıyorum.',
    tipTr: "'wohne' kelimesindeki o sesini uzatmadan söyle.",
  },
  {
    id: 'a1-speaking-drink',
    topicTitle: 'Günlük alışkanlık',
    expectedText: 'Ich trinke gern Kaffee.',
    meaningTr: 'Kahve içmeyi severim.',
    tipTr: "'gern Kaffee' arasında kısa bir durak yeterli.",
  },
  {
    id: 'a1-speaking-family',
    topicTitle: 'Aile',
    expectedText: 'Das ist meine Familie.',
    meaningTr: 'Bu benim ailem.',
    tipTr: "'Familie' kelimesini Fa-mi-li-e şeklinde bölmeden oku.",
  },
];

export const getSpeakingPromptById = (promptId?: string) =>
  speakingPromptsA1.find((prompt) => prompt.id === promptId) ?? speakingPromptsA1[0]!;

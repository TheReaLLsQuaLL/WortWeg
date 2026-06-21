export type SimilarityBucket = 'high' | 'medium' | 'low';
export type SpeechFeedbackLevel = 'excellent' | 'good' | 'needsPractice' | 'noSpeech';

export type TranscriptComparison = {
  exactMatch: boolean;
  normalizedMatch: boolean;
  normalizedExpectedWords: string[];
  normalizedTranscriptWords: string[];
  missingWords: string[];
  extraWords: string[];
  matchedWords: string[];
  wordOrderHints: string[];
  similarityScore: number;
  scorePercent: number;
  similarityBucket: SimilarityBucket;
  feedbackLevel: SpeechFeedbackLevel;
  shortFeedbackTr: string;
  retrySuggestionTr: string;
};

const punctuationPattern = /[.,!?;:()"“”„'´…\[\]{}]/g;
const dashPattern = /[-–—]/g;

export const normalizeGermanText = (text: string, options?: { looseEszett?: boolean }) => {
  const normalized = text
    .toLocaleLowerCase('de-DE')
    .trim()
    .replace(dashPattern, ' ')
    .replace(punctuationPattern, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return options?.looseEszett ? normalized.replace(/ß/g, 'ss') : normalized;
};

const tokenize = (text: string, options?: { looseEszett?: boolean }) => {
  const normalized = normalizeGermanText(text, options);
  return normalized ? normalized.split(' ') : [];
};

export const getSimilarityBucket = (score: number): SimilarityBucket => {
  if (score >= 80) {
    return 'high';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
};

const formatWordList = (words: string[]) => words.slice(0, 4).join(', ');

const getOrderedMatchCount = (expectedTokens: string[], transcriptTokens: string[]) => {
  if (expectedTokens.length === 0 || transcriptTokens.length === 0) {
    return 0;
  }

  let previousRow = Array(transcriptTokens.length + 1).fill(0) as number[];

  for (const expectedToken of expectedTokens) {
    const currentRow = Array(transcriptTokens.length + 1).fill(0) as number[];

    transcriptTokens.forEach((transcriptToken, transcriptIndex) => {
      const column = transcriptIndex + 1;
      const previousColumn = column - 1;

      currentRow[column] = expectedToken === transcriptToken
        ? (previousRow[previousColumn] ?? 0) + 1
        : Math.max(previousRow[column] ?? 0, currentRow[previousColumn] ?? 0);
    });

    previousRow = currentRow;
  }

  return previousRow[transcriptTokens.length] ?? 0;
};

const getFeedbackLevel = (
  similarityScore: number,
  transcriptWordCount: number,
): SpeechFeedbackLevel => {
  if (transcriptWordCount === 0) {
    return 'noSpeech';
  }

  if (similarityScore >= 85) {
    return 'excellent';
  }

  if (similarityScore >= 60) {
    return 'good';
  }

  return 'needsPractice';
};

const buildFeedback = (
  similarityScore: number,
  missingWords: string[],
  extraWords: string[],
  wordOrderHints: string[],
  feedbackLevel: SpeechFeedbackLevel,
) => {
  if (feedbackLevel === 'noSpeech') {
    return 'Sesini duyamadık. Mikrofona biraz daha yakın konuşup tekrar dene.';
  }

  if (feedbackLevel === 'excellent') {
    return 'Harika! Cümlenin büyük kısmı doğru.';
  }

  if (feedbackLevel === 'good') {
    if (wordOrderHints.length > 0) {
      return 'İyi gidiyor. Kelime sırası biraz karışmış olabilir.';
    }

    if (missingWords.length > 0) {
      return 'İyi gidiyor. Birkaç kelime eksik.';
    }

    return 'İyi gidiyor. Bir kez daha daha net söylemeyi dene.';
  }

  if (missingWords.length > 0) {
    return 'Tekrar deneyelim. Eksik kelimeleri net söyle: ' + formatWordList(missingWords) + '.';
  }

  if (extraWords.length > 0) {
    return 'Tekrar deneyelim. Hedef cümleye yakın kalmaya çalış.';
  }

  return 'Tekrar deneyelim. Önce kısa parçalar halinde söyle.';
};

const buildRetrySuggestion = (
  feedbackLevel: SpeechFeedbackLevel,
  wordOrderHints: string[],
  missingWords: string[],
  extraWords: string[],
) => {
  if (feedbackLevel === 'noSpeech') {
    return 'Mikrofona biraz daha yakın konuşup cümleyi tekrar söyle.';
  }

  if (feedbackLevel === 'excellent') {
    return 'Bir kez daha doğal hızda söyleyerek akıcılığı güçlendir.';
  }

  if (wordOrderHints.length > 0) {
    return 'Cümleyi soldan sağa aynı sırayla, küçük parçalar halinde tekrar et.';
  }

  if (missingWords.length > 0) {
    return 'Önce eksik kelimeleri tek tek oku, sonra tüm cümleyi söyle.';
  }

  if (extraWords.length > 0) {
    return 'Hedef cümleyi kısa tut ve ekstra kelime eklemeden tekrar dene.';
  }

  return 'Yavaş başla, sonra aynı cümleyi biraz daha akıcı söyle.';
};

export const compareTranscripts = (expectedText: string, transcript: string): TranscriptComparison => {
  const expectedTrimmed = expectedText.trim();
  const transcriptTrimmed = transcript.trim();
  const exactMatch = Boolean(expectedTrimmed) && expectedTrimmed === transcriptTrimmed;
  const normalizedExpected = normalizeGermanText(expectedText);
  const normalizedTranscript = normalizeGermanText(transcript);
  const normalizedMatch = Boolean(normalizedExpected) && normalizedExpected === normalizedTranscript;

  const expectedDisplayTokens = tokenize(expectedText);
  const transcriptDisplayTokens = tokenize(transcript);
  const expectedCompareTokens = tokenize(expectedText, { looseEszett: true });
  const transcriptCompareTokens = tokenize(transcript, { looseEszett: true });
  const normalizedExpectedWords = expectedCompareTokens;
  const normalizedTranscriptWords = transcriptCompareTokens;

  if (transcriptCompareTokens.length === 0) {
    const missingWords = [...expectedDisplayTokens];
    const feedbackLevel: SpeechFeedbackLevel = 'noSpeech';
    const retrySuggestionTr = buildRetrySuggestion(feedbackLevel, [], missingWords, []);

    return {
      exactMatch: false,
      normalizedMatch: false,
      normalizedExpectedWords,
      normalizedTranscriptWords,
      missingWords,
      extraWords: [],
      matchedWords: [],
      wordOrderHints: [],
      similarityScore: 0,
      scorePercent: 0,
      similarityBucket: getSimilarityBucket(0),
      feedbackLevel,
      shortFeedbackTr: buildFeedback(0, missingWords, [], [], feedbackLevel),
      retrySuggestionTr,
    };
  }

  const transcriptCounts = new Map<string, number>();

  for (const token of transcriptCompareTokens) {
    transcriptCounts.set(token, (transcriptCounts.get(token) ?? 0) + 1);
  }

  const missingWords: string[] = [];
  const matchedWords: string[] = [];

  expectedCompareTokens.forEach((token, index) => {
    const count = transcriptCounts.get(token) ?? 0;
    const displayToken = expectedDisplayTokens[index] ?? token;

    if (count > 0) {
      matchedWords.push(displayToken);
      transcriptCounts.set(token, count - 1);
      return;
    }

    missingWords.push(displayToken);
  });

  const extraWords: string[] = [];

  transcriptCompareTokens.forEach((token, index) => {
    const count = transcriptCounts.get(token) ?? 0;

    if (count > 0) {
      extraWords.push(transcriptDisplayTokens[index] ?? token);
      transcriptCounts.set(token, count - 1);
    }
  });

  const tokenTotal = expectedCompareTokens.length + transcriptCompareTokens.length;
  const tokenScore = tokenTotal > 0 ? Math.round((matchedWords.length * 2 * 100) / tokenTotal) : 0;
  const baseSimilarityScore = exactMatch || normalizedMatch ? 100 : Math.max(0, Math.min(100, tokenScore));
  const orderedMatchCount = getOrderedMatchCount(expectedCompareTokens, transcriptCompareTokens);
  const hasWordOrderHint =
    !exactMatch &&
    !normalizedMatch &&
    matchedWords.length >= 3 &&
    orderedMatchCount < matchedWords.length &&
    baseSimilarityScore >= 45;
  const wordOrderHints = hasWordOrderHint
    ? ['Kelime sırası biraz karışmış olabilir. Hedef cümleyi aynı sırayla tekrar et.']
    : [];
  const similarityScore = hasWordOrderHint ? Math.min(baseSimilarityScore, 78) : baseSimilarityScore;
  const similarityBucket = getSimilarityBucket(similarityScore);
  const feedbackLevel = getFeedbackLevel(similarityScore, transcriptCompareTokens.length);
  const retrySuggestionTr = buildRetrySuggestion(feedbackLevel, wordOrderHints, missingWords, extraWords);

  return {
    exactMatch,
    normalizedMatch,
    normalizedExpectedWords,
    normalizedTranscriptWords,
    missingWords,
    extraWords,
    matchedWords,
    wordOrderHints,
    similarityScore,
    scorePercent: similarityScore,
    similarityBucket,
    feedbackLevel,
    shortFeedbackTr: buildFeedback(similarityScore, missingWords, extraWords, wordOrderHints, feedbackLevel),
    retrySuggestionTr,
  };
};

export type SimilarityBucket = 'high' | 'medium' | 'low';

export type TranscriptComparison = {
  exactMatch: boolean;
  normalizedMatch: boolean;
  missingWords: string[];
  extraWords: string[];
  matchedWords: string[];
  similarityScore: number;
  similarityBucket: SimilarityBucket;
  shortFeedbackTr: string;
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

const buildFeedback = (
  similarityScore: number,
  missingWords: string[],
  extraWords: string[],
) => {
  if (similarityScore >= 80) {
    return 'Cümlen hedefe çok yakın. Şimdi daha akıcı söylemeyi dene.';
  }

  if (missingWords.length > 0) {
    return 'Bazı kelimeler eksik duyuldu: ' + formatWordList(missingWords) + '.';
  }

  if (extraWords.length > 0) {
    return 'Ekstra kelimeler duyuldu: ' + formatWordList(extraWords) + '.';
  }

  return 'Cümle hedef cümleden farklı duyuldu. Yavaşça tekrar dene.';
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
  const similarityScore = exactMatch || normalizedMatch ? 100 : Math.max(0, Math.min(100, tokenScore));
  const similarityBucket = getSimilarityBucket(similarityScore);

  return {
    exactMatch,
    normalizedMatch,
    missingWords,
    extraWords,
    matchedWords,
    similarityScore,
    similarityBucket,
    shortFeedbackTr: buildFeedback(similarityScore, missingWords, extraWords),
  };
};

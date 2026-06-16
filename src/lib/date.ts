export const getLocalDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
};

export const addLocalDays = (dateKey: string, days: number): string => {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
};

export const getYesterdayDateKey = (date = new Date()): string => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
};

export const updateStudyStreak = (
  currentStreak: number,
  lastStudyDate?: string,
  now = new Date(),
) => {
  const today = getLocalDateKey(now);
  const yesterday = getYesterdayDateKey(now);

  if (lastStudyDate === today) {
    return {
      streak: currentStreak,
      lastStudyDate: today,
    };
  }

  if (lastStudyDate === yesterday) {
    return {
      streak: currentStreak + 1,
      lastStudyDate: today,
    };
  }

  return {
    streak: 1,
    lastStudyDate: today,
  };
};

export const isDueOnOrBefore = (dateKey: string, compareDateKey = getLocalDateKey()) =>
  parseLocalDateKey(dateKey).getTime() <= parseLocalDateKey(compareDateKey).getTime();

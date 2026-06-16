export const colors = {
  deepViolet: '#1E1B3A',
  royalPurple: '#5B45F6',
  lavender: '#E9E6FF',
  yellow: '#FFC43D',
  green: '#2DBE73',
  red: '#EF5B5B',
  white: '#FFFFFF',
  ink: '#151322',
  muted: '#6F6A86',
  border: '#DED8FF',
  surface: '#F8F7FF',
  surfaceStrong: '#F0EDFF',
  gradientStart: '#7C5CFF',
  gradientEnd: '#4B37D1',
  articleDer: '#4B8DFF',
  articleDie: '#EF5B9C',
  articleDas: '#22B573',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
};

export const articleColors = {
  der: colors.articleDer,
  die: colors.articleDie,
  das: colors.articleDas,
};

export const articleLightColors = {
  der: '#A7CBFF',
  die: '#FFB9CB',
  das: '#9FF0C8',
};

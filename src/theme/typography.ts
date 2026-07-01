import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const typography = {
  title: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
  },
  heading: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800' as const,
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500' as const,
  },
  small: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  micro: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800' as const,
  },
};

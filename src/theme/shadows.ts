import { colors } from './colors';

export const shadows = {
  none: {},
  soft: {
    elevation: 2,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  card: {
    elevation: 4,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  lift: {
    elevation: 8,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
};

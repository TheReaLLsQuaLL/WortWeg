import { colors } from './colors';

export const shadows = {
  none: {},
  comic: {
    elevation: 4,
    shadowColor: colors.comicBorderColor,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  comicSmall: {
    elevation: 2,
    shadowColor: colors.comicBorderColor,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  soft: {
    elevation: 4,
    shadowColor: colors.comicBorderColor,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  card: {
    elevation: 5,
    shadowColor: colors.comicBorderColor,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  lift: {
    elevation: 7,
    shadowColor: colors.comicBorderColor,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
};

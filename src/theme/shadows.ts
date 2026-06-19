import { colors } from './colors';

export const shadows = {
  none: {},
  comic: {
    elevation: 5,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  comicSmall: {
    elevation: 3,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.95,
    shadowRadius: 0,
  },
  comicLift: {
    elevation: 7,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  paper: {
    elevation: 2,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  soft: {
    elevation: 3,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  card: {
    elevation: 5,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  lift: {
    elevation: 8,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
};

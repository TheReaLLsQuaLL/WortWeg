import { colors } from './colors';

export const shadows = {
  none: {},
  comic: {
    elevation: 4,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  comicSmall: {
    elevation: 2,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  comicLift: {
    elevation: 5,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  paper: {
    elevation: 3,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  soft: {
    elevation: 4,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  card: {
    elevation: 6,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: colors.comicShadowOffset, height: colors.comicShadowOffset },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  lift: {
    elevation: 5,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
};

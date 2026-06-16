export { curriculumLevels, curriculumLevelOrder, getLevelById } from './levels';
export { curriculumTracks, balancedSkillWeights, getTrackById } from './tracks';
export { modulesA0 } from './modules.a0';
export { modulesA1 } from './modules.a1';
export { modulesA2 } from './modules.a2';
export { modulesB1 } from './modules.b1';
export { modulesB2 } from './modules.b2';
export { modulesC1Placeholder } from './modules.c1.placeholder';
export { modulesC2Placeholder } from './modules.c2.placeholder';

import type { CurriculumLevelId } from '../../types/curriculum';
import { modulesA0 } from './modules.a0';
import { modulesA1 } from './modules.a1';
import { modulesA2 } from './modules.a2';
import { modulesB1 } from './modules.b1';
import { modulesB2 } from './modules.b2';
import { modulesC1Placeholder } from './modules.c1.placeholder';
import { modulesC2Placeholder } from './modules.c2.placeholder';

export const curriculumModules = [
  ...modulesA0,
  ...modulesA1,
  ...modulesA2,
  ...modulesB1,
  ...modulesB2,
  ...modulesC1Placeholder,
  ...modulesC2Placeholder,
];

export const getModulesForLevel = (levelId: CurriculumLevelId) =>
  curriculumModules
    .filter((module) => module.level === levelId)
    .sort((a, b) => a.order - b.order);

export const getModuleById = (moduleId: string) =>
  curriculumModules.find((module) => module.id === moduleId);

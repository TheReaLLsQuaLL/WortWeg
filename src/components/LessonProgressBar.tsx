import { colors } from '../data/theme';
import { ComicProgressBar } from './ComicProgressBar';

type LessonProgressBarProps = {
  current: number;
  total: number;
};

export function LessonProgressBar({ current, total }: LessonProgressBarProps) {
  return (
    <ComicProgressBar
      current={current}
      fillColor={colors.yellowCta}
      label={current + '/' + total}
      total={total}
    />
  );
}

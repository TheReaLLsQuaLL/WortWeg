import type { ComponentProps } from 'react';

import { AppButton } from './AppButton';

type ComicButtonProps = ComponentProps<typeof AppButton>;

export function ComicButton(props: ComicButtonProps) {
  return <AppButton {...props} />;
}

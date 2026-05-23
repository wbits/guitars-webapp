import type { Guitar } from '@/domain/guitar';

type GuitarWithPictures = Pick<Guitar, 'pictures' | 'coverPictureIndex'>;

/** Returns the URL shown on the overview grid, or null when no pictures exist. */
export const coverPictureUrl = (guitar: GuitarWithPictures): string | null => {
  if (guitar.pictures.length === 0) {
    return null;
  }
  const index = guitar.coverPictureIndex ?? 0;
  if (index >= 0 && index < guitar.pictures.length) {
    return guitar.pictures[index];
  }
  return guitar.pictures[0];
};

export const formatGuitarCaption = (
  guitar: Pick<Guitar, 'brand' | 'typeName' | 'buildYear'>,
): string => `${guitar.brand} ${guitar.typeName} (${guitar.buildYear})`;

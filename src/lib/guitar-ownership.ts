import type { Guitar } from '@/domain/guitar';

export const isGuitarInCollection = (
  guitarId: string,
  collection: Pick<Guitar, 'id'>[] | undefined,
): boolean => Boolean(collection?.some((item) => item.id === guitarId));

/** Whether the current user may edit a guitar on their own collection routes. */
export const canEditGuitar = (input: {
  guitar: Pick<Guitar, 'id' | 'owner'>;
  isOwnCollectionView: boolean;
  currentUserId?: string | null;
  myCollection?: Pick<Guitar, 'id'>[];
}): boolean => {
  const { guitar, isOwnCollectionView, currentUserId, myCollection } = input;
  if (!isOwnCollectionView) return false;

  if (!guitar.owner) return true;

  if (currentUserId && guitar.owner === currentUserId) return true;

  return isGuitarInCollection(guitar.id, myCollection);
};

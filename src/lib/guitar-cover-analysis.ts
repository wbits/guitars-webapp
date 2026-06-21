/** Returns a stable key for the guitar cover selection (index + URL). */
export const coverPictureKey = (input: {
  pictures: string[];
  coverPictureIndex: number;
}): string => {
  const url = input.pictures[input.coverPictureIndex]?.trim() ?? '';
  return `${input.coverPictureIndex}\n${url}`;
};

/** True when the cover picture selection changed between two guitar states. */
export const coverPictureChanged = (
  before: { pictures: string[]; coverPictureIndex: number },
  after: { pictures: string[]; coverPictureIndex: number },
): boolean => coverPictureKey(before) !== coverPictureKey(after);

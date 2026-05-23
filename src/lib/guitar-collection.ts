import type { Guitar } from '@/domain/guitar';

export const sortGuitarsForCollection = (guitars: Guitar[]): Guitar[] =>
  [...guitars].sort((a, b) =>
    a.brand.localeCompare(b.brand, undefined, { sensitivity: 'base' }),
  );

export const getGuitarNeighbors = (
  guitars: Guitar[],
  id: string,
): { previous: Guitar | null; next: Guitar | null } => {
  const sorted = sortGuitarsForCollection(guitars);
  const index = sorted.findIndex((guitar) => guitar.id === id);
  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
};

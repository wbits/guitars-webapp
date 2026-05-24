import { describe, expect, it } from 'vitest';
import { canEditGuitar, isGuitarInCollection } from './guitar-ownership';

describe('guitar ownership', () => {
  const guitar = { id: 'g-1', owner: 'local-dev-user' };

  it('detects membership in a collection list', () => {
    expect(isGuitarInCollection('g-1', [{ id: 'g-1' }, { id: 'g-2' }])).toBe(true);
    expect(isGuitarInCollection('g-3', [{ id: 'g-1' }])).toBe(false);
  });

  it('allows edit when the guitar is in the caller collection list', () => {
    expect(
      canEditGuitar({
        guitar,
        isOwnCollectionView: true,
        myCollection: [{ id: 'g-1' }],
      }),
    ).toBe(true);
  });

  it('allows edit when profile user id matches owner', () => {
    expect(
      canEditGuitar({
        guitar,
        isOwnCollectionView: true,
        currentUserId: 'local-dev-user',
      }),
    ).toBe(true);
  });

  it('allows claiming legacy guitars without an owner', () => {
    expect(
      canEditGuitar({
        guitar: { id: 'g-1', owner: undefined },
        isOwnCollectionView: true,
      }),
    ).toBe(true);
  });

  it('denies edit on another user collection view', () => {
    expect(
      canEditGuitar({
        guitar,
        isOwnCollectionView: false,
        currentUserId: 'local-dev-user',
        myCollection: [{ id: 'g-1' }],
      }),
    ).toBe(false);
  });

  it('denies edit when owner differs and guitar is not in caller list', () => {
    expect(
      canEditGuitar({
        guitar: { id: 'g-1', owner: 'someone-else' },
        isOwnCollectionView: true,
        currentUserId: 'local-dev-user',
        myCollection: [{ id: 'g-2' }],
      }),
    ).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  formatCollectionHeading,
  formatCollectionLabel,
  guitarPath,
  userCollectionPath,
} from './collection-routes';

describe('collection-routes', () => {
  it('builds user collection guitar paths', () => {
    expect(guitarPath('g-1', 'user-2')).toBe('/collections/user-2/g-1');
    expect(guitarPath('g-1')).toBe('/guitars/g-1');
    expect(userCollectionPath('user-2')).toBe('/collections/user-2');
  });

  it('formats collection labels', () => {
    expect(formatCollectionLabel('abc', 'abc')).toBe('My collection');
    expect(formatCollectionLabel('user-2', 'abc', 'Dick')).toBe('Dick');
    expect(formatCollectionLabel('local-dev-user')).toBe('Local dev user');
    expect(formatCollectionLabel('0123456789abcdef')).toBe('01234567…');
  });

  it('formats collection headings', () => {
    expect(formatCollectionHeading('user-2', 'Dick')).toBe("Dick's collection");
    expect(formatCollectionHeading('user-2', 'dick@example.com')).toBe("dick@example.com's collection");
  });
});

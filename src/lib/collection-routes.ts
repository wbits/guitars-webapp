export const myCollectionPath = (): string => '/guitars';

export const userCollectionPath = (userId: string): string =>
  `/collections/${encodeURIComponent(userId)}`;

export const guitarPath = (id: string, collectionUserId?: string): string =>
  collectionUserId
    ? `${userCollectionPath(collectionUserId)}/${encodeURIComponent(id)}`
    : `/guitars/${encodeURIComponent(id)}`;

export const guitarEditPath = (id: string): string => `/guitars/${encodeURIComponent(id)}/edit`;

export const profilePath = (): string => '/profile';

export const formatCollectionLabel = (
  userId: string,
  currentUserId?: string,
  displayName?: string,
): string => {
  if (currentUserId && userId === currentUserId) {
    return 'My collection';
  }
  if (displayName) {
    return displayName;
  }
  if (userId === 'local-dev-user') {
    return 'Local dev user';
  }
  if (userId.length > 12) {
    return `${userId.slice(0, 8)}…`;
  }
  return userId;
};

export const formatCollectionHeading = (
  userId: string,
  displayName?: string,
): string => {
  const label = displayName ?? formatCollectionLabel(userId);
  return `${label}'s collection`;
};

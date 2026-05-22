const trimEnv = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export const cognitoRegion = (): string | null => trimEnv(import.meta.env.VITE_COGNITO_REGION);

export const cognitoUserPoolId = (): string | null =>
  trimEnv(import.meta.env.VITE_COGNITO_USER_POOL_ID);

export const cognitoClientId = (): string | null =>
  trimEnv(import.meta.env.VITE_COGNITO_CLIENT_ID);

/** True when all Cognito env vars needed for sign-up and sign-in are set. */
export const isCognitoEnabled = (): boolean =>
  cognitoRegion() !== null && cognitoUserPoolId() !== null && cognitoClientId() !== null;

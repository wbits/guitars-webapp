import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('cognito-config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is disabled when Cognito env vars are missing', async () => {
    const { isCognitoEnabled } = await import('./cognito-config');
    expect(isCognitoEnabled()).toBe(false);
  });

  it('is enabled when region, pool id, and client id are set', async () => {
    vi.stubEnv('VITE_COGNITO_REGION', 'eu-central-1');
    vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'eu-central-1_ABC123');
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client-id');
    const { isCognitoEnabled } = await import('./cognito-config');
    expect(isCognitoEnabled()).toBe(true);
  });
});

describe('cognitoErrorMessage', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('maps known Cognito error codes', async () => {
    const { cognitoErrorMessage } = await import('./cognito-auth');
    expect(
      cognitoErrorMessage(Object.assign(new Error('bad'), { code: 'NotAuthorizedException' })),
    ).toBe('Incorrect email or password.');
  });
});

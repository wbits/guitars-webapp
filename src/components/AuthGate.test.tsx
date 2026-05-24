import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from './AuthGate';

vi.mock('@/lib/cognito-config', () => ({
  isCognitoEnabled: vi.fn(() => false),
}));

vi.mock('@/lib/cognito-auth', () => ({
  refreshSessionToken: vi.fn(() => new Promise(() => {})),
}));

describe('AuthGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders children immediately when a build-time bearer token is configured', () => {
    vi.stubEnv('VITE_GUITARS_BEARER_TOKEN', 'local-dev-token');

    render(
      <MemoryRouter>
        <AuthGate>
          <p>Collection</p>
        </AuthGate>
      </MemoryRouter>,
    );

    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.queryByText(/Checking sign-in status/i)).not.toBeInTheDocument();
  });

  it('stops checking and shows sign-in when Cognito session restore hangs', async () => {
    vi.stubEnv('VITE_GUITARS_BEARER_TOKEN', '');
    vi.useFakeTimers();
    const { isCognitoEnabled } = await import('@/lib/cognito-config');
    vi.mocked(isCognitoEnabled).mockReturnValue(true);

    render(
      <MemoryRouter>
        <AuthGate>
          <p>Collection</p>
        </AuthGate>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Checking sign-in status/i)).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(8000);

    expect(screen.queryByText(/Checking sign-in status/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Sign in required/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});

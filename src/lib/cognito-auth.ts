import type {
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { cognitoClientId, cognitoUserPoolId, isCognitoEnabled } from '@/lib/cognito-config';
import { clearRuntimeToken, setRuntimeToken } from '@/lib/token';

type CognitoModule = typeof import('amazon-cognito-identity-js');

let cognitoModule: CognitoModule | null = null;
let userPool: CognitoUserPool | null = null;

const loadCognito = async (): Promise<CognitoModule> => {
  if (cognitoModule) return cognitoModule;

  const { Buffer } = await import('buffer');
  if (!globalThis.Buffer) {
    globalThis.Buffer = Buffer;
  }

  cognitoModule = await import('amazon-cognito-identity-js');
  return cognitoModule;
};

const getUserPool = async (): Promise<CognitoUserPool> => {
  if (!isCognitoEnabled()) {
    throw new Error('Cognito is not configured');
  }
  if (!userPool) {
    const { CognitoUserPool } = await loadCognito();
    userPool = new CognitoUserPool({
      UserPoolId: cognitoUserPoolId()!,
      ClientId: cognitoClientId()!,
    });
  }
  return userPool;
};

const storeAccessToken = (session: CognitoUserSession): string => {
  const token = session.getAccessToken().getJwtToken();
  setRuntimeToken(token);
  return token;
};

export const signUp = async (email: string, password: string): Promise<void> => {
  const { CognitoUserAttribute } = await loadCognito();
  const pool = await getUserPool();
  await new Promise<void>((resolve, reject) => {
    pool.signUp(
      email.trim(),
      password,
      [new CognitoUserAttribute({ Name: 'email', Value: email.trim() })],
      [],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
};

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  const { CognitoUser } = await loadCognito();
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email.trim(), Pool: pool });
  await new Promise<void>((resolve, reject) => {
    user.confirmRegistration(code.trim(), true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const resendConfirmationCode = async (email: string): Promise<void> => {
  const { CognitoUser } = await loadCognito();
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email.trim(), Pool: pool });
  await new Promise<void>((resolve, reject) => {
    user.resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const signIn = async (email: string, password: string): Promise<string> => {
  const { AuthenticationDetails, CognitoUser } = await loadCognito();
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email.trim(), Pool: pool });
  const authDetails = new AuthenticationDetails({
    Username: email.trim(),
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(storeAccessToken(session)),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error('A new password is required. Contact an administrator.'));
      },
    });
  });
};

export const signOut = async (): Promise<void> => {
  if (!isCognitoEnabled()) {
    clearRuntimeToken();
    return;
  }

  const pool = await getUserPool();
  const user = pool.getCurrentUser();
  if (user) user.signOut();
  clearRuntimeToken();
};

export const refreshSessionToken = async (): Promise<string | null> => {
  if (!isCognitoEnabled()) {
    return null;
  }

  const pool = await getUserPool();
  const user = pool.getCurrentUser();
  if (!user) {
    return null;
  }

  return new Promise((resolve) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        clearRuntimeToken();
        resolve(null);
        return;
      }
      resolve(storeAccessToken(session));
    });
  });
};

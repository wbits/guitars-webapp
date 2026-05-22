import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { cognitoClientId, cognitoUserPoolId, isCognitoEnabled } from '@/lib/cognito-config';
import { clearRuntimeToken, setRuntimeToken } from '@/lib/token';

let userPool: CognitoUserPool | null = null;

const getUserPool = (): CognitoUserPool => {
  if (!isCognitoEnabled()) {
    throw new Error('Cognito is not configured');
  }
  if (!userPool) {
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

export const cognitoErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    const e = err as Error & { code?: string };
    switch (e.code ?? e.name) {
      case 'UserNotConfirmedException':
        return 'Please confirm your email before signing in.';
      case 'NotAuthorizedException':
        return 'Incorrect email or password.';
      case 'UsernameExistsException':
        return 'An account with this email already exists.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements.';
      case 'CodeMismatchException':
        return 'Invalid verification code.';
      case 'ExpiredCodeException':
        return 'Verification code has expired. Request a new one.';
      case 'InvalidParameterException':
        return e.message || 'Invalid input.';
      default:
        return e.message || 'Something went wrong.';
    }
  }
  return 'Something went wrong.';
};

export const signUp = (email: string, password: string): Promise<void> =>
  new Promise((resolve, reject) => {
    getUserPool().signUp(
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

export const confirmSignUp = (email: string, code: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email.trim(), Pool: getUserPool() });
    user.confirmRegistration(code.trim(), true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const resendConfirmationCode = (email: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email.trim(), Pool: getUserPool() });
    user.resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const signIn = (email: string, password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email.trim(), Pool: getUserPool() });
    const authDetails = new AuthenticationDetails({
      Username: email.trim(),
      Password: password,
    });
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(storeAccessToken(session)),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error('A new password is required. Contact an administrator.'));
      },
    });
  });

export const signOut = (): void => {
  const user = getUserPool().getCurrentUser();
  if (user) user.signOut();
  clearRuntimeToken();
};

export const refreshSessionToken = (): Promise<string | null> =>
  new Promise((resolve) => {
    if (!isCognitoEnabled()) {
      resolve(null);
      return;
    }

    const user = getUserPool().getCurrentUser();
    if (!user) {
      resolve(null);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        clearRuntimeToken();
        resolve(null);
        return;
      }
      resolve(storeAccessToken(session));
    });
  });

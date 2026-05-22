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

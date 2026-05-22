import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  confirmSignUp,
  resendConfirmationCode,
  signUp,
} from '@/lib/cognito-auth';
import { cognitoErrorMessage } from '@/lib/cognito-errors';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { hasToken } from '@/lib/token';

const passwordSchema = z
  .string()
  .min(12, 'At least 12 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

const registerSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterValues, string>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isCognitoEnabled()) {
    return (
      <section className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-slate-600">
          Cognito is not configured for this build. Use the{' '}
          <Link to="/settings" className="font-medium text-slate-900 underline">
            Settings
          </Link>{' '}
          page to configure a bearer token for local development.
        </p>
      </section>
    );
  }

  if (hasToken()) {
    return <Navigate to="/guitars" replace />;
  }

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const next: Partial<Record<keyof RegisterValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in next)) {
          next[key as keyof RegisterValues] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(parsed.data.email, parsed.data.password);
      setEmail(parsed.data.email);
      setPassword('');
      setConfirmPassword('');
      setStep('confirm');
      setInfo('Check your email for a verification code.');
    } catch (err) {
      setError(cognitoErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const submitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await confirmSignUp(email, code);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(cognitoErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await resendConfirmationCode(email);
      setInfo('A new verification code has been sent.');
    } catch (err) {
      setError(cognitoErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'confirm') {
    return (
      <section className="mx-auto max-w-md space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Confirm email</h1>
          <p className="text-sm text-slate-600">
            Enter the verification code sent to <span className="font-medium">{email}</span>.
          </p>
        </header>

        {info ? (
          <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900">
            {info}
          </div>
        ) : null}

        <form
          onSubmit={submitConfirm}
          className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="confirm-code" className="label">
              Verification code
            </label>
            <input
              id="confirm-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Confirming…' : 'Confirm account'}
          </button>

          <button
            type="button"
            className="btn-secondary w-full"
            disabled={submitting}
            onClick={resend}
          >
            Resend code
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          <button
            type="button"
            className="font-medium text-slate-900 underline"
            onClick={() => setStep('register')}
          >
            Back to registration
          </button>
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-slate-600">
          Create a Cognito account to access the guitar collection API.
        </p>
      </header>

      <form
        onSubmit={submitRegister}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="register-email" className="label">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email ? <p className="error-text">{fieldErrors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="register-password" className="label">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="help">
            At least 12 characters with uppercase, lowercase, and a number.
          </p>
          {fieldErrors.password ? <p className="error-text">{fieldErrors.password}</p> : null}
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="label">
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {fieldErrors.confirmPassword ? (
            <p className="error-text">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </section>
  );
};

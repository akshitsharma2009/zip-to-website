import { useState, type FormEvent } from 'react';
import { useRouter } from '@tanstack/react-router';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/envoke/ui/Button';
import { Input } from '@/components/envoke/ui/Input';
import { Checkbox } from '@/components/envoke/ui/Checkbox';
import { APP_NAME } from '@/lib/envoke-constants';

type Mode = 'login' | 'signup';

interface FieldErrors {
  email?: string;
  password?: string;
  age?: string;
  terms?: string;
  form?: string;
}

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, loading } = useAuth();
  const navigate = useRouter().navigate;
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // A signed-in visitor (e.g. returning from Google sign-in) goes straight
  // to the dashboard instead of seeing the signup form again.
  if (!loading && user) {
    navigate({ to: '/dashboard', replace: true });
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!email) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (mode === 'signup') {
      if (!ageConfirmed) next.age = 'You must confirm you are 18 or older';
      if (!termsConfirmed) next.terms = 'You must agree to the Terms, Privacy Policy, and Community Guidelines';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    const params = { email, password };
    const result =
      mode === 'signup' ? await signUpWithEmail(params) : await signInWithEmail(params);

    setSubmitting(false);
    if (result.error) {
      setErrors({ form: result.error.message });
    } else if (mode === 'login') {
      navigate({ to: '/dashboard' });
    }
    // After signup, the email-confirmation flow takes over; the form shows
    // no error so the visitor knows the request went through.
    if (mode === 'signup' && !result.error) {
      setErrors({});
    }
  };

  const handleGoogle = async () => {
    if (mode === 'signup') {
      if (!ageConfirmed || !termsConfirmed) {
        setErrors({
          age: !ageConfirmed ? 'You must confirm you are 18 or older' : '',
          terms: !termsConfirmed ? 'You must agree to the Terms, Privacy Policy, and Community Guidelines' : '',
        });
        return;
      }
    }
    setGoogleLoading(true);
    setErrors({});
    const result = await signInWithGoogle();
    if (result.error) {
      setGoogleLoading(false);
      setErrors({ form: result.error.message });
    }
  };

  const linkClass = 'text-brass hover:text-brass-hover underline underline-offset-2 transition-colors';

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Wordmark + tagline */}
        <div className="text-center mb-10">
          <h1
            className="font-serif text-4xl font-semibold text-cream tracking-tight animate-fade-up"
            style={{ animationDelay: '0s' }}
          >
            {APP_NAME}
          </h1>
          <p
            className="font-serif italic text-meta-light mt-2 text-lg animate-fade-up"
            style={{ animationDelay: '0.12s' }}
          >
            Every song remembers something.
          </p>
        </div>

        {/* Form card */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '0.24s' }}
        >
          {/* Heading */}
          <h2 className="font-serif text-2xl text-cream mb-1.5">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-meta-light mb-8">
            {mode === 'signup'
              ? 'Join Envoke to write and share memories about the songs you love.'
              : 'Sign in to continue to your account.'}
          </p>

          {errors.form && (
            <div className="mb-6 flex items-start gap-3 rounded-btn border border-error/20 bg-error/5 px-4 py-3">
              <AlertCircle className="w-5 h-5 text-error/80 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error/90">{errors.form}</p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || submitting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-btn bg-panel text-cream font-medium text-sm hover:bg-panel/70 border border-cream/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-cream/10" />
            <span className="text-xs text-meta-light/60 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-cream/10" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            {mode === 'signup' && (
              <div className="space-y-4 pt-1">
                <Checkbox
                  id="age-confirm"
                  name="age-confirm"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  label="I am 18 or older"
                  error={errors.age}
                />
                <Checkbox
                  id="terms-confirm"
                  name="terms-confirm"
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  label={
                    <>
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className={linkClass}>
                        Terms &amp; Conditions
                      </a>
                      ,{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                        Privacy Policy
                      </a>
                      , and{' '}
                      <a href="/community-guidelines" target="_blank" rel="noopener noreferrer" className={linkClass}>
                        Community Guidelines
                      </a>
                    </>
                  }
                  error={errors.terms}
                />
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'signup' ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-meta-light">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-brass hover:text-brass-hover font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-brass hover:text-brass-hover font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

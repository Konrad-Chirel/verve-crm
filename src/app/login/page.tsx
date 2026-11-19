'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { VerveAuthBrand, VerveAuthShowcase } from '@/components/layout/auth-showcase';
import { useCRM } from '@/context/crm-context';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

type Mode = 'login' | 'reset';

function getSafeRedirect(raw: string | null, fallback = '/dashboard'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\x00-\x1f\x7f]/.test(trimmed)
  ) {
    return fallback;
  }
  try {
    const parsed = new URL(trimmed, 'https://verve.invalid');
    if (parsed.origin !== 'https://verve.invalid') return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, enableDemoMode, theme, toggleTheme } = useCRM();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'no_account') {
      setError("Aucun compte n'est associé à ce compte Google. Créez d'abord votre espace.");
      router.replace('/login');
    } else if (err === 'auth-code-error') {
      setError("La connexion a échoué. Réessayez.");
      router.replace('/login');
    }
  }, [searchParams, router]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setResetSent(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Renseignez votre e-mail et votre mot de passe.');
      return;
    }

    if (!supabase) {
      enableDemoMode();
      router.push('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'E-mail ou mot de passe incorrect.'
            : authError.message === 'Email not confirmed'
            ? 'Confirmez votre adresse e-mail avant de vous connecter.'
            : authError.message
        );
        setIsLoading(false);
        return;
      }

      document.cookie = 'verve_demo_mode=; path=/; max-age=0; SameSite=Lax';
      showToast('Connexion réussie');
      router.push(getSafeRedirect(searchParams.get('redirect')));
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'La connexion a échoué. Réessayez.');
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Renseignez l’e-mail de votre compte.');
      return;
    }
    if (!supabase) {
      setError('La réinitialisation nécessite un compte cloud. Utilisez la démo pour tester.');
      return;
    }
    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?flow=login`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err?.message || 'L’envoi a échoué. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    if (!supabase) {
      setError('Google n’est pas configuré ici. Utilisez la démo pour tester.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=login`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'La connexion Google a échoué.');
      setIsGoogleLoading(false);
    }
  };

  const handleEnterDemo = () => {
    enableDemoMode();
    showToast('Démo ouverte : cabinet Atelier Nova');
    router.push('/dashboard');
  };

  const detectCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  };

  const inputWrap =
    'relative flex items-center bg-white rounded-lg border border-[#E4E7EC] transition-colors hover:border-[#D0D5DD] focus-within:border-[#047857] focus-within:ring-4 focus-within:ring-[#047857]/10';
  const inputCls =
    'w-full h-11 bg-transparent pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none';

  return (
    <main className="min-h-screen flex bg-[#F7F8F7] text-[#111827]">
      <VerveAuthShowcase variant="login" />

      <section className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 h-16 sm:h-20 shrink-0">
          <div className="lg:hidden min-w-0">
            <VerveAuthBrand />
          </div>
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Retour à l’accueil</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Accueil</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Changer de thème"
              className="w-9 h-9 rounded-lg bg-white border border-[#E4E7EC] hover:border-[#D0D5DD] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#34D399]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-4 sm:pt-0 pb-12">
          <div className="w-full max-w-[380px]">
            <header className="mb-6 sm:mb-7">
              <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
                {mode === 'login' ? 'Bon retour' : 'Mot de passe oublié'}
              </h2>
              <p className="mt-1.5 text-sm text-[#4B5563]">
                {mode === 'login'
                  ? 'Connectez-vous pour retrouver votre pipeline.'
                  : 'Indiquez votre e-mail, nous vous envoyons un lien pour en choisir un nouveau.'}
              </p>
            </header>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[13px] text-[#BE123C]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <>
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  disabled={isGoogleLoading}
                  className="h-11 w-full rounded-lg bg-white border border-[#E4E7EC] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] text-[#111827] font-semibold text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>Continuer avec Google</span>
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#E4E7EC]" />
                  <span className="text-xs text-[#6B7280]">ou par e-mail</span>
                  <div className="flex-1 h-px bg-[#E4E7EC]" />
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#111827]" htmlFor="email">
                      E-mail
                    </label>
                    <div className={inputWrap}>
                      <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                      <input
                        className={inputCls}
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="vous@cabinet.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#111827]" htmlFor="password">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-xs font-medium text-[#047857] hover:underline cursor-pointer"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className={inputWrap}>
                      <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                      <input
                        className={`${inputCls} pr-11`}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={detectCaps}
                        onKeyDown={detectCaps}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        className="absolute right-2 w-8 h-8 rounded-md text-[#6B7280] hover:text-[#111827] flex items-center justify-center cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {capsLock && (
                      <p className="text-[11px] font-medium text-[#B45309]">Verrouillage majuscule activé</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-1 h-11 w-full rounded-lg btn-primary font-semibold text-sm disabled:opacity-70 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isLoading ? 'Connexion…' : 'Se connecter'}</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleEnterDemo}
                  className="mt-3 h-11 w-full rounded-lg border border-dashed border-[#D0D5DD] hover:border-[#047857] text-sm font-medium text-[#4B5563] hover:text-[#047857] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Explorer la démo sans compte</span>
                </button>

                <p className="mt-7 text-center text-sm text-[#4B5563]">
                  Pas encore de compte ?
                  <Link href="/register" className="text-[#047857] hover:underline font-semibold ml-1.5">
                    Créer un espace
                  </Link>
                </p>
              </>
            ) : resetSent ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                  <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#111827]">
                    <p className="font-semibold">Lien envoyé</p>
                    <p className="mt-1 text-[#4B5563]">
                      Si un compte existe pour <strong className="text-[#111827]">{email.trim()}</strong>, un e-mail
                      de réinitialisation vient de partir. Pensez à vérifier vos spams.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="h-11 w-full rounded-lg btn-primary font-semibold text-sm cursor-pointer"
                >
                  Revenir à la connexion
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleReset} noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111827]" htmlFor="reset-email">
                    E-mail du compte
                  </label>
                  <div className={inputWrap}>
                    <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                    <input
                      className={inputCls}
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="vous@cabinet.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 h-11 w-full rounded-lg btn-primary font-semibold text-sm disabled:opacity-70 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? 'Envoi…' : 'Envoyer le lien'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Revenir à la connexion</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

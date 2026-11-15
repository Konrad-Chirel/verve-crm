'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Play, Sun, Moon } from 'lucide-react';
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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, enableDemoMode, theme, toggleTheme } = useCRM();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no_account') {
      showToast("Aucun compte associé à cet e-mail Google. Créez d'abord votre compte.");
      router.replace('/login');
    } else if (error === 'auth-code-error') {
      showToast("Erreur d'authentification. Veuillez réessayer.");
      router.replace('/login');
    }
  }, [searchParams, router, showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    if (!supabase) {
      enableDemoMode();
      router.push('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        showToast(
          error.message === 'Invalid login credentials'
            ? 'Identifiants incorrects. Vérifiez votre e-mail ou mot de passe.'
            : error.message
        );
        setIsLoading(false);
        return;
      }

      document.cookie = 'verve_demo_mode=; path=/; max-age=0; SameSite=Lax';
      showToast('Connexion réussie — Bienvenue sur Verve CRM');
      const rawRedirect = searchParams.get('redirect') || '/dashboard';
      const safeRedirect =
        rawRedirect.startsWith('/') &&
        !rawRedirect.startsWith('//') &&
        !rawRedirect.startsWith('/\\') &&
        !rawRedirect.includes('@') &&
        !rawRedirect.includes('\\') &&
        !rawRedirect.includes(':')
          ? rawRedirect
          : '/dashboard';
      router.push(safeRedirect);
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la connexion');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      showToast('Configurez Supabase ou utilisez le mode démonstration.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=login`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        showToast(error.message);
      }
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la connexion Google');
    }
  };

  const handleEnterDemo = () => {
    enableDemoMode();
    showToast('Mode démonstration activé (Atelier Nova)');
    router.push('/dashboard');
  };

  const inputWrap =
    'relative flex items-center bg-white rounded-lg border border-[#E4E7EC] transition-colors hover:border-[#D0D5DD] focus-within:border-[#047857] focus-within:ring-4 focus-within:ring-[#047857]/10';
  const inputCls =
    'w-full h-11 bg-transparent pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none';

  return (
    <main className="min-h-screen flex bg-[#F7F8F7] text-[#111827]">
      <VerveAuthShowcase variant="login" />

      <section className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-16 sm:h-20">
          <div className="lg:hidden">
            <VerveAuthBrand />
          </div>
          <div className="hidden lg:block text-xs font-medium text-[#6B7280]">
            Espace Associés &amp; Directeurs de clientèle
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Basculer le thème"
              className="w-8 h-8 rounded-lg bg-white border border-[#E4E7EC] hover:border-[#047857] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer shadow-2xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#34D399]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleEnterDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:border-[#047857] text-xs font-semibold text-[#047857] transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Accès démo direct</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-[390px]">
            <header className="mb-7">
              <h2 className="font-display text-[26px] font-bold tracking-tight text-[#111827] leading-tight">
                Connexion
              </h2>
              <p className="mt-1.5 text-sm text-[#4B5563]">
                Accédez au registre commercial de votre cabinet.
              </p>
            </header>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="h-11 w-full rounded-lg bg-white border border-[#E4E7EC] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] text-[#111827] font-semibold text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E4E7EC]" />
              <span className="text-xs text-[#6B7280]">ou avec votre e-mail</span>
              <div className="flex-1 h-px bg-[#E4E7EC]" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111827]" htmlFor="email">
                  Adresse e-mail professionnelle
                </label>
                <div className={inputWrap}>
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                  <input
                    className={inputCls}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="associe@ateliernova.fr"
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
                    onClick={handleEnterDemo}
                    className="text-xs font-medium text-[#047857] hover:underline cursor-pointer"
                  >
                    Tester avec le compte démo
                  </button>
                </div>
                <div className={inputWrap}>
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                  <input
                    className={`${inputCls} pr-10`}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    className="absolute right-2.5 w-7 h-7 rounded-md text-[#6B7280] hover:text-[#111827] flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 h-11 w-full rounded-lg btn-primary font-semibold text-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Connexion en cours…' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#4B5563]">
              Nouveau cabinet sur Verve ?
              <Link
                href="/register"
                className="text-[#047857] hover:underline font-semibold ml-1.5"
              >
                Créer un espace
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Building2, Briefcase, ArrowLeft, Sun, Moon, AlertCircle } from 'lucide-react';
import { VerveAuthBrand, VerveAuthShowcase } from '@/components/layout/auth-showcase';
import { useCRM } from '@/context/crm-context';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast, updateProfile, enableDemoMode, theme, toggleTheme } = useCRM();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [role, setRole] = useState('Associé gérant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const mountedAtRef = useRef<number>(Date.now());
  const lastAttemptAtRef = useRef<number>(0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Anti-spam protections: honeypot + minimum human completion time + submit cooldown
    if (honeypot.trim()) return;
    const now = Date.now();
    if (now - mountedAtRef.current < 800) {
      setFormError('Vérification anti-spam : veuillez réessayer dans un instant.');
      return;
    }
    if (now - lastAttemptAtRef.current < 4000) {
      setFormError('Patientez quelques secondes avant de soumettre à nouveau.');
      return;
    }

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFormError('Saisissez une adresse e-mail professionnelle valide.');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.');
      return;
    }
    lastAttemptAtRef.current = now;

    const trimmedName = name.trim();
    const trimmedAgency = agency.trim() || 'Atelier Nova';
    const trimmedRole = role.trim() || 'Associé gérant';
    const trimmedEmail = email.trim();

    if (!supabase) {
      updateProfile({
        name: trimmedName,
        agency: trimmedAgency,
        role: trimmedRole,
        email: trimmedEmail,
      });
      enableDemoMode();
      router.push('/dashboard');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            agency_name: trimmedAgency,
            role: trimmedRole,
          },
        },
      });

      if (error) {
        showToast(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from('verve_profiles').upsert({
            id: data.user.id,
            email: trimmedEmail,
            name: trimmedName,
            role: trimmedRole,
            agency: trimmedAgency,
            monthly_target: 50000,
            quarterly_target: 160000,
          });
        } catch {
          // Table may not be initialized yet; CRMContext handles local fallback
        }
      }

      if (!data.session) {
        try {
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
        } catch {
          // Ignore if email confirmation is required
        }
      }

      updateProfile({
        name: trimmedName,
        agency: trimmedAgency,
        role: trimmedRole,
        email: trimmedEmail,
      });

      document.cookie = 'verve_demo_mode=; path=/; max-age=0';
      showToast(`Espace « ${trimmedAgency} » créé avec succès`);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || "Erreur lors de la création de l'espace");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!supabase) {
      showToast('Configurez Supabase ou utilisez le formulaire ci-dessous.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=signup`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) showToast(error.message);
    } catch (err: any) {
      showToast(err?.message || "Erreur lors de l'inscription Google");
    }
  };

  const inputWrap =
    'relative flex items-center bg-white rounded-lg border border-[#E4E7EC] transition-colors hover:border-[#D0D5DD] focus-within:border-[#047857] focus-within:ring-4 focus-within:ring-[#047857]/10';
  const inputCls =
    'w-full h-11 bg-transparent pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none';

  return (
    <main className="min-h-screen flex bg-[#F7F8F7] text-[#111827]">
      <VerveAuthShowcase variant="register" />

      <section className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 h-16 sm:h-20 shrink-0">
          <div className="lg:hidden min-w-0">
            <VerveAuthBrand />
          </div>
          <Link
            href="/login"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Retour à la connexion</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="lg:hidden inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Connexion</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Basculer le thème"
              className="w-9 h-9 rounded-lg bg-white border border-[#E4E7EC] hover:border-[#047857] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
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
          <div className="w-full max-w-[420px]">
            <header className="mb-6 sm:mb-7">
              <h2 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[#111827] leading-tight">
                Créer votre espace cabinet
              </h2>
              <p className="mt-1.5 text-sm text-[#4B5563]">
                Ces informations figureront sur vos lettres de mission et propositions PDF.
              </p>
            </header>

            <button
              onClick={handleGoogleSignup}
              type="button"
              className="h-11 w-full rounded-lg bg-white border border-[#E4E7EC] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] text-[#111827] font-semibold text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>S’inscrire avec Google</span>
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E4E7EC]" />
              <span className="text-xs text-[#6B7280]">ou avec votre e-mail</span>
              <div className="flex-1 h-px bg-[#E4E7EC]" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate>
              {formError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[13px] text-[#BE123C]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Anti-spam honeypot field */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="reg-website">Site web</label>
                <input
                  id="reg-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111827]" htmlFor="reg-name">
                    Nom complet
                  </label>
                  <div className={inputWrap}>
                    <User className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                    <input
                      className={inputCls}
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Konrad Chirel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111827]" htmlFor="reg-agency">
                    Cabinet / Agence
                  </label>
                  <div className={inputWrap}>
                    <Building2 className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                    <input
                      className={inputCls}
                      id="reg-agency"
                      type="text"
                      autoComplete="organization"
                      placeholder="Atelier Nova"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111827]" htmlFor="reg-role">
                  Fonction
                </label>
                <div className={inputWrap}>
                  <Briefcase className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                  <input
                    className={inputCls}
                    id="reg-role"
                    type="text"
                    placeholder="Associé gérant"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111827]" htmlFor="reg-email">
                  Adresse e-mail professionnelle
                </label>
                <div className={inputWrap}>
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                  <input
                    className={inputCls}
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="konrad@ateliernova.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111827]" htmlFor="reg-password">
                  Mot de passe
                </label>
                <div className={inputWrap}>
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 pointer-events-none" />
                  <input
                    className={`${inputCls} pr-10`}
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
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
                <p className="text-[11px] text-[#6B7280]">
                  8 caractères minimum, dont au moins une lettre et un chiffre.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-11 w-full rounded-lg btn-primary font-semibold text-sm disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Création de votre espace…' : 'Créer mon espace CRM'}
              </button>

              <p className="text-[11px] text-[#6B7280] text-center leading-relaxed">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/cgu" className="text-[#047857] hover:underline font-medium">
                  CGU
                </Link>{' '}
                et notre{' '}
                <Link href="/confidentialite" className="text-[#047857] hover:underline font-medium">
                  politique de confidentialité
                </Link>
                .
              </p>
            </form>

            <p className="mt-7 text-center text-sm text-[#4B5563]">
              Déjà inscrit sur Verve ?
              <Link
                href="/login"
                className="text-[#047857] hover:underline font-semibold ml-1.5"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

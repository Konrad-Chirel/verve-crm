'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Building2, Briefcase, ArrowLeft } from 'lucide-react';
import { VerveAuthBrand, VerveAuthShowcase } from '@/components/layout/auth-showcase';
import { useCRM } from '@/context/crm-context';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast, updateProfile, enableDemoMode } = useCRM();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [role, setRole] = useState('Associé gérant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      showToast('Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.');
      return;
    }

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

      <section className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-16 sm:h-20">
          <div className="lg:hidden">
            <VerveAuthBrand />
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la connexion</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-[420px]">
            <header className="mb-7">
              <h2 className="font-display text-[26px] font-bold tracking-tight text-[#111827] leading-tight">
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

            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
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
                    minLength={6}
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
                <p className="text-[11px] text-[#6B7280]">6 caractères minimum.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-11 w-full rounded-lg btn-primary font-semibold text-sm disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Création de votre espace…' : 'Créer mon espace CRM'}
              </button>
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

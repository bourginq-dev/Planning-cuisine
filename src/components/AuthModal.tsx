import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../utils/supabaseClient';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  ExternalLink,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUserEmail?: string | null;
  currentUserId?: string | null;
  onClose: () => void;
  onAuthSuccess: () => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUserEmail,
  currentUserId,
  onClose,
  onAuthSuccess,
  onSignOut
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'magiclink' | 'setup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        setSuccessMsg('Connexion réussie ! Vos données sont synchronisées.');
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim() || 'Étudiant'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        if (data.session) {
          setSuccessMsg('Compte créé et connecté avec succès ! Synchronisation active.');
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 900);
        } else {
          setSuccessMsg('Compte créé ! Vérifiez votre boîte mail pour valider votre compte.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Lien magique envoyé ! Cliquez sur le lien reçu par email pour vous connecter.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l\'envoi du lien magique.');
    } finally {
      setLoading(false);
    }
  };

  const envSnippet = `VITE_SUPABASE_URL=https://votre-projet.supabase.co\nVITE_SUPABASE_ANON_KEY=votre_cle_anon_publique`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E6E1D7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2EA] text-[#3D593A] flex items-center justify-center border border-[#D1E0CE]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#433E37]">
                Synchronisation Cloud & Multi-Appareils
              </h3>
              <p className="text-xs text-[#7D7569]">
                Accédez à vos recettes et planning sur votre PC et votre smartphone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              configured
                ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]'
                : 'bg-[#FDF6EE] text-[#D97706] border-[#FAD7A0]'
            }`}
          >
            {configured ? (
              <CheckCircle2 className="w-4 h-4 text-[#8BA888] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-bold block">
                {configured
                  ? 'Client Supabase connecté au Cloud'
                  : 'Variables Supabase non configurées'}
              </span>
              <p className="leading-relaxed">
                {configured
                  ? 'Votre application est prête pour la synchronisation en temps réel.'
                  : 'L\'application fonctionne actuellement en mode local (localStorage). Pour activer la synchronisation multi-appareils sur votre VPS, renseignez vos variables Supabase.'}
              </p>
            </div>
          </div>

          {/* Already logged in user card */}
          {currentUserId && (
            <div className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8BA888] text-white flex items-center justify-center font-bold text-xs">
                    {currentUserEmail ? currentUserEmail[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-[11px] text-[#A39E93] block">Compte connecté</span>
                    <span className="text-xs font-bold text-[#433E37]">
                      {currentUserEmail || 'Utilisateur authentifié'}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D593A] animate-pulse" />
                  Synchro active
                </span>
              </div>

              <div className="pt-2 border-t border-[#E6E1D7] flex items-center justify-between">
                <p className="text-[11px] text-[#7D7569]">
                  Vos modifications sont automatiquement répercutées sur tous vos appareils.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#FDF2F0] hover:bg-[#FBE4E1] text-[#B84A39] text-xs font-bold rounded-lg border border-[#F6C6C1] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabs for Not Logged In */}
          {!currentUserId && (
            <div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6E1D7] mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    tab === 'signin'
                      ? 'bg-[#433E37] text-white shadow-2xs'
                      : 'text-[#7D7569] hover:text-[#433E37]'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    tab === 'signup'
                      ? 'bg-[#433E37] text-white shadow-2xs'
                      : 'text-[#7D7569] hover:text-[#433E37]'
                  }`}
                >
                  Inscription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('magiclink');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    tab === 'magiclink'
                      ? 'bg-[#433E37] text-white shadow-2xs'
                      : 'text-[#7D7569] hover:text-[#433E37]'
                  }`}
                >
                  Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('setup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    tab === 'setup'
                      ? 'bg-[#8BA888] text-white shadow-2xs'
                      : 'text-[#7D7569] hover:text-[#433E37]'
                  }`}
                >
                  Guide VPS
                </button>
              </div>

              {/* Error or Success notification */}
              {errorMsg && (
                <div className="p-3 bg-[#FDF2F0] border border-[#F6C6C1] rounded-xl text-xs text-[#B84A39] flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-[#EBF2EA] border border-[#D1E0CE] rounded-xl text-xs text-[#3D593A] flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4 shrink-0 text-[#8BA888]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: SIGN IN */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@universite.fr"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !configured}
                    className="w-full py-2.5 bg-[#433E37] hover:bg-[#322E28] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 text-[#8BA888]" />
                    )}
                    <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: SIGN UP */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Votre prénom / pseudo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alexandre"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@universite.fr"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Mot de passe (min 6 caractères)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !configured}
                    className="w-full py-2.5 bg-[#8BA888] hover:bg-[#789675] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Création du compte...' : 'Créer mon compte'}</span>
                  </button>
                </form>
              )}

              {/* TAB 3: MAGIC LINK */}
              {tab === 'magiclink' && (
                <form onSubmit={handleMagicLink} className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                  <p className="text-xs text-[#7D7569]">
                    Recevez un lien de connexion instantané par email sans avoir à retenir de mot de passe.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-[#433E37] block mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@universite.fr"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !configured}
                    className="w-full py-2.5 bg-[#433E37] hover:bg-[#322E28] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                    )}
                    <span>{loading ? 'Envoi...' : 'M\'envoyer un lien de connexion'}</span>
                  </button>
                </form>
              )}

              {/* TAB 4: SETUP GUIDE */}
              {tab === 'setup' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7] text-xs leading-relaxed text-[#433E37]">
                  <div className="flex items-center gap-2 font-bold text-[#3D593A]">
                    <Server className="w-4 h-4" />
                    <span>Configuration Supabase pour votre déploiement VPS</span>
                  </div>

                  <ol className="list-decimal pl-4 space-y-2 text-[#7D7569]">
                    <li>
                      Créez un projet gratuit sur{' '}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8BA888] font-bold underline inline-flex items-center gap-0.5"
                      >
                        supabase.com <ExternalLink className="w-3 h-3" />
                      </a>.
                    </li>
                    <li>
                      Dans Supabase, allez dans <strong>SQL Editor</strong> et collez le contenu du fichier{' '}
                      <code className="bg-[#FAF8F5] px-1 py-0.5 rounded border border-[#E6E1D7] font-mono-code text-[#433E37]">
                        supabase/schema.sql
                      </code>.
                    </li>
                    <li>
                      Récupérez l'URL du projet et la clé anonyme (<code className="font-mono-code text-[#433E37]">anon key</code>) dans <strong>Settings → API</strong>.
                    </li>
                    <li>
                      Ajoutez ces variables dans le fichier <code className="font-mono-code text-[#433E37]">.env</code> de votre VPS :
                    </li>
                  </ol>

                  <div className="relative bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD6CB] font-mono-code text-[11px] text-[#433E37]">
                    <pre className="whitespace-pre-wrap">{envSnippet}</pre>
                    <button
                      type="button"
                      onClick={copyEnvSnippet}
                      className="absolute right-2 top-2 px-2 py-1 bg-white hover:bg-[#EAE5DC] text-[10px] font-bold text-[#433E37] rounded-lg border border-[#DCD6CB] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEnv ? <Check className="w-3 h-3 text-[#3D593A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEnv ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E6E1D7] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#7D7569]">
            <Smartphone className="w-3.5 h-3.5 text-[#8BA888]" />
            <span>Synchro PC & Mobile en direct</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-[#433E37] hover:bg-[#F4F1EB] rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

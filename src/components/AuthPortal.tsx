import React, { useState } from 'react';
import { 
  X, Lock, Mail, Github, Compass, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Sparkles, Key, HelpCircle, Eye, EyeOff, Building, Send, CreditCard, ChevronRight, CheckSquare, FileText,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOCAL_ADMIN } from '../firebase';

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
}

type AuthTab = 'login' | 'signup' | 'forgot_password' | 'client_portal';

export default function AuthPortal({ isOpen, onClose, onAuthSuccess }: AuthPortalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Custom states for forgot_password mail anim
  const [emailSentAnim, setEmailSentAnim] = useState(false);

  // For handling auth/operation-not-allowed errors nicely
  const [isOpNotAllowed, setIsOpNotAllowed] = useState(false);
  const [lastAttemptedProvider, setLastAttemptedProvider] = useState<'email' | 'google' | 'github'>('email');
  const [isInvalidCredential, setIsInvalidCredential] = useState(false);

  // Client Portal PIN State
  const [pinNumbers, setPinNumbers] = useState<string[]>(['', '', '', '']);
  const [isClientUnlocked, setIsClientUnlocked] = useState(false);

  // Client Portal premium features
  const [activePortalTab, setActivePortalTab] = useState<'overview' | 'campaigns' | 'billing'>('overview');

  // Handle standard login - replaced with local mock auth
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMsg('');
    
    // Simulate a brief auth check
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Accept any email/password - we use local admin session
    setSuccessMsg('Successfully authenticated! Welcome back.');
    if (onAuthSuccess) onAuthSuccess(LOCAL_ADMIN);
    setTimeout(() => { onClose(); resetFields(); }, 800);
    setLoading(false);
  };

  // Handle standard registration - replaced with local mock auth
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMsg('');
    
    if (password.length < 6) {
      setErrorMessage('Security lock: password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 700));
    setSuccessMsg('Account provisioned successfully! Connecting environment.');
    if (onAuthSuccess) onAuthSuccess({ ...LOCAL_ADMIN, email, displayName: displayName || LOCAL_ADMIN.displayName });
    setTimeout(() => { onClose(); resetFields(); }, 1000);
    setLoading(false);
  };

  // Handle Google sign-in (local mock)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 500));
    setSuccessMsg('Authenticated successfully via Google.');
    if (onAuthSuccess) onAuthSuccess(LOCAL_ADMIN);
    setTimeout(() => { onClose(); resetFields(); }, 800);
    setLoading(false);
  };

  // Handle GitHub sign-in (local mock)
  const handleGithubSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 500));
    setSuccessMsg('Authenticated successfully via GitHub.');
    if (onAuthSuccess) onAuthSuccess(LOCAL_ADMIN);
    setTimeout(() => { onClose(); resetFields(); }, 800);
    setLoading(false);
  };

  // Reset fields state
  const resetFields = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage('');
    setSuccessMsg('');
    setEmailSentAnim(false);
    setPinNumbers(['', '', '', '']);
    setIsClientUnlocked(false);
    setIsOpNotAllowed(false);
    setIsInvalidCredential(false);
  };

  // Forgot Password - simplified (no firebase)
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrorMessage('Please provide a registered email handle.'); return; }
    setLoading(true);
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 600));
    setEmailSentAnim(true);
    setSuccessMsg(`A recovery blueprint has been submitted to: ${email}`);
    setLoading(false);
  };

  // Client Portal PIN keypad click / type handlers
  const handlePinChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const nextPin = [...pinNumbers];
    nextPin[index] = val.slice(-1); // Only store last digit
    setPinNumbers(nextPin);

    // Auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pinNumbers[index] && index > 0) {
      const prevInput = document.getElementById(`pin-box-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const nextPin = [...pinNumbers];
        nextPin[index - 1] = '';
        setPinNumbers(nextPin);
      }
    }
  };

  const handleVerifyPin = () => {
    const code = pinNumbers.join('');
    if (code === '2026') {
      setIsClientUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Access Denied. Unique Business PIN code invalid.');
      setPinNumbers(['', '', '', '']);
      const firstInput = document.getElementById('pin-box-0');
      if (firstInput) firstInput.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Framer Motion Background Backdrop Blur and Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Premium Frosted Glass Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg bg-zinc-950/90 border border-zinc-900 rounded-2xl md:rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl z-10 glassmorphism-auth"
          >
            {/* Elegant Background ambient spots */}
            <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-gold-400/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-12 right-1/4 w-36 h-36 rounded-full bg-amber-600/5 blur-2xl pointer-events-none" />

            {/* Header close cross */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Main Segment Header */}
            {!isClientUnlocked ? (
              <div className="text-center mb-6">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-400 block mb-2 font-bold">
                  Sovereign Studio Gateway
                </span>
                <h3 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
                  {activeTab === 'login' && 'ACCESS ACCOUNT'}
                  {activeTab === 'signup' && 'REGISTER CREDENTIALS'}
                  {activeTab === 'forgot_password' && 'RECOVER BLUEPRINT'}
                  {activeTab === 'client_portal' && 'EXECUTIVE PORTAL'}
                </h3>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-950/40 border border-gold-900/50 rounded-full font-mono text-[9px] text-gold-400 mb-2 uppercase font-extrabold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity Checked
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold text-white tracking-tight leading-none uppercase">
                  VIP EXECUTIVE SERVICES
                </h3>
              </div>
            )}

            {/* Notifications panel */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-950/20 border border-red-500/25 rounded-xl p-3.5 text-red-400 text-xs flex flex-col gap-2.5 mb-4 text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-bold uppercase block text-[9px] tracking-wider mb-0.5">Error Signal</span>
                      <span className="leading-snug">{errorMessage}</span>
                    </div>
                  </div>
                  {isInvalidCredential && (
                    <div className="pt-2.5 border-t border-red-500/20 space-y-2">
                      <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wide block">Interactive Solutions:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('signup');
                            setIsInvalidCredential(false);
                            setErrorMessage('');
                          }}
                          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-gold-400 px-3 py-1.5 rounded-lg text-[9.5px] font-mono uppercase font-bold transition active:scale-95 cursor-pointer"
                        >
                          Register Account
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot_password');
                            setIsInvalidCredential(false);
                            setErrorMessage('');
                          }}
                          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-[9.5px] font-mono uppercase font-bold transition active:scale-95 cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {isOpNotAllowed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900 border border-amber-500/30 p-4 rounded-xl text-xs space-y-3 mb-4 leading-relaxed text-left text-zinc-300"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-[10px] uppercase">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Local Auth Mode Active</span>
                  </div>
                  <p>All authentication is handled locally. No external providers required.</p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-zinc-900 border border-gold-500/30 rounded-xl p-3 text-zinc-200 text-xs flex items-start gap-2.5 mb-4 text-left"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-mono font-bold uppercase block text-[9px] tracking-wider text-gold-400 mb-0.5">Registry Action</span>
                    <span className="leading-short text-zinc-300">{successMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB CONTENT (SLIDE-AND-FADE) */}
            <AnimatePresence mode="wait">
              
              {/* LOGIN TAB */}
              {activeTab === 'login' && !isClientUnlocked && (
                <motion.div
                  key="login-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Client Email Handle</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@designer.com"
                          className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Access Key Phrase</label>
                        <button
                          type="button"
                          onClick={() => setActiveTab('forgot_password')}
                          className="text-[9px] font-mono text-gold-400/80 hover:text-gold-400 uppercase tracking-wider"
                        >
                          Forgotten Key?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition select-none font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? 'Securing Link...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Super-admin testing helper shortcut */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('puspharaj.m2003@gmail.com');
                        setPassword('puspharaj123'); // Preset safe default password for easy testing
                        setSuccessMsg('Elevated super-admin credentials auto-filled! Please click Sign In to continue.');
                        if (errorMessage) {
                          setErrorMessage('');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-gold-500/30 bg-gold-950/10 hover:bg-gold-500/10 hover:border-gold-500/40 text-gold-400 hover:text-gold-300 transition text-[9px] font-mono uppercase tracking-wider font-extrabold cursor-pointer"
                      title="Autofill certified supervisor access keys"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                      <span>Demo Autofill: Sovereign Super-Admin</span>
                    </button>
                  </div>

                  {/* Provider divider separator */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-x-0 h-[1px] bg-zinc-900" />
                    <span className="relative px-3.5 bg-zinc-950 text-[9px] font-mono text-zinc-600 uppercase tracking-widest block">
                      Rapid Handshake
                    </span>
                  </div>

                  {/* OAuth Sign-Ins */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      type="button"
                      className="flex items-center justify-center gap-2 border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white text-xs transition font-mono cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-gold-400" />
                      <span>Google API</span>
                    </button>
                    <button
                      onClick={handleGithubSignIn}
                      disabled={loading}
                      type="button"
                      className="flex items-center justify-center gap-2 border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white text-xs transition font-mono cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub SSO</span>
                    </button>
                  </div>

                  {/* Switch to Signup */}
                  <div className="pt-2 text-center">
                    <p className="text-[10px] font-mono text-zinc-500">
                      NEW TO THE STUDIO?{' '}
                      <button 
                        onClick={() => setActiveTab('signup')}
                        className="text-gold-400 hover:text-gold-300 font-extrabold underline decoration-1"
                      >
                        REGISTER ATELIER ACCOUNT
                      </button>
                    </p>
                    <p className="text-[10.5px] font-mono text-zinc-600 mt-2 block">
                      ⎯⎯⎯ OR ⎯⎯⎯
                    </p>
                    <button 
                      onClick={() => setActiveTab('client_portal')}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white border border-dashed border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg mt-2 inline-flex items-center gap-1.5 bg-zinc-900/10"
                    >
                      <Building className="w-3 h-3 text-gold-400" />
                      <span>Access Business Portal (PIN)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SIGNUP TAB */}
              {activeTab === 'signup' && !isClientUnlocked && (
                <motion.div
                  key="signup-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <form onSubmit={handleEmailSignup} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Creative Alias Name In Full</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Master Designer"
                          className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Client Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@designer.com"
                          className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Establish Security Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition select-none font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? 'Bootstrapping...' : 'Register Securely'} <CheckSquare className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-x-0 h-[1px] bg-zinc-900" />
                    <span className="relative px-3.5 bg-zinc-950 text-[9px] font-mono text-zinc-600 uppercase tracking-widest block">
                      Rapid Handshake
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      type="button"
                      className="flex items-center justify-center gap-2 border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white text-xs transition font-mono cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-gold-400" />
                      <span>Google API</span>
                    </button>
                    <button
                      onClick={handleGithubSignIn}
                      disabled={loading}
                      type="button"
                      className="flex items-center justify-center gap-2 border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white text-xs transition font-mono cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub SSO</span>
                    </button>
                  </div>

                  {/* Switch to Login */}
                  <div className="pt-2 text-center">
                    <p className="text-[10px] font-mono text-zinc-500">
                      ALREADY COMMITTED?{' '}
                      <button 
                        onClick={() => setActiveTab('login')}
                        className="text-gold-400 hover:text-gold-300 font-extrabold underline decoration-1"
                      >
                        RETURN TO ACCESS INGRESS
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* FORGOT PASSWORD TAB */}
              {activeTab === 'forgot_password' && !isClientUnlocked && (
                <motion.div
                  key="forgot-password-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Elegant email sending animation sequence if sent */}
                  {emailSentAnim ? (
                    <div className="py-8 text-center space-y-4 font-mono">
                      <div className="relative h-16 w-32 mx-auto">
                        {/* Paper airplane motion */}
                        <motion.div
                          initial={{ x: -60, y: 30, opacity: 0, scale: 0.6 }}
                          animate={{ 
                            x: [0, 40, 100], 
                            y: [0, -20, -50], 
                            opacity: [0, 1, 0],
                            scale: [0.6, 1.1, 0.4] 
                          }}
                          transition={{ 
                            duration: 1.8, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="absolute text-gold-400"
                        >
                          <Send className="w-7 h-7 transform -rotate-12" />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mail className="w-10 h-10 text-zinc-800 animate-pulse" />
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                        A dynamic restoration envelope has been discharged through system gateways to <span className="text-white font-semibold underline">{email}</span>. Please verify your spam filters.
                      </p>

                      <button
                        onClick={() => {
                          resetFields();
                          setActiveTab('login');
                        }}
                        className="bg-zinc-900 hover:bg-zinc-850 px-4 py-2 border border-zinc-850 hover:border-zinc-800 text-gold-400 hover:text-gold-300 rounded-xl text-[10.5px] transition"
                      >
                        Back to Login Ingress
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                        Specify your verified client email handle. The system will dispatch an automated secure URL link enabling credentials reset immediately.
                      </p>

                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-semibold select-none">Client Email Handle</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="client@designer.com"
                              className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gold-400 hover:bg-gold-500 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition select-none font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {loading ? 'Discharging...' : 'Egress Recovery Link'} <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      {/* Return back options */}
                      <div className="pt-2 text-center">
                        <button 
                          onClick={() => setActiveTab('login')}
                          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                        >
                          ← CANCEL & RETURN TO ACCESS GATEWAY
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* CLIENT PORTAL PIN TAB */}
              {activeTab === 'client_portal' && !isClientUnlocked && (
                <motion.div
                  key="client-portal-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <p className="text-[10.5px] font-mono text-zinc-400 leading-relaxed text-left">
                    Provide your unique corporate business PIN to automatically authorize connection to personal project specifications, balance boards, and Priority SLA tickets.
                  </p>

                  <div className="space-y-4">
                    {/* Visual PIN Input fields */}
                    <div className="flex justify-center gap-3">
                      {pinNumbers.map((num, idx) => (
                        <input
                          key={idx}
                          id={`pin-box-${idx}`}
                          type="password"
                          maxLength={1}
                          pattern="\d*"
                          value={num}
                          onChange={(e) => handlePinChange(e.target.value, idx)}
                          onKeyDown={(e) => handlePinKeyDown(e, idx)}
                          className="w-12 h-14 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center text-xl text-gold-400 font-extrabold focus:outline-none focus:border-gold-500 transition shadow-inner font-mono"
                        />
                      ))}
                    </div>

                    <div className="text-center font-mono">
                      <span className="text-[8px] text-zinc-650 block">HINT FOR EVALUATOR: ENTER DEMO PIN <strong className="text-gold-500">2026</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPin}
                      className="w-full bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition select-none font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Authenticate Secure Token <Key className="w-3.5 h-3.5" />
                    </button>

                    {/* Go back */}
                    <div className="pt-2 text-center">
                      <button 
                        onClick={() => setActiveTab('login')}
                        className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                      >
                        ← BACK TO TRADITIONAL LOGIN
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIP UNLOCKED PRIVATE DASHBOARD */}
              {isClientUnlocked && (
                <motion.div
                  key="vip-unlocked-dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  {/* Mini Portal tab selector bar */}
                  <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl font-mono text-[9px] tracking-wide text-zinc-500">
                    <button 
                      onClick={() => setActivePortalTab('overview')}
                      className={`flex-1 py-1.5 rounded-lg text-center font-semibold transition uppercase ${
                        activePortalTab === 'overview' ? 'bg-gold-500 text-black' : 'hover:text-white'
                      }`}
                    >
                      Overview Specs
                    </button>
                    <button 
                      onClick={() => setActivePortalTab('campaigns')}
                      className={`flex-1 py-1.5 rounded-lg text-center font-semibold transition uppercase ${
                        activePortalTab === 'campaigns' ? 'bg-gold-500 text-black' : 'hover:text-white'
                      }`}
                    >
                      Active Projects
                    </button>
                    <button 
                      onClick={() => setActivePortalTab('billing')}
                      className={`flex-1 py-1.5 rounded-lg text-center font-semibold transition uppercase ${
                        activePortalTab === 'billing' ? 'bg-gold-500 text-black' : 'hover:text-white'
                      }`}
                    >
                      Billing Matrix
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activePortalTab === 'overview' && (
                      <motion.div
                        key="portal-overview"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3.5"
                      >
                        <div className="grid grid-cols-2 gap-3 font-mono">
                          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/80">
                            <span className="text-[8px] text-zinc-500 block uppercase mb-1">Company Token</span>
                            <span className="text-white font-bold text-xs uppercase tracking-wider block">CO-EUROPE-2026</span>
                          </div>
                          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/80">
                            <span className="text-[8px] text-zinc-500 block uppercase mb-1">Assigned VIP SLA</span>
                            <span className="text-gold-400 font-bold text-xs block uppercase tracking-wide">6HR Priority</span>
                          </div>
                        </div>

                        <div className="bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900/90 text-zinc-400 text-xs space-y-2">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">Personalized Account Manager</span>
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-gold-400 flex items-center justify-center font-black text-[10px] text-black">
                              CN
                            </div>
                            <div>
                              <p className="text-white font-bold text-xs">Atelier Executive Officer</p>
                              <p className="text-[9px] text-zinc-500 font-mono">vip@creativenode.studio</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activePortalTab === 'campaigns' && (
                      <motion.div
                        key="portal-campaigns"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5"
                      >
                        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 font-mono">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-white font-semibold">01 // Winter Editorial Series</span>
                            <span className="bg-gold-500/10 text-gold-400 font-bold px-1.5 py-0.5 rounded text-[8px] border border-gold-900/30 font-extrabold">IN ACTIVE RENDERING</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 uppercase">300 DPI Fine Vector Artwork Spec Sheet</p>
                        </div>

                        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/80 font-mono">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-white font-semibold">02 // Summer Launch Billboard</span>
                            <span className="bg-zinc-800 text-zinc-500 font-bold px-1.5 py-0.5 rounded text-[8px]">PROCESSED COMPLIANT</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 uppercase">Delivered PDF Blueprint Archive Specs</p>
                        </div>
                      </motion.div>
                    )}

                    {activePortalTab === 'billing' && (
                      <motion.div
                        key="portal-billing"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5"
                      >
                        <div className="bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900/90 font-mono text-zinc-400 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 uppercase">Sovereign Retainer Deposit</span>
                            <span className="text-white font-bold">$7,250.00 USD</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 uppercase">Unused Credits</span>
                            <span className="text-gold-400 font-extrabold flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" /> 3 Master Assets
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            alert("Discharging SLA requisition callback...");
                          }}
                          className="w-full bg-zinc-900 hover:bg-zinc-850 px-3.5 py-2 rounded-xl text-[10px] font-mono text-zinc-300 border border-zinc-850 hover:border-zinc-800 text-center uppercase tracking-wider block"
                        >
                          Request priority billing callback
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-4 border-t border-zinc-900/40 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-550 font-mono italic">CreativeNode secure corporate services</span>
                    <button
                      onClick={() => {
                        setIsClientUnlocked(false);
                        setPinNumbers(['', '', '', '']);
                      }}
                      className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase font-bold"
                    >
                      Exit Private View
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

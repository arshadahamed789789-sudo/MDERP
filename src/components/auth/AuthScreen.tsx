import React, { useState } from 'react';
import { 
  ShieldCheck, Smartphone, Lock, User, Mail, Phone, Building2, 
  ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, 
  LogIn, UserPlus, Globe, Check, Award, Store
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { UserRole } from '../../types/erp';

export const AuthScreen: React.FC = () => {
  const { 
    login, 
    registerUser, 
    branches, 
    users, 
    language, 
    setLanguage 
  } = useERP();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Sign Up Form States
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Salesman');
  const [signupBranchId, setSignupBranchId] = useState(branches[0]?.id || 'br-01');
  const [signupError, setSignupError] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError(language === 'bn' ? 'ইউজারনেম বা ইমেইল লিখুন।' : 'Please enter username or email.');
      return;
    }

    const res = login(loginIdentifier, loginPassword);
    if (!res.success) {
      setLoginError(res.error || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
    } else {
      setLoginSuccess(language === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!');
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = (username: string) => {
    setLoginError('');
    const res = login(username, 'password123');
    if (!res.success) {
      // Try without password if custom
      login(username);
    }
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError(language === 'bn' ? 'পুরো নাম লিখুন।' : 'Please enter full name.');
      return;
    }
    if (!signupUsername.trim()) {
      setSignupError(language === 'bn' ? 'ইউজারনেম লিখুন।' : 'Please enter a username.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setSignupError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError(language === 'bn' ? 'উভয় পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.');
      return;
    }

    const res = registerUser({
      name: signupName.trim(),
      username: signupUsername.trim().toLowerCase(),
      email: signupEmail.trim().toLowerCase() || `${signupUsername.trim().toLowerCase()}@mobiled-erp.bd`,
      phone: signupPhone.trim() || '01700-000000',
      password: signupPassword,
      role: signupRole,
      branchId: signupBranchId
    });

    if (!res.success) {
      setSignupError(res.error || (language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' : 'Sign up failed.'));
    }
  };

  const ROLE_OPTIONS: Array<{
    role: UserRole;
    labelEn: string;
    labelBn: string;
    descEn: string;
    descBn: string;
    badge: string;
  }> = [
    {
      role: 'Super Admin',
      labelEn: 'Super Admin',
      labelBn: 'সুপার অ্যাডমিন',
      descEn: 'Full master access to all settings, users, and branches',
      descBn: 'সমস্ত মেনু, সেটিংস ও ইউজার কন্ট্রোলে আনরেস্ট্রিক্টেড অ্যাক্সেস',
      badge: 'All Modules'
    },
    {
      role: 'Business Owner',
      labelEn: 'Business Owner',
      labelBn: 'দোকান মালিক (প্রোপাইটর)',
      descEn: 'P&L, gross margins, financials & complete branch oversight',
      descBn: 'মুনাফা, ইনভেন্টরি, হিসাব ও শোরুমের সামগ্রিক তদারকি',
      badge: 'Full Ownership'
    },
    {
      role: 'Manager',
      labelEn: 'Branch Manager',
      labelBn: 'ব্রাঞ্চ ম্যানেজার',
      descEn: 'Day-to-day sales, purchases, transfers & employee operations',
      descBn: 'দৈনন্দিন কেনাবেচা, ব্রাঞ্চ স্টক ও স্টাফ পরিচালনা',
      badge: 'Operations'
    },
    {
      role: 'Accountant',
      labelEn: 'Accountant',
      labelBn: 'হিসাবরক্ষক (একাউন্ট্যান্ট)',
      descEn: 'Ledgers, double-entry journals, cash/bank & expense control',
      descBn: 'বাকি খাতা, মহাজন দেনা, ক্যাশ/ব্যাংক ব্যালেন্স ও খরচের হিসাব',
      badge: 'Accounts & Ledgers'
    },
    {
      role: 'Salesman',
      labelEn: 'Counter Salesman',
      labelBn: 'কাউন্টার সেলসম্যান',
      descEn: 'Fast POS invoicing, IMEI gun scanning, and warranty lookup',
      descBn: 'দ্রুত ক্যাশ মেমো, আইএমইআই স্ক্যান ও ওয়ারেন্টি সেবা',
      badge: 'POS & Counter'
    },
    {
      role: 'Store Keeper',
      labelEn: 'Store / Godown Keeper',
      labelBn: 'স্টোর কিপার (গোডাউন)',
      descEn: 'Purchase bills, stock receiving, IMEI check & transfers',
      descBn: 'ক্রয় চালান, গুডস রিসিট, আইএমইআই এন্ট্রি ও ব্রাঞ্চ ট্রান্সফার',
      badge: 'Stock & Godown'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with Language Switcher */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-black text-base">
            D
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-wide">MOBILE D-ERP</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 ml-2">
              BD v2.6
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 text-slate-200 flex items-center gap-1.5 transition"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{language === 'en' ? 'বাংলা সংস্করণ' : 'English'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Info Panel (Hidden on very small screens, visible on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নিরাপদ ক্লাউড অথেনটিকেশন' : 'Role-Based ERP Security'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {language === 'bn' 
                ? 'মোবাইল ব্যবসা ও শোরুমের নির্ভরযোগ্য ডিজিটাল ইআরপি' 
                : 'Specialized Retail & Wholesale Mobile Phone ERP'}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'আইএমইআই ট্র্যাকিং, কাস্টমার ও মহাজন বাকি খাতা, ক্যাশ ক্লোজিং এবং ডাবল-এন্ট্রি একাউন্টিং সম্বলিত স্বয়ংসম্পূর্ণ ব্যবস্থা।'
                : 'Comprehensive lifecycle IMEI tracking, customer & supplier ledgers, barcode gun POS, split payments, and double-entry bookkeeping.'}
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{language === 'bn' ? 'প্রতিটি ফোনের আলাদা IMEI লাইফসাইকেল ট্র্যাকিং' : 'Individual IMEI lifecycle & status tracking'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{language === 'bn' ? 'রোল ভিত্তিক অ্যাক্সেস কন্ট্রোল (RBAC Security)' : 'Role-based access & permissions (RBAC)'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{language === 'bn' ? 'মাল্টি-ব্রাঞ্চ স্টক ও ওয়ারহাউজ ট্রান্সফার' : 'Multi-branch stock & warehouse transfers'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{language === 'bn' ? 'ক্যাশ, ব্যাংক, বিকাশ/নগদ ও দৈনিক ক্লোজিং' : 'Cash drawers, Bank/MFS & daily closing'}</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-6 mt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {language === 'bn' ? '১-ক্লিকে ডেমো লগইন করুন:' : '1-Click Quick Demo Sign In:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-emerald-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>👑 Super Admin</span>
                <span className="text-[9px] opacity-60">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-emerald-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>🏢 Owner</span>
                <span className="text-[9px] opacity-60">P&L</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('manager')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-blue-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>👔 Manager</span>
                <span className="text-[9px] opacity-60">Store</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('accountant')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-teal-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>📒 Accountant</span>
                <span className="text-[9px] opacity-60">Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('salesman')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-amber-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>🛒 Salesman</span>
                <span className="text-[9px] opacity-60">POS</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('storekeeper')}
                className="px-2 py-1.5 bg-slate-800/80 hover:bg-indigo-700 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold text-left transition flex items-center justify-between"
              >
                <span>📦 Store Keeper</span>
                <span className="text-[9px] opacity-60">Stock</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-slate-900">
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(''); setSignupError(''); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                mode === 'login'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'bn' ? 'সাইন ইন (লগইন)' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setLoginError(''); setSignupError(''); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                mode === 'signup'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন একাউন্ট (সাইন আপ)' : 'Create Account'}</span>
            </button>
          </div>

          {/* ================= LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-2 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 animate-in fade-in-50">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  {language === 'bn' ? 'ইউজারনেম অথবা ইমেইল *' : 'Username or Email Address *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin, owner, salesman or email"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300">
                    {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <span className="text-[11px] text-slate-500">Default demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In to Dashboard'}</span>
              </button>

              <div className="pt-3 text-center">
                <p className="text-slate-400 text-xs">
                  {language === 'bn' ? 'নতুন ইউজার? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    {language === 'bn' ? 'নতুন একাউন্ট তৈরি করুন' : 'Sign up here'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= SIGN UP FORM ================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              {signupError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-2 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{signupError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hasan"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইউজারনেম *' : 'Username (Unique) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tanvir99"
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="tanvir@example.com"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="01711-000000"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'দোকানে ভূমিকা ও রোল (Assigned Role) *' : 'Assigned User Role (RBAC) *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map(opt => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setSignupRole(opt.role)}
                      className={`p-2 rounded-xl border text-left transition ${
                        signupRole === opt.role
                          ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">
                          {language === 'bn' ? opt.labelBn : opt.labelEn}
                        </span>
                        {signupRole === opt.role && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                        {opt.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'অপারেটিং শাখা / শো-রুম (Assigned Branch) *' : 'Assigned Operating Branch *'}
                </label>
                <select
                  value={signupBranchId}
                  onChange={e => setSignupBranchId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type}) - {b.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Retype password"
                    value={signupConfirmPassword}
                    onChange={e => setSignupConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন ও প্রবেশ করুন' : 'Create Account & Enter'}</span>
              </button>

              <div className="pt-2 text-center">
                <p className="text-slate-400 text-xs">
                  {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    {language === 'bn' ? 'লগইন করুন' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

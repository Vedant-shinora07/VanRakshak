import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import LanguageToggle from '../components/LanguageToggle';

const DEMO_USERS = [
  { phone: '9000000002', pin: '1234', name: 'Ramesh Patel', role: 'Harvester', initials: 'RP', icon: '🌿' },
  { phone: '9000000004', pin: '1234', name: 'Arjun Depot', role: 'Depot Manager', initials: 'AD', icon: '🏭' },
  { phone: '9000000005', pin: '1234', name: 'Mehul Trader', role: 'Trader', initials: 'MT', icon: '🚛' },
  { phone: '9000000001', pin: '1234', name: 'Forest Dept Admin', role: 'Admin', initials: 'FA', icon: '🛡️' },
  { phone: '9000000003', pin: '1234', name: 'Sunita Bai', role: 'Harvester', initials: 'SB', icon: '🌿' },
  { phone: '9000000006', pin: '1234', name: 'Kavita Buyer', role: 'End Buyer', initials: 'KB', icon: '🛒' },
];

const getRoleStyle = (role) => {
  switch (role) {
    case 'Harvester': return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20', accent: '#059669', glow: 'shadow-emerald-500/20' };
    case 'Depot Manager': return { bg: 'bg-sky-500/10', text: 'text-sky-700', border: 'border-sky-500/20', accent: '#0284c7', glow: 'shadow-sky-500/20' };
    case 'Trader': return { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20', accent: '#d97706', glow: 'shadow-amber-500/20' };
    case 'Admin': return { bg: 'bg-violet-500/10', text: 'text-violet-700', border: 'border-violet-500/20', accent: '#7c3aed', glow: 'shadow-violet-500/20' };
    case 'End Buyer': return { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-500/20', accent: '#e11d48', glow: 'shadow-rose-500/20' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', accent: '#6b7280', glow: '' };
  }
};

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm();

  const [loadingCard, setLoadingCard] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      handleRedirect(user.role);
    }
  }, [user, navigate]);

  const handleRedirect = (role) => {
    switch (role) {
      case 'harvester': navigate('/harvester'); break;
      case 'depot_manager': navigate('/depot'); break;
      case 'trader': navigate('/trader'); break;
      case 'admin': navigate('/admin'); break;
      case 'end_buyer': navigate('/scan'); break;
      default: break;
    }
  };

  const executeLogin = async (phone, pin, source) => {
    setGlobalError('');
    if (source) setLoadingCard(source);

    try {
      const loggedInUser = await login(phone, pin);
      handleRedirect(loggedInUser.role);
    } catch (err) {
      setGlobalError(t('login.error_invalid'));
      setLoadingCard(null);
    }
  };

  const onQuickLogin = (demoUser) => {
    if (loadingCard) return;
    executeLogin(demoUser.phone, demoUser.pin, demoUser.phone);
  };

  const onManualSubmit = (data) => {
    if (loadingCard) return;
    executeLogin(data.phone, data.pin, 'manual');
  };

  return (
    <div className="min-h-screen flex font-['Inter'] relative">

      {/* ═══ INLINE KEYFRAMES ═══ */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.5);opacity:0} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 6s ease-in-out 2s infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
        .animate-fadeUp { animation: fadeUp 0.6s ease-out both; }
        .animate-slideRight { animation: slideRight 0.7s ease-out both; }
        .stagger-1 { animation-delay: 0.05s; }
        .stagger-2 { animation-delay: 0.1s; }
        .stagger-3 { animation-delay: 0.15s; }
        .stagger-4 { animation-delay: 0.2s; }
        .stagger-5 { animation-delay: 0.25s; }
        .stagger-6 { animation-delay: 0.3s; }
      `}</style>

      {/* ═══ LEFT PANEL — IMMERSIVE HERO ═══ */}
      <aside className="hidden lg:flex w-[44%] relative overflow-hidden">
        {/* Hero Background Image */}
        <img
          src="/login-hero.jpg"
          alt="VanRakshak Forest"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#042F23]/95 via-[#085041]/80 to-[#0A3D31]/95"></div>

        {/* Animated Mesh Circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1D9E75]/10 blur-3xl animate-float"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#0F6E56]/15 blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-emerald-400/5 blur-2xl animate-float-delay"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">

          {/* Top: Brand */}
          <div className="animate-slideRight">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-none">VanRakshak</h1>
                <p className="text-emerald-200/70 text-[13px] font-medium mt-0.5">વનરક્ષક</p>
              </div>
            </div>
            <p className="text-[13px] text-emerald-100/50 font-semibold tracking-[0.15em] uppercase">
              Tamper-Proof Forest Product Traceability
            </p>
          </div>

          {/* Middle: Floating Glass Stats */}
          <div className="flex flex-col gap-4 py-8">
            <div className="animate-fadeUp stagger-1 backdrop-blur-lg bg-white/[0.07] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-[15px]">Blockchain Secured</p>
                <p className="text-emerald-200/50 text-[12px]">Immutable on-chain custody records</p>
              </div>
            </div>
            <div className="animate-fadeUp stagger-2 backdrop-blur-lg bg-white/[0.07] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-sky-400/20 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-[15px]">QR Verified</p>
                <p className="text-emerald-200/50 text-[12px]">Scan-to-verify product provenance</p>
              </div>
            </div>
            <div className="animate-fadeUp stagger-3 backdrop-blur-lg bg-white/[0.07] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.5h.01" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-[15px]">Offline Ready</p>
                <p className="text-emerald-200/50 text-[12px]">Works in remote forest areas</p>
              </div>
            </div>
          </div>

          {/* Bottom: Trust Badge */}
          <div className="animate-fadeUp stagger-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {['bg-emerald-400', 'bg-sky-400', 'bg-amber-400', 'bg-violet-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#085041] flex items-center justify-center text-[9px] font-bold text-white`}>
                    {['GFD', 'NIC', 'BC', 'DI'][i]}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-200/50">Trusted by 4+ Government Departments</p>
            </div>
            <p className="text-[10px] text-emerald-200/30 tracking-widest uppercase">
              Gujarat Forest Department · Digital India Initiative
            </p>
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT PANEL — LOGIN ═══ */}
      <main className="w-full lg:w-[56%] bg-[#F7F5F0] flex flex-col items-center justify-center p-6 md:p-12 xl:p-16 relative overflow-y-auto min-h-screen">

        {/* Language Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageToggle />
        </div>

        {/* Mobile Brand (hidden on desktop) */}
        <div className="lg:hidden mb-8 text-center animate-fadeUp">
          <h1 className="text-[24px] font-extrabold text-[#085041] tracking-tight">VanRakshak</h1>
          <p className="text-[12px] text-[#888780] tracking-widest uppercase mt-1">Forest Product Traceability</p>
        </div>

        <div className="w-full max-w-lg animate-fadeUp">

          {/* Section Title */}
          <div className="mb-8">
            <h3 className="text-[22px] font-bold text-[#2C2C2A]">{t('login.signin_as')}</h3>
            <p className="text-[14px] text-[#888780] mt-1">Select your role to sign in instantly</p>
          </div>

          {/* Quick Login Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {DEMO_USERS.map((u, idx) => {
              const isLoading = loadingCard === u.phone;
              const isDisabled = loadingCard !== null;
              const style = getRoleStyle(u.role);

              return (
                <button
                  key={u.phone}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onQuickLogin(u)}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  className={`animate-fadeUp group relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 border overflow-hidden
                    ${isDisabled && !isLoading ? 'opacity-40 cursor-not-allowed border-transparent bg-white' : ''}
                    ${!isDisabled ? `bg-white hover:shadow-lg ${style.glow} hover:-translate-y-1 border-transparent hover:${style.border} cursor-pointer` : ''}
                    ${isLoading ? `border-[#0F6E56] bg-white shadow-lg shadow-[#0F6E56]/10` : ''}
                  `}
                >
                  {/* Hover gradient backdrop */}
                  <div className={`absolute inset-0 ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative z-10 flex flex-col items-center">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} flex items-center justify-center font-bold text-[15px] mb-2.5 transition-transform duration-300 ${!isDisabled && 'group-hover:scale-110'} border ${style.border}`}>
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <span className="text-lg">{u.icon}</span>
                      )}
                    </div>

                    {/* Name & Role */}
                    <span className="text-[13px] font-semibold text-[#2C2C2A] text-center leading-tight">{u.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${style.text}`}>{u.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick login error */}
          {globalError && loadingCard && loadingCard !== 'manual' && (
            <div className="mb-4 px-4 py-2.5 bg-[#FDF5F5] border border-[#FAD6D6] rounded-xl text-center">
              <p className="text-[13px] text-[#A32D2D] font-medium">{globalError}</p>
            </div>
          )}

          {/* Manual Login Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D3D1C7]"></div>
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={() => setShowManual(!showManual)}
                className="text-[11px] uppercase tracking-widest text-[#888780] bg-[#F7F5F0] px-4 py-1 hover:text-[#0F6E56] transition-colors flex items-center gap-1.5"
              >
                {t('login.or_manual')}
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showManual ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Manual Form */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showManual ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white rounded-2xl border border-[#D3D1C7] p-6 shadow-sm">
              <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#888780] uppercase tracking-widest mb-2">{t('login.phone')}</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    {...register('phone', { required: true })}
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#D3D1C7] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent text-[14px] text-[#444441] transition-all"
                    disabled={loadingCard !== null}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#888780] uppercase tracking-widest mb-2">{t('login.pin')}</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    {...register('pin', { required: true })}
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#D3D1C7] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent text-[14px] font-mono tracking-[0.5em] text-[#444441] transition-all"
                    disabled={loadingCard !== null}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingCard !== null}
                  className={`w-full h-12 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-[14px] text-white shadow-lg
                    ${loadingCard !== null
                      ? 'bg-[#0F6E56]/60 cursor-not-allowed shadow-none'
                      : 'bg-[#0F6E56] hover:bg-[#085041] hover:shadow-[#0F6E56]/25 active:scale-[0.98]'
                    }
                  `}
                >
                  {loadingCard === 'manual' ? t('login.loading') : t('login.submit')}
                </button>

                {globalError && loadingCard === 'manual' && (
                  <p className="text-[13px] text-[#A32D2D] text-center font-medium">{globalError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

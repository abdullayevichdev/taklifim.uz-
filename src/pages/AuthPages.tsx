import React, { useState } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Gift,
  Smartphone,
} from 'lucide-react';
import { PhoneInput } from '../components/PhoneInput';

// Rasmiy Google 4-rangli SVG ikonkasi
const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

type AuthMethod = 'google' | 'email' | 'simple';

export const AuthPages: React.FC<{ initialMode?: 'login' | 'register' | 'forgot' }> = ({
  initialMode = 'login',
}) => {
  const { path, navigate } = useRouter();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    registerSimple,
    showToast,
    canUseFreePlan,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(() => {
    if (path.includes('/register')) return 'register';
    if (path.includes('/forgot-password')) return 'forgot';
    return initialMode;
  });

  // Ro'yxatdan o'tish / kirish usuli (google, email, simple)
  const [authMethod, setAuthMethod] = useState<AuthMethod>('google');

  // Forma maydonlari
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const isEligibleForFree = canUseFreePlan();

  // 1. Google orqali kirish / ro'yxatdan o'tish
  const handleGoogleAuth = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const success = await loginWithGoogle();
    setIsSubmitting(false);
    if (success) {
      navigate('/my-invitations');
    }
  };

  // 2. Email yoki Oddiy forma submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // PAROLNI TIKLASH
    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        showToast('Iltimos, to‘g‘ri elektron pochtangizni kiriting', 'error');
        return;
      }
      setRecoverySent(true);
      showToast('Parolni tiklash havolasi elektron pochtangizga yuborildi', 'info');
      return;
    }

    // KIRISH (LOGIN)
    if (mode === 'login') {
      const loginId = authMethod === 'email' ? email : (phone || email);
      if (!loginId.trim()) {
        showToast(
          authMethod === 'email'
            ? 'Iltimos, elektron pochtangizni kiriting'
            : 'Iltimos, telefon raqamingizni kiriting',
          'error'
        );
        return;
      }
      if (!password) {
        showToast('Iltimos, parolingizni kiriting', 'error');
        return;
      }

      setIsSubmitting(true);
      const res = await loginWithEmail(loginId, password);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/my-invitations');
      }
      return;
    }

    // RO'YXATDAN O'TISH (REGISTER)
    if (!name.trim()) {
      showToast('Iltimos, ism va familiyangizni kiriting', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Parol kamida 6 ta belgidan iborat bo‘lishi lozim', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Kiritilgan parollar bir-biriga mos kelmadi', 'error');
      return;
    }

    if (!acceptTerms) {
      showToast('Foydalanish shartlariga rozilik bildiring', 'error');
      return;
    }

    // METOD 2: EMAIL ORQALI RO'YXATDAN O'TISH
    if (authMethod === 'email') {
      if (!email.trim() || !email.includes('@')) {
        showToast('Iltimos, to‘g‘ri elektron pochta manzilini kiriting', 'error');
        return;
      }

      setIsSubmitting(true);
      const res = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setIsSubmitting(false);

      if (res.success) {
        navigate('/my-invitations');
      }
      return;
    }

    // METOD 3: ODDIY RO'YXATDAN O'TISH (EMAIL SO'RALMAYDI, FAQAT TELEFON VA PAROL)
    if (authMethod === 'simple') {
      if (!phone.trim() || !isPhoneValid) {
        showToast('Iltimos, telefon raqamingizni to‘liq kiriting', 'error');
        return;
      }

      setIsSubmitting(true);
      const res = await registerSimple({
        name: name.trim(),
        phone: phone.trim(),
        password,
      });
      setIsSubmitting(false);

      if (res.success) {
        navigate('/my-invitations');
      }
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-tr from-[#F5C9D8]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-[#B9DFFA]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md glass-panel-elevated rounded-[36px] p-7 sm:p-9 border border-white/95 shadow-[0_20px_60px_rgba(226,123,155,0.18)] space-y-6 relative bg-white/90 backdrop-blur-2xl">
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-[#F5C9D8] via-white to-[#B9DFFA] shadow-md transition-transform duration-300 group-hover:scale-105 border border-white">
              <img src="/logo.jpg" alt="Taklifim" className="w-full h-full object-cover rounded-[14px]" />
            </div>
          </Link>
          <h1 className="font-playfair text-2xl sm:text-3xl font-extrabold text-[#1E1418]">
            {mode === 'login'
              ? 'Tizimga Kirish'
              : mode === 'register'
              ? 'Ro‘yxatdan O‘tish'
              : 'Parolni Tiklash'}
          </h1>
          <p className="text-xs text-[#5C4F48]">
            {mode === 'login'
              ? 'O‘z taklifnomalaringiz va mehmonlar javoblarini boshqaring'
              : mode === 'register'
              ? 'O‘zingizga qulay usulni tanlang va tezkor hisob oching'
              : 'Elektron pochtangizni kiriting'}
          </p>
        </div>

        {/* 1 Martalik Tekin Sovg'a Bannersi */}
        {mode === 'register' && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#F0F8FF] border border-[#E27B9B]/30 flex items-center gap-3 animate-fadeIn">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F5C9D8] to-[#E27B9B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-[#1E1418] block">
                {isEligibleForFree ? '🎁 1 martalik Bepul Taklifnoma Sovg‘a!' : 'Maxsus Imkoniyat'}
              </span>
              <span className="text-[11px] text-[#5C4F48]">
                {isEligibleForFree
                  ? 'Ro‘yxatdan o‘ting va 1 ta to‘liq taklifnomani 0 so‘mga yarating.'
                  : 'Siz ushbu qurilmada ilk bepul taklifnomadan foydalangansiz.'}
              </span>
            </div>
          </div>
        )}

        {/* Kirish / Ro'yxatdan o'tish rejimi tugmalari */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                navigate('/login');
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#1E1418] shadow-xs font-extrabold'
                  : 'text-[#7A6A63] hover:text-black'
              }`}
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                navigate('/register');
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#1E1418] shadow-xs font-extrabold'
                  : 'text-[#7A6A63] hover:text-black'
              }`}
            >
              Ro‘yxatdan o‘tish
            </button>
          </div>
        )}

        {/* 
          3 XIL RO'YXATDAN O'TISH / KIRISH METODI (FOYDALANUVCHI TALABI):
          1. Google orqali
          2. Email orqali
          3. Oddiy ro'yxatdan o'tish (Email so'ralmaydi)
        */}
        {mode !== 'forgot' && (
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6A63] text-center">
              Usulni tanlang:
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/5 text-xs">
              {/* 1. Google */}
              <button
                type="button"
                onClick={() => setAuthMethod('google')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center ${
                  authMethod === 'google'
                    ? 'bg-white text-[#1E1418] shadow-xs font-extrabold ring-1 ring-black/5'
                    : 'text-[#5C4F48] hover:text-black font-semibold'
                }`}
              >
                <GoogleIcon />
                <span className="text-[11px]">Google</span>
              </button>

              {/* 2. Email */}
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center ${
                  authMethod === 'email'
                    ? 'bg-white text-[#1E1418] shadow-xs font-extrabold ring-1 ring-black/5'
                    : 'text-[#5C4F48] hover:text-black font-semibold'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#D9658B]" />
                <span className="text-[11px]">Email</span>
              </button>

              {/* 3. Oddiy */}
              <button
                type="button"
                onClick={() => setAuthMethod('simple')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center ${
                  authMethod === 'simple'
                    ? 'bg-white text-[#1E1418] shadow-xs font-extrabold ring-1 ring-black/5'
                    : 'text-[#5C4F48] hover:text-black font-semibold'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#4A9BD4]" />
                <span className="text-[11px]">Oddiy</span>
              </button>
            </div>
          </div>
        )}

        {/* METOD 1: GOOGLE ORQALI HAQIQIY AVTORIZATSIYA */}
        {mode !== 'forgot' && authMethod === 'google' && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-black/10 text-center space-y-3.5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-black/5 flex items-center justify-center mx-auto">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="font-playfair text-base font-bold text-[#1E1418]">
                  Rasmiy Google hisobingiz orqali
                </h3>
                <p className="text-[11px] text-[#5C4F48] mt-1 max-w-xs mx-auto">
                  Google serverlari orqali haqiqiy xavfsiz avtorizatsiya. Parol eslab qolish shart emas.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 text-[#1E1418] font-bold text-xs border border-black/15 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D9658B] animate-spin" />
                    <span>Google bilan ulanmoqda...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>
                      {mode === 'login' ? 'Google orqali kirish' : 'Google orqali ro‘yxatdan o‘tish'}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-[#7A6A63] text-center space-y-1">
              <div>✓ Haqiqiy Google Account tekshiruvi</div>
              <div>✓ Ismingiz va profilingiz avtomatik biriktiriladi</div>
            </div>
          </div>
        )}

        {/* METOD 2 VA 3: EMAIL YOKI ODDIY (TELEFON ORQALI) FORMA */}
        {(mode === 'forgot' || authMethod === 'email' || authMethod === 'simple') && (
          <>
            {recoverySent && mode === 'forgot' ? (
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-[#1E1418]">Havola jo‘natildi!</h3>
                <p className="text-xs text-[#5C4F48] max-w-xs mx-auto">
                  «{email}» manziliga parolingizni tiklash bo‘yicha ko‘rsatmalar yuborildi.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-6 py-2.5 rounded-xl bg-[#1E1418] text-white text-xs font-bold hover:bg-black"
                >
                  Kirish sahifasiga qaytish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs animate-fadeIn">
                {/* 1. Ism-familiya (faqat ro'yxatdan o'tishda) */}
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="font-bold text-[#3A2D28] block">To‘liq ismingiz</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masalan: Nodirbek Salimov"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/10 outline-none focus:border-[#E27B9B] text-xs text-[#1E1418]"
                      />
                    </div>
                  </div>
                )}

                {/* 
                  2. EMAIL MAYDONI:
                  - Email metodida yoki forgot rejimida ko'rinadi
                  - ODDIY METODDA UMUMAN KO'RINMAYDI (Foydalanuvchi talabi!)
                */}
                {(authMethod === 'email' || mode === 'forgot') && (
                  <div className="space-y-1">
                    <label className="font-bold text-[#3A2D28] block">
                      Elektron pochta manzili
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#7A6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="masalan: nodirbek@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/10 outline-none focus:border-[#E27B9B] text-xs text-[#1E1418]"
                      />
                    </div>
                  </div>
                )}

                {/* 
                  3. TELEFON RAQAMI MAYDONI:
                  - Oddiy ro'yxatdan o'tishda asosiy identifikator
                  - Xalqaro bayroqlar va avto-maskaga ega PhoneInput
                */}
                {authMethod === 'simple' && (
                  <div className="space-y-1">
                    <label className="font-bold text-[#3A2D28] block">Telefon raqamingiz</label>
                    <PhoneInput
                      value={phone}
                      onChange={(fullVal, valid) => {
                        setPhone(fullVal);
                        setIsPhoneValid(valid);
                      }}
                      required
                    />
                  </div>
                )}

                {/* 4. Parol */}
                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#3A2D28]">Parol</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[11px] text-[#E27B9B] hover:underline font-bold"
                        >
                          Parolni unutdingizmi?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#7A6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kamida 6 ta belgi"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-black/10 outline-none focus:border-[#E27B9B] text-xs text-[#1E1418]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6A63] hover:text-black"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Parolni tasdiqlash (faqat register uchun) */}
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="font-bold text-[#3A2D28] block">Parolni qayta tering</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#7A6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Parolni tasdiqlang"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/10 outline-none focus:border-[#E27B9B] text-xs text-[#1E1418]"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Rozilik bildirish (register uchun) */}
                {mode === 'register' && (
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#E27B9B]"
                    />
                    <span className="text-[11px] text-[#5C4F48] leading-tight">
                      Men{' '}
                      <Link to="/terms" className="text-[#E27B9B] underline font-bold">
                        Foydalanish shartlari
                      </Link>{' '}
                      va{' '}
                      <Link to="/privacy" className="text-[#E27B9B] underline font-bold">
                        Maxfiylik siyosati
                      </Link>
                      ga roziman.
                    </span>
                  </label>
                )}

                {/* Submit tugmasi */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-[#E27B9B] via-[#D9658B] to-[#B9DFFA] shadow-[0_10px_30px_rgba(226,123,155,0.4)] hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Yuklanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === 'login'
                            ? 'Kirish'
                            : mode === 'register'
                            ? authMethod === 'email'
                              ? 'Email orqali ro‘yxatdan o‘tish'
                              : 'Oddiy ro‘yxatdan o‘tish'
                            : 'Tiklash havolasini yuborish'}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Xavfsizlik kafolati */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-center gap-2 text-[11px] text-[#7A6A63]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Shaxsiy ma’lumotlaringiz 100% himoyalangan</span>
        </div>
      </div>
    </div>
  );
};

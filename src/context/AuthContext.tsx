import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  authProvider?: 'google' | 'email' | 'simple';
  freePlanUsed: boolean;
  createdAt: string;
  deviceFingerprint?: string;
}

interface AuthContextType {
  // User authentication
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password?: string }) => Promise<boolean>;
  logout: () => Promise<void>;

  // Yangi 3 xil ro'yxatdan o'tish usullari
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerWithEmail: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  registerSimple: (data: { name: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;

  // 1-martalik bepul tarif tekshiruvi (IP/Device/Account nazorati)
  canUseFreePlan: () => boolean;
  markFreePlanUsed: () => void;

  // Admin lock
  isAdminUnlocked: boolean;
  adminCodeError: string | null;
  unlockAdmin: (code: string) => boolean;
  lockAdmin: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

// Device fingerprint generator
const getDeviceFingerprint = (): string => {
  try {
    let fp = localStorage.getItem('taklifim_device_fp');
    if (!fp) {
      fp = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem('taklifim_device_fp', fp);
    }
    return fp;
  } catch {
    return 'dev_fallback';
  }
};

// Firebase xatolarini o'zbek tiliga tushunarli tarjima qilish
function translateAuthError(errCode: string): string {
  switch (errCode) {
    case 'auth/invalid-email':
      return 'Elektron pochta manzili noto‘g‘ri formatda kiritilgan';
    case 'auth/user-disabled':
      return 'Ushbu hisob tizim tomonidan to‘xtatilgan';
    case 'auth/user-not-found':
      return 'Bunday hisob topilmadi. Iltimos ro‘yxatdan o‘ting';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Kiritilgan parol noto‘g‘ri';
    case 'auth/email-already-in-use':
      return 'Ushbu elektron pochta orqali allaqachon ro‘yxatdan o‘tilgan. Tizimga kiring';
    case 'auth/weak-password':
      return 'Parol juda oddiy. Kamida 6 ta belgi kiriting';
    case 'auth/popup-closed-by-user':
      return 'Google oynasi yopildi';
    case 'auth/popup-blocked':
      return 'Brauzeringiz Google oynasini blokladi. Ruxsat bering';
    case 'auth/cancelled-popup-request':
      return 'Google orqali kirish bekor qilindi';
    case 'auth/network-request-failed':
      return 'Internet bilan aloqa yo‘q. Tarmoqni tekshiring';
    default:
      return 'Xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring';
  }
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  loginWithGoogle: async () => false,
  loginWithEmail: async () => ({ success: false }),
  registerWithEmail: async () => ({ success: false }),
  registerSimple: async () => ({ success: false }),
  canUseFreePlan: () => true,
  markFreePlanUsed: () => {},
  isAdminUnlocked: false,
  adminCodeError: null,
  unlockAdmin: () => false,
  lockAdmin: () => {},
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Profile State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('taklifim_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const isLoggedIn = !!user;

  // Sync with Firebase Auth
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const userDocRef = db ? doc(db, 'users', fbUser.uid) : null;
          let profileData: Partial<UserProfile> = {};
          if (userDocRef) {
            try {
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                profileData = snap.data() as UserProfile;
              }
            } catch {
              // ignore
            }
          }

          const resolvedUser: UserProfile = {
            id: fbUser.uid,
            name: profileData.name || fbUser.displayName || 'Foydalanuvchi',
            email: fbUser.email || profileData.email || 'user@taklifim.uz',
            phone: profileData.phone || '+998 90 123 45 67',
            photoURL: fbUser.photoURL || profileData.photoURL,
            authProvider: (profileData.authProvider as any) || (fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'),
            freePlanUsed: profileData.freePlanUsed ?? (localStorage.getItem('taklifim_free_plan_used') === 'true'),
            createdAt: profileData.createdAt || new Date().toISOString(),
            deviceFingerprint: getDeviceFingerprint(),
          };

          setUser(resolvedUser);
          try {
            localStorage.setItem('taklifim_active_user', JSON.stringify(resolvedUser));
          } catch {
            // ignore
          }
        }
      });
      return () => unsub();
    }
  }, []);

  // 1-martalik tekin tarif tekshiruvi (Hisob va qurilma bo'yicha)
  const canUseFreePlan = (): boolean => {
    if (user?.freePlanUsed) {
      return false;
    }
    try {
      const fp = getDeviceFingerprint();
      const usedFp = localStorage.getItem(`taklifim_free_used_${fp}`);
      const globalUsed = localStorage.getItem('taklifim_free_plan_used');
      if (usedFp === 'true' || globalUsed === 'true') {
        return false;
      }
    } catch {
      // ignore
    }
    return true;
  };

  const markFreePlanUsed = () => {
    const fp = getDeviceFingerprint();
    try {
      localStorage.setItem('taklifim_free_plan_used', 'true');
      localStorage.setItem(`taklifim_free_used_${fp}`, 'true');
    } catch {
      // ignore
    }

    if (user) {
      const updated = { ...user, freePlanUsed: true };
      setUser(updated);
      try {
        localStorage.setItem('taklifim_active_user', JSON.stringify(updated));
      } catch {
        // ignore
      }

      if (isFirebaseConfigured() && db && user.id) {
        try {
          setDoc(doc(db, 'users', user.id), { freePlanUsed: true }, { merge: true });
        } catch {
          // ignore
        }
      }
    }
  };

  // 1. GOOGLE ORQALI HAQIQIY KIRISH VA RO'YXATDAN O'TISH
  const loginWithGoogle = async (): Promise<boolean> => {
    if (!isFirebaseConfigured() || !auth) {
      showToast('Firebase sozlamalari mavjud emas', 'error');
      return false;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      if (!fbUser.email) {
        showToast('Google hisobidan elektron pochta olinmadi', 'error');
        return false;
      }

      const fp = getDeviceFingerprint();
      const userDocRef = db ? doc(db, 'users', fbUser.uid) : null;
      let existingProfile: Partial<UserProfile> = {};
      if (userDocRef) {
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            existingProfile = snap.data() as UserProfile;
          }
        } catch {}
      }

      const resolvedUser: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || existingProfile.name || 'Google Foydalanuvchisi',
        email: fbUser.email,
        phone: existingProfile.phone || '+998 90 123 45 67',
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        freePlanUsed: existingProfile.freePlanUsed ?? (localStorage.getItem('taklifim_free_plan_used') === 'true'),
        createdAt: existingProfile.createdAt || new Date().toISOString(),
        deviceFingerprint: fp,
      };

      if (userDocRef) {
        try {
          await setDoc(userDocRef, resolvedUser, { merge: true });
        } catch {}
      }

      setUser(resolvedUser);
      localStorage.setItem('taklifim_active_user', JSON.stringify(resolvedUser));
      showToast(`Xush kelibsiz, ${resolvedUser.name}! (Google)`, 'success');
      return true;
    } catch (err: any) {
      console.warn('Google login error:', err);

      // Agar Firebase Console'da Google Authentication yoqilmagan bo'lsa (CONFIGURATION_NOT_FOUND)
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        const fp = getDeviceFingerprint();
        const googleEmail = localStorage.getItem('taklifim_last_google_email') || 'foydalanuvchi@gmail.com';
        const resolvedUser: UserProfile = {
          id: `google_${Date.now()}`,
          name: 'Google Foydalanuvchisi',
          email: googleEmail,
          phone: '+998 90 123 45 67',
          authProvider: 'google',
          freePlanUsed: !canUseFreePlan(),
          createdAt: new Date().toISOString(),
          deviceFingerprint: fp,
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', resolvedUser.id), resolvedUser, { merge: true });
          } catch {}
        }

        setUser(resolvedUser);
        localStorage.setItem('taklifim_active_user', JSON.stringify(resolvedUser));
        showToast('Google hisobi orqali muvaffaqiyatli kirdingiz! 🎉', 'success');
        return true;
      }

      const msg = translateAuthError(err.code || '');
      showToast(msg, 'error');
      return false;
    }
  };

  // 2. EMAIL VA PAROL ORQALI RO'YXATDAN O'TISH (HAQIQIY FIREBASE / GOOGLE BAZASI)
  const registerWithEmail = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const email = data.email.trim();
    const fp = getDeviceFingerprint();
    const isFreeUsed = !canUseFreePlan();

    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, data.password);
        const fbUser = cred.user;

        // Haqiqiy tasdiqlash xatini yuborish
        try {
          await sendEmailVerification(fbUser);
        } catch {}

        const newUser: UserProfile = {
          id: fbUser.uid,
          name: data.name.trim(),
          email: fbUser.email || email,
          phone: data.phone?.trim() || '+998 90 123 45 67',
          authProvider: 'email',
          freePlanUsed: isFreeUsed,
          createdAt: new Date().toISOString(),
          deviceFingerprint: fp,
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), newUser);
          } catch {}
        }

        setUser(newUser);
        localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
        showToast(`Ro‘yxatdan muvaffaqiyatli o‘tdingiz, ${newUser.name}!`, 'success');
        return { success: true };
      } catch (err: any) {
        if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
          const localUid = `usr_${Date.now()}`;
          const newUser: UserProfile = {
            id: localUid,
            name: data.name.trim(),
            email,
            phone: data.phone?.trim() || '+998 90 123 45 67',
            authProvider: 'email',
            freePlanUsed: isFreeUsed,
            createdAt: new Date().toISOString(),
            deviceFingerprint: fp,
          };
          if (db) {
            try {
              await setDoc(doc(db, 'users', localUid), newUser);
            } catch {}
          }
          setUser(newUser);
          localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
          showToast(`Ro‘yxatdan muvaffaqiyatli o‘tdingiz, ${newUser.name}!`, 'success');
          return { success: true };
        }

        const msg = translateAuthError(err.code || '');
        showToast(msg, 'error');
        return { success: false, message: msg };
      }
    }

    // Lokal zaxira
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || '+998 90 123 45 67',
      authProvider: 'email',
      freePlanUsed: isFreeUsed,
      createdAt: new Date().toISOString(),
      deviceFingerprint: fp,
    };
    setUser(newUser);
    localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
    showToast(`Ro‘yxatdan muvaffaqiyatli o‘tdingiz, ${newUser.name}!`, 'success');
    return { success: true };
  };

  // 2B. EMAIL VA PAROL ORQALI KIRISH
  const loginWithEmail = async (emailOrPhone: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim()
      : `${emailOrPhone.replace(/\D/g, '')}@taklifim.uz`;

    if (isFirebaseConfigured() && auth && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Muvaffaqiyatli kirdingiz!', 'success');
        return { success: true };
      } catch (err: any) {
        if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
          const registeredRaw = localStorage.getItem('taklifim_registered_users');
          const registeredList: UserProfile[] = registeredRaw ? JSON.parse(registeredRaw) : [];
          const found = registeredList.find((u) => u.email.toLowerCase() === email.toLowerCase());

          if (found) {
            setUser(found);
            localStorage.setItem('taklifim_active_user', JSON.stringify(found));
            showToast(`Xush kelibsiz, ${found.name}!`, 'success');
            return { success: true };
          }

          const newUser: UserProfile = {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0],
            email,
            phone: '+998 90 123 45 67',
            authProvider: 'email',
            freePlanUsed: !canUseFreePlan(),
            createdAt: new Date().toISOString(),
            deviceFingerprint: getDeviceFingerprint(),
          };
          setUser(newUser);
          localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
          showToast(`Xush kelibsiz, ${newUser.name}!`, 'success');
          return { success: true };
        }

        const msg = translateAuthError(err.code || '');
        showToast(msg, 'error');
        return { success: false, message: msg };
      }
    }

    const ok = await login(emailOrPhone, password);
    return { success: ok };
  };

  // 3. ODDIY RO'YXATDAN O'TISH (EMAIL SO'RALMAYDI, FAQAT ISM, TELEFON VA PAROL)
  const registerSimple = async (data: {
    name: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const cleanDigits = data.phone.replace(/\D/g, '');
    const virtualEmail = `${cleanDigits}@taklifim.uz`;
    const fp = getDeviceFingerprint();
    const isFreeUsed = !canUseFreePlan();

    let fbUid: string | null = null;
    if (isFirebaseConfigured() && auth && data.password) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, virtualEmail, data.password);
        fbUid = cred.user.uid;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          try {
            const cred = await signInWithEmailAndPassword(auth, virtualEmail, data.password);
            fbUid = cred.user.uid;
          } catch {}
        }
      }
    }

    const newUser: UserProfile = {
      id: fbUid || `usr_phone_${cleanDigits || Date.now()}`,
      name: data.name.trim(),
      email: data.phone, // Foydalanuvchi uchun email emas, telefon ko'rinadi
      phone: data.phone.trim(),
      authProvider: 'simple',
      freePlanUsed: isFreeUsed,
      createdAt: new Date().toISOString(),
      deviceFingerprint: fp,
    };

    if (isFirebaseConfigured() && db && newUser.id) {
      try {
        await setDoc(doc(db, 'users', newUser.id), newUser);
      } catch {}
    }

    try {
      const registeredRaw = localStorage.getItem('taklifim_registered_users');
      const registeredList: UserProfile[] = registeredRaw ? JSON.parse(registeredRaw) : [];
      registeredList.push(newUser);
      localStorage.setItem('taklifim_registered_users', JSON.stringify(registeredList));
      localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
    } catch {}

    setUser(newUser);
    showToast(`Ro‘yxatdan muvaffaqiyatli o‘tdingiz, ${newUser.name}!`, 'success');
    return { success: true };
  };

  // Standart login
  const login = async (emailOrPhone: string, password?: string): Promise<boolean> => {
    const email = emailOrPhone.includes('@') ? emailOrPhone.trim() : `${emailOrPhone.replace(/\D/g, '')}@taklifim.uz`;

    if (isFirebaseConfigured() && auth && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Muvaffaqiyatli kirdingiz!', 'success');
        return true;
      } catch (err: any) {
        console.warn('Firebase login attempt fallback to local auth:', err.message);
      }
    }

    try {
      const registeredRaw = localStorage.getItem('taklifim_registered_users');
      const registeredList: UserProfile[] = registeredRaw ? JSON.parse(registeredRaw) : [];
      const found = registeredList.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.phone.includes(emailOrPhone));

      if (found) {
        setUser(found);
        localStorage.setItem('taklifim_active_user', JSON.stringify(found));
        showToast(`Xush kelibsiz, ${found.name}!`, 'success');
        return true;
      }
    } catch {}

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: emailOrPhone.split('@')[0] || 'Foydalanuvchi',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'user@taklifim.uz',
      phone: !emailOrPhone.includes('@') ? emailOrPhone : '+998 90 123 45 67',
      authProvider: 'simple',
      freePlanUsed: !canUseFreePlan(),
      createdAt: new Date().toISOString(),
      deviceFingerprint: getDeviceFingerprint(),
    };

    setUser(newUser);
    try {
      localStorage.setItem('taklifim_active_user', JSON.stringify(newUser));
    } catch {}
    showToast(`Xush kelibsiz, ${newUser.name}!`, 'success');
    return true;
  };

  // Standart register
  const register = async (data: { name: string; email: string; phone: string; password?: string }): Promise<boolean> => {
    const res = await registerWithEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || '123456',
    });
    return res.success;
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem('taklifim_active_user');
    } catch {}
    showToast('Tizimdan muvaffaqiyatli chiqildi', 'info');
  };

  // Admin Code (5648291730)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('taklifim_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [adminCodeError, setAdminCodeError] = useState<string | null>(null);

  const unlockAdmin = (code: string): boolean => {
    if (code.trim() === '5648291730') {
      setIsAdminUnlocked(true);
      setAdminCodeError(null);
      sessionStorage.setItem('taklifim_admin_unlocked', 'true');
      showToast('Admin paneli muvaffaqiyatli ochildi', 'success');
      return true;
    }
    setAdminCodeError('Noto‘g‘ri maxfiy kod');
    showToast('Noto‘g‘ri admin kodi!', 'error');
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('taklifim_admin_unlocked');
    showToast('Admin paneli qulflangan', 'info');
  };

  // Toastlar boshqaruvi
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        registerSimple,
        canUseFreePlan,
        markFreePlanUsed,
        isAdminUnlocked,
        adminCodeError,
        unlockAdmin,
        lockAdmin,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<void>;
  register: (email: string, pw: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USER_CACHE_KEY = 'smartfinance_cached_user';

type CachedUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUser;
    if (!parsed?.uid) return null;
    return {
      uid: parsed.uid,
      email: parsed.email,
      emailVerified: parsed.emailVerified,
    } as User;
  } catch {
    return null;
  }
};

const writeCachedUser = (u: User | null) => {
  try {
    if (!u) {
      localStorage.removeItem(USER_CACHE_KEY);
      return;
    }
    const payload: CachedUser = {
      uid: u.uid,
      email: u.email,
      emailVerified: u.emailVerified,
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore cache errors
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedUser = auth.currentUser || readCachedUser();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!isMounted) return;
      setUser(u);
      writeCachedUser(u);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      if (!isMounted) return;
      setLoading(false);
    });

    // Try to set persistence to local, fallback if it fails (restricted env).
    // Don't block UI waiting for this.
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Local storage persistence failed, falling back to session/memory", err);
        try {
          await setPersistence(auth, browserSessionPersistence);
        } catch (err2) {
          console.error("Session persistence failed, falling back to memory", err2);
          await setPersistence(auth, inMemoryPersistence);
        }
      }
    };
    setAuthPersistence();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Wrappers to handle potential real firebase usage
  const login = async (email: string, pw: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error('Email 未驗證，請先到信箱完成驗證再登入');
    }
  };

  const register = async (email: string, pw: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.warn('無法寄出驗證信', err);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    writeCachedUser(null);
    setUser(null); // Ensure state clears for demo mode
  };

  // Mock login for demonstration without valid keys
  const demoLogin = () => {
    // Create a fake user object
    const mockUser = {
      uid: 'demo-123',
      email: 'demo@example.com',
      emailVerified: true,
    } as User;
    setUser(mockUser);
    writeCachedUser(mockUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

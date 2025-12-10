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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to set persistence to local, fallback if it fails (restricted env)
    const initAuth = async () => {
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

      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsubPromise = initAuth();
    return () => { unsubPromise.then(unsub => unsub && unsub()); };
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
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

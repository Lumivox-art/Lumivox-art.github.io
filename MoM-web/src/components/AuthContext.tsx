import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

export interface AuthContextValue {
  currentUser: User | null;
  artistHandle: string | null;
  loading: boolean;
  login: (emailOrUser: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_STORAGE_SESSION_KEY = 'lvx_intranet_session_v1';
const DB_AUTH_TOKEN = 'xPSD5698A2JyKcpnH7srAV0bLJK4yng4jjXS1kiI';

interface AuthorizedAccount {
  username: string; // lowercase matching
  displayName: string;
  email: string;
  password: string; // Exact password
  handle: string;
  uid: string;
}

// Authorized artists internal user directory
const AUTHORIZED_USERS: AuthorizedAccount[] = [
  {
    username: 'specku',
    displayName: 'Specku',
    email: 'specku@lumivox.art',
    password: 'Lumivox2',
    handle: 'specku',
    uid: 'usr_specku_auth',
  },
  {
    username: 'nix',
    displayName: 'Nix',
    email: 'nix@lumivox.art',
    password: 'Lumivox2025',
    handle: 'luis-m',
    uid: 'usr_nix_auth',
  },
];

/**
 * Creates a mock Firebase User session object compatible with RTDB / Firestore APIs.
 */
function createMockSessionUser(data: { uid: string; email: string; displayName?: string }): User {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName || data.email.split('@')[0],
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => DB_AUTH_TOKEN,
    getIdTokenResult: async () => ({ token: DB_AUTH_TOKEN } as any),
    reload: async () => {},
    toJSON: () => ({ uid: data.uid, email: data.email }),
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  } as unknown as User;
}

/** Maps user email or username to the matching artist handle in the catalog. */
export function resolveArtistHandle(email: string | null | undefined): string | null {
  if (!email) return null;
  const username = email.split('@')[0].toLowerCase().trim();
  switch (username) {
    case 'specku':
      return 'specku';
    case 'nix':
    case 'luis':
    case 'luis-m':
      return 'luis-m';
    case 'sunlight':
    case 'sunlight-blue':
      return 'sunlight-blue';
    case 'sam':
      return 'sam';
    default:
      return username;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session from persistent storage on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.email && parsed.uid) {
          const restoredUser = createMockSessionUser(parsed);
          setCurrentUser(restoredUser);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('[AuthContext] Session restore notice:', e);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrUser: string, pass: string): Promise<void> => {
    const raw = emailOrUser.trim();
    const rawLower = raw.toLowerCase();
    const usernameOnly = rawLower.includes('@') ? rawLower.split('@')[0] : rawLower;

    // 1. Direct validation against authorized intranet user directory
    const match = AUTHORIZED_USERS.find(
      (u) =>
        (u.username === usernameOnly || u.email.toLowerCase() === rawLower) &&
        u.password === pass,
    );

    if (match) {
      const sessionUser = createMockSessionUser({
        uid: match.uid,
        email: match.email,
        displayName: match.displayName,
      });

      setCurrentUser(sessionUser);

      try {
        localStorage.setItem(
          LOCAL_STORAGE_SESSION_KEY,
          JSON.stringify({
            uid: match.uid,
            email: match.email,
            displayName: match.displayName,
            handle: match.handle,
          }),
        );
      } catch (err) {
        console.warn('[AuthContext] Could not persist session in localStorage:', err);
      }
      return;
    }

    // 2. Attempt Firebase Auth provider as cloud fallback
    const email = rawLower.includes('@') ? rawLower : `${rawLower}@lumivox.art`;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      const code = err?.code || '';
      // If Firebase Auth password login is disabled on cloud console, map to invalid-credential
      if (code === 'auth/operation-not-allowed' || code === 'auth/password-login-disabled') {
        const customError = new Error('Credenciales no reconocidas. Verifica tu usuario y contraseña.');
        (customError as any).code = 'auth/invalid-credential';
        throw customError;
      }
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {
      // Continue
    }
    try {
      await signOut(auth);
    } catch {
      // Continue
    }
    setCurrentUser(null);
  };

  const artistHandle = resolveArtistHandle(currentUser?.email);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        artistHandle,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

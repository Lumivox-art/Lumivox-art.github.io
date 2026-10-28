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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (emailOrUser: string, pass: string): Promise<void> => {
    const email = emailOrUser.includes('@')
      ? emailOrUser.trim()
      : `${emailOrUser.trim()}@lumivox.art`;

    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
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

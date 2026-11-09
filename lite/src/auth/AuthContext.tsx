import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { session } from '../api/client';
import type { LoginRequest, User } from '../api/types';

type Status = 'loading' | 'signedIn' | 'signedOut';

interface AuthValue {
  status: Status;
  user: User | null;
  /** True when the backend ended the session, so the login page can say why. */
  expired: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** Holds who is signed in and provides login / logout to the whole app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [expired, setExpired] = useState(false);

  const signIn = (signedInUser: User, token: string) => {
    session.setToken(token);
    setUser(signedInUser);
    setExpired(false);
    setStatus('signedIn');
  };

  const signOut = (sessionExpired: boolean) => {
    session.setToken(null);
    setUser(null);
    setExpired(sessionExpired);
    setStatus('signedOut');
  };

  useEffect(() => {
    // The API client calls this when the session can't be renewed.
    session.onEnd(() => signOut(true));
    // After a page reload, ask the backend whether we still have a session (cookie).
    authApi
      .session()
      .then(({ user: restored, accessToken }) => signIn(restored, accessToken))
      .catch(() => signOut(false));
  }, []);

  const login = async (request: LoginRequest) => {
    const { user: signedIn, accessToken } = await authApi.login(request);
    signIn(signedIn, accessToken);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      signOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ status, user, expired, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}

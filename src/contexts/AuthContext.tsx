import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import supabase from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type Role = 'admin' | 'driver' | 'student';

export interface Profile {
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  linked_id?: number | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  refreshProfile: async () => {},
});

async function fetchProfile(email: string): Promise<Profile | null> {
  try {
    const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u?.email) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(u.email);
    setProfile(p);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      await loadProfile(sess?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    await loadProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

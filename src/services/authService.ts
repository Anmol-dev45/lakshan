import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type { User, Session };

// ─── Sign up with email + password ───────────────────────────────────────────
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? '' },
    },
  });
  if (error) throw error;
  return data;
}

// ─── Sign in with email + password ───────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ─── Sign in with magic link (passwordless) ───────────────────────────────────
export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/home` },
  });
  if (error) throw error;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Get the current session ──────────────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Get current user ────────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── Subscribe to auth state changes ─────────────────────────────────────────
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
}

// ─── Update user profile ──────────────────────────────────────────────────────
export async function updateProfile(userId: string, updates: {
  full_name?: string;
  phone?: string;
  age?: number;
  location?: string;
  lang?: string;
}) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...updates });
  if (error) throw error;
}

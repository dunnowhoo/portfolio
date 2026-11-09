'use server';

import { redirect } from 'next/navigation';
import { attemptLogin } from '@/lib/auth/login';
import { destroySession } from '@/lib/auth/session';

export type LoginState = { error: string | null };

// Dipakai form login di mata Daruma (beranda publik) dan di halaman /{slug}.
// Slug baru "bocor" ke browser lewat redirect SETELAH login berhasil.
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const res = await attemptLogin(String(formData.get('username') ?? ''), String(formData.get('password') ?? ''));
  if (!res.ok) return { error: res.error };
  redirect(`/${process.env.DASHBOARD_SLUG}/beranda`);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/');
}

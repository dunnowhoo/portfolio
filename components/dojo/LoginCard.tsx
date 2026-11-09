'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/app/actions/auth';
import DarumaIcon from './DarumaIcon';

const initial: LoginState = { error: null };

export default function LoginCard() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-[380px]">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <DarumaIcon eyes={1} className="w-24 h-24 drop-shadow-xl" />
        </div>
        <div className="glass-card-strong rounded-3xl p-7 md:p-8 pt-12">
          <h1 className="text-xl font-bold tracking-tight text-text-main text-center">
            <span className="font-jp">道場</span> · Dōjō
          </h1>
          <p className="text-sm text-text-secondary text-center mt-1">Sign in to continue training.</p>
          <form action={formAction} className="mt-6 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Username</span>
              <input name="username" autoComplete="username" required autoFocus className="rounded-xl border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm focus:border-[#0066cc] focus:ring-[#0066cc]" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Password</span>
              <input name="password" type="password" autoComplete="current-password" required className="rounded-xl border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm focus:border-[#0066cc] focus:ring-[#0066cc]" />
            </label>
            <p aria-live="polite" className="min-h-[1.25rem] text-xs font-medium text-[#c2452d]">{state.error}</p>
            <button type="submit" disabled={pending} className="flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:bg-[#0077ed] disabled:opacity-60 px-6 py-3 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/20">
              {pending ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

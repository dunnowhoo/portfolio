'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { loginAction, type LoginState } from '@/app/actions/auth';

const initial: LoginState = { error: null };

// Modal login kecil yang dibuka dari mata Daruma. Slug Dōjō tidak pernah ada di halaman publik:
// server baru mengarahkan ke sana setelah login berhasil.
export default function SecretLogin({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    userRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dojo-login-title"
        className="glass-card-strong rounded-3xl p-7 md:p-8 w-full max-w-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dojo-login-title" className="text-xl font-bold tracking-tight text-text-main">
              <span className="font-jp">道場</span> · Dōjō
            </h2>
            <p className="text-sm text-text-secondary mt-1">Sign in to continue training.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-text-secondary hover:bg-gray-100 hover:text-text-main transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="from" value="home" />
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Username</span>
            <input
              ref={userRef}
              name="username"
              autoComplete="username"
              required
              className="rounded-xl border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm focus:border-[#0066cc] focus:ring-[#0066cc]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm focus:border-[#0066cc] focus:ring-[#0066cc]"
            />
          </label>
          <p aria-live="polite" className="min-h-[1.25rem] text-xs font-medium text-[#c2452d]">
            {state.error}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:bg-[#0077ed] disabled:opacity-60 px-6 py-3 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            {pending ? 'Checking…' : 'Sign in'}
            {!pending && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

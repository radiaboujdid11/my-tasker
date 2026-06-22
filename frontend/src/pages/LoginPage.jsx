import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { login } = useAuth();
  const { add } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.token, { userId: res.data.userId, email: res.data.email });
      add('Welcome back! 🌸', 'success');
      navigate('/');
    } catch (err) {
      const isNetwork = !err.response;
      const msg = isNetwork
        ? 'Server is starting up. Wait 30 seconds and try again.'
        : err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          'Hmm, something went wrong. Try again?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="blob w-96 h-96 bg-zinc-300 -top-20 -left-20" />
      <div className="blob w-80 h-80 bg-zinc-200 bottom-10 -right-20" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-soft-lg mb-5"
            style={{ background: 'linear-gradient(135deg, #18181b, #3f3f46)' }}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-800 dark:text-zinc-50">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-sm text-stone-400 dark:text-zinc-300/60 mt-2 text-center">
            {t('auth.waitingForYou')}
          </p>
        </div>

        <div className="card p-8 shadow-soft-lg">
          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-zinc-400" /> {t('auth.email')}
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-lavender-400" /> {t('auth.password')}
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-1 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t('auth.signingIn')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('auth.signIn')} <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-zinc-800 hover:text-zinc-600 underline underline-offset-2 transition-colors">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-300">
          Stay organized. Get things done.
        </p>
      </div>
    </div>
  );
}

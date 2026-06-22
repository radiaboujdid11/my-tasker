import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { register as registerApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { add } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = t('auth.email') + ' is required';
    if (form.password.length < 6) errs.password = t('auth.atLeast6');
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await registerApi(form);
      add('Account created! Welcome 🌸', 'success');
      navigate('/login');
    } catch (err) {
      const isNetwork = !err.response;
      const serverErr = isNetwork
        ? 'Server is starting up. Wait 30 seconds and try again.'
        : err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.';
      setErrors({ server: serverErr });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="blob w-80 h-80 bg-zinc-300 -top-20 -right-20" />
      <div className="blob w-96 h-96 bg-zinc-200 bottom-0 -left-20" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-soft-lg mb-5"
            style={{ background: 'linear-gradient(135deg, #18181b, #3f3f46)' }}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-800 dark:text-zinc-50">
            {t('auth.beginJourney')}
          </h1>
          <p className="text-sm text-stone-400 dark:text-zinc-300/60 mt-2 text-center">
            {t('auth.createPersonal')} 🌿
          </p>
        </div>

        <div className="card p-8 shadow-soft-lg">
          {errors.server && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {[
              { id: 'email', field: 'email', label: t('auth.email'), type: 'email', placeholder: 'you@example.com', autoComplete: 'email', Icon: Mail },
              { id: 'password', field: 'password', label: t('auth.password'), type: 'password', placeholder: t('auth.atLeast6'), autoComplete: 'new-password', Icon: Lock },
              { id: 'confirmPassword', field: 'confirmPassword', label: t('auth.confirmPassword'), type: 'password', placeholder: t('auth.repeatPassword'), autoComplete: 'new-password', Icon: KeyRound },
            ].map(({ id, field, label, type, placeholder, autoComplete, Icon }) => (
              <div key={id}>
                <label htmlFor={id} className="label flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-zinc-400" /> {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className={`input ${errors[field] ? 'border-red-300 focus:ring-red-200' : ''}`}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={set(field)}
                  autoComplete={autoComplete}
                />
                {errors[field] && (
                  <p className="mt-1.5 text-xs text-red-500">{errors[field]}</p>
                )}
              </div>
            ))}

            <button type="submit" className="btn-primary w-full py-3 mt-1 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t('auth.creatingSpace')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('auth.createMyAccount')} <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-400">
              {t('auth.alreadyAccount')}{' '}
              <Link to="/login" className="font-semibold text-zinc-800 hover:text-zinc-600 underline underline-offset-2 transition-colors">
                {t('auth.signIn')}
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

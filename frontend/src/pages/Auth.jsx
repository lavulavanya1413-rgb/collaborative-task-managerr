
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Command,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login, signup } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
      return setError('Please enter your name.');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Enter a valid email address.');
    }

    if (password.length < (isLogin ? 1 : 8)) {
      return setError(
        isLogin
          ? 'Enter your password.'
          : 'Password must be at least 8 characters.'
      );
    }

    setBusy(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }

      nav('/app');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#171746] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500 p-3">
            <Command size={22} />
          </div>
          <span className="text-xl font-extrabold">taskflow.</span>
        </div>

        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Your team's work, in sync
          </div>

          <h1 className="text-5xl font-black leading-tight">
            Make great work
            <br />
            <span className="text-indigo-300">
              happen together.
            </span>
          </h1>

          <p className="mt-5 max-w-md leading-7 text-indigo-100/70">
            One connected workspace for tasks, sprints, requirements,
            and quality assurance.
          </p>

          <div className="mt-9 space-y-3">
            {[
              'Clear ownership and task visibility',
              'A workflow from idea to QA sign-off',
              'Activity history that keeps everyone aligned',
            ].map((x) => (
              <div
                className="flex items-center gap-3 text-sm text-indigo-50"
                key={x}
              >
                <CheckCircle2
                  size={17}
                  className="text-emerald-300"
                />
                {x}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-indigo-200/60">
          COLLABORATIVE TASK MANAGER · TEAM WORKSPACE
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-indigo-600 p-3 text-white">
              <Command size={22} />
            </div>
            <span className="text-xl font-extrabold">taskflow.</span>
          </div>

          <div className="text-sm font-semibold text-indigo-600">
            WELCOME {isLogin ? 'BACK' : 'ABOARD'}
          </div>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            {isLogin
              ? 'Sign in to your workspace'
              : 'Create your account'}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? 'Enter your details to continue your work.'
              : 'Start collaborating with your team today.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {!isLogin && (
              <div>
                <label className="label">Full name</label>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Work email</label>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>

              <div className="relative">
                <input
                  className="field pr-11"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isLogin
                      ? 'Enter your password'
                      : 'At least 8 characters'
                  }
                  autoComplete={
                    isLogin ? 'current-password' : 'new-password'
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="btn btn-primary w-full py-3"
            >
              {busy
                ? 'Please wait…'
                : isLogin
                  ? 'Sign in'
                  : 'Create account'}

              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}

            <Link
              className="font-bold text-indigo-600 hover:underline"
              to={isLogin ? '/signup' : '/login'}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-slate-400">
            By continuing, you agree to use this workspace responsibly.
          </p>
        </div>
      </div>
    </div>
  );
}

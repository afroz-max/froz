import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation checks
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email: trimmedEmail, password } : { name: name.trim(), email: trimmedEmail, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (isLogin && res.status === 401) {
          throw new Error('Email or password is incorrect.');
        }
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      if (err.message && err.message.includes('fetch')) {
        setError('Could not connect to FROZ server. Please check your connection.');
      } else {
        setError(err.message || 'Email or password is incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-black text-stone-900 tracking-tight">
          {isLogin ? 'Welcome back' : 'Create your FROZ account'}
        </h2>
        <p className="mt-2 text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
          {isLogin
            ? 'Log in to find nearby help or offer your skills.'
            : 'Join FROZ to connect with nearby people for useful services and skills.'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-stone-200 rounded-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-3 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm bg-stone-50/50"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm bg-stone-50/50"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm bg-stone-50/50"
                  placeholder="Enter your password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-colors disabled:opacity-50 mt-2"
            >
              <span>{loading ? (isLogin ? 'Logging in...' : 'Creating account...') : isLogin ? 'Log in to FROZ' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-stone-100">
            <p className="text-xs text-stone-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-bold text-stone-900 hover:underline ml-1"
              >
                {isLogin ? 'Create Account' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

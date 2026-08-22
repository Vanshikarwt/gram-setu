import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sprout } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const { t } = useTranslation();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError(t('validation.invalidPhone'));
      return;
    }

    if (!password) {
      setError(t('validation.passwordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await login(phone, password);
      setIsLoading(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.login') + ' failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-cream-950">
      {/* Brand Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-rural-green-800 p-3 rounded-2xl text-cream-50 shadow-md mb-3">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-rural-green-900 tracking-tight">GramSetu</h1>
        <p className="text-sm text-earth-600 font-medium mt-1">{t('auth.tagline')}</p>
      </div>

      {/* Login Card */}
      <div className="bg-cream-50 border border-cream-800 p-6 rounded-3xl shadow-md max-w-sm mx-auto w-full">
        <h2 className="text-xl font-bold text-earth-900 mb-6">{t('auth.login')}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-earth-700 mb-1.5">
              {t('auth.mobileLabel')}
            </label>
            <input
              id="phone"
              type="tel"
              maxLength={10}
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPhone(val);
                if (error) setError('');
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-cream-950 border-2 border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-base transition-colors placeholder-earth-300 disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-earth-700 mb-1.5">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-cream-950 border-2 border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-base transition-colors placeholder-earth-300 disabled:opacity-50"
            />
          </div>

          {/* Validation Alert */}
          {error && (
            <p className="text-xs font-semibold text-harvest-orange-dark bg-harvest-orange/10 p-2.5 rounded-lg border border-harvest-orange/20">
              ⚠️ {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3.5 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rural-green-300 text-base active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('auth.loggingIn')}
              </span>
            ) : (
              t('auth.loginBtn')
            )}
          </button>
        </form>

        {/* Test Tip */}
        <div className="mt-6 pt-4 border-t border-cream-800 text-center">
          <p className="text-xs text-earth-500 bg-cream-950 p-2.5 rounded-xl border border-cream-800">
            💡 {t('auth.testTip')}
          </p>
        </div>

        {/* Link to Register */}
        <div className="mt-5 text-center">
          <p className="text-sm text-earth-700">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-rural-green-800 font-bold hover:underline">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sprout } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const registerUser = useStore((state) => state.registerUser);
  const language = useStore((state) => state.language);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [village, setVillage] = useState('');
  const [stateName, setStateName] = useState('Rajasthan');
  // Pre-select the language the user already chose on the language screen
  const [selectedLang, setSelectedLang] = useState(language || 'hi');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('validation.nameRequired'));
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError(t('validation.invalidPhone'));
      return;
    }

    if (!password) {
      setError(t('validation.passwordRequired'));
      return;
    }

    if (!village.trim()) {
      setError(t('validation.villageRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        phone,
        password,
        location: `${village.trim()}, ${stateName}`,
        preferredLanguage: selectedLang,
      });
      setIsLoading(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  const indianStates = [
    'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
    'Gujarat', 'Maharashtra', 'Bihar', 'Karnataka', 'Tamil Nadu',
  ];

  const langOptions = [
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'en', label: 'English' },
    { code: 'hinglish', label: 'Hinglish' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 bg-cream-950">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-rural-green-800 p-2.5 rounded-2xl text-cream-50 shadow-md mb-2">
          <Sprout className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-rural-green-900 tracking-tight">GramSetu</h1>
        <span className="text-xs text-earth-500 font-medium">{t('auth.signup')}</span>
      </div>

      {/* Signup Card */}
      <div className="bg-cream-50 border border-cream-800 p-5 rounded-3xl shadow-md max-w-sm mx-auto w-full">
        <h2 className="text-lg font-bold text-earth-900 mb-4">{t('auth.signup')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-earth-700 mb-1">
              {t('signup.nameLabel')}
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Ram Singh"
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors disabled:opacity-50"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-earth-700 mb-1">
              {t('signup.phoneLabel')}
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
              className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-earth-700 mb-1">
              {t('signup.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors disabled:opacity-50"
            />
          </div>

          {/* Village */}
          <div>
            <label htmlFor="village" className="block text-xs font-semibold text-earth-700 mb-1">
              {t('signup.villageLabel')}
            </label>
            <input
              id="village"
              type="text"
              placeholder="e.g., Sangaria"
              value={village}
              onChange={(e) => { setVillage(e.target.value); if (error) setError(''); }}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors disabled:opacity-50"
            />
          </div>

          {/* State & Language grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="block text-xs font-semibold text-earth-700 mb-1">
                {t('signup.stateLabel')}
              </label>
              <select
                id="state"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-semibold text-earth-900 text-sm disabled:opacity-50"
              >
                {indianStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lang-select" className="block text-xs font-semibold text-earth-700 mb-1">
                {t('signup.langLabel')}
              </label>
              <select
                id="lang-select"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-semibold text-earth-900 text-sm disabled:opacity-50"
              >
                {langOptions.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <p className="text-xs font-semibold text-harvest-orange-dark bg-harvest-orange/10 p-2 rounded-lg border border-harvest-orange/20">
              ⚠️ {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rural-green-300 text-sm active:scale-[0.98] disabled:opacity-75"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('auth.registering')}
              </span>
            ) : (
              t('auth.signupBtn')
            )}
          </button>
        </form>

        {/* Link to login */}
        <div className="mt-4 text-center">
          <p className="text-xs text-earth-700">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-rural-green-800 font-bold hover:underline">
              {t('auth.loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

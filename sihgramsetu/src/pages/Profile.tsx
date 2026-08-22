import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogOut, User, MapPin, Phone, Languages, AlertCircle, Check } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

const LANG_OPTIONS = [
  { code: 'hi', label: 'हिंदी', sublabel: 'Hindi', emoji: '🇮🇳' },
  { code: 'en', label: 'English', sublabel: 'English', emoji: '🔤' },
  { code: 'hinglish', label: 'Hinglish', sublabel: 'Roman Hindi', emoji: '💬' },
];

const Profile: React.FC = () => {
  const { user, logout, setLanguage, language } = useStore();
  const { t } = useTranslation();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [pendingLang, setPendingLang] = useState(language || 'hi');

  const currentLangLabel = LANG_OPTIONS.find((l) => l.code === language)?.label || 'हिंदी';

  const handleSaveLanguage = () => {
    setLanguage(pendingLang);
    setShowLangPanel(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-cream-950 relative">
      <h2 className="text-2xl font-bold text-earth-900 mb-4 px-1">{t('profile.heading')}</h2>

      {/* User Information Card */}
      {user ? (
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-cream-800">
            <div className="w-16 h-16 bg-rural-green-100 text-rural-green-800 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-cream-800 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-earth-900">{user.name}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-rural-green-100 text-rural-green-800 rounded-md">
                {t('profile.registeredProfile')}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5 pt-2 text-sm text-earth-850">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-earth-500 shrink-0" />
              <div>
                <p className="text-[10px] text-earth-500 font-bold uppercase leading-none">{t('profile.mobileLabel')}</p>
                <p className="font-semibold text-base mt-0.5">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-earth-500 shrink-0" />
              <div>
                <p className="text-[10px] text-earth-500 font-bold uppercase leading-none">{t('profile.locationLabel')}</p>
                <p className="font-semibold text-base mt-0.5">{user.village}, {user.state}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-earth-500 shrink-0" />
              <div>
                <p className="text-[10px] text-earth-500 font-bold uppercase leading-none">{t('profile.langLabel')}</p>
                <p className="font-semibold text-base mt-0.5">{currentLangLabel}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5 text-center shadow-xs">
          <User className="w-12 h-12 text-earth-450 mx-auto mb-2" />
          <p className="text-earth-700 font-medium">{t('profile.guestSession')}</p>
        </div>
      )}

      {/* Settings buttons */}
      <div className="mt-6 space-y-3">
        {/* Change Language — FUNCTIONAL */}
        <button
          type="button"
          onClick={() => {
            setPendingLang(language || 'hi');
            setShowLangPanel(true);
          }}
          className="w-full text-left p-4 bg-cream-50 border border-cream-800 hover:bg-rural-green-50 hover:border-rural-green-300 rounded-2xl text-earth-800 font-semibold text-sm flex justify-between items-center transition-colors active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-rural-green-700" />
            {t('profile.changeLanguage')}
          </span>
          <span className="text-xs text-earth-500">▶</span>
        </button>

        <button
          type="button"
          disabled
          className="w-full text-left p-4 bg-cream-50 border border-cream-800 hover:bg-cream-100 rounded-2xl text-earth-800 font-semibold text-sm flex justify-between items-center cursor-not-allowed opacity-60"
        >
          <span>{t('profile.helpSupport')}</span>
          <span className="text-xs text-earth-500">▶</span>
        </button>
      </div>

      {/* Logout */}
      <div className="mt-auto pt-6">
        <button
          onClick={() => setShowConfirmLogout(true)}
          type="button"
          className="w-full py-4 bg-harvest-orange hover:bg-harvest-orange-dark text-cream-50 font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-base active:scale-[0.98] outline-none focus:ring-4 focus:ring-harvest-orange/30"
        >
          <LogOut className="w-5 h-5 stroke-[2.5]" />
          {t('auth.logout')}
        </button>
      </div>

      {/* ── Language Switcher Panel ─────────────────────────────────── */}
      {showLangPanel && (
        <div className="absolute inset-0 bg-earth-900/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-cream-50 border-2 border-cream-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-earth-900 mb-4">{t('profile.langPanelHeading')}</h3>

            <div className="space-y-3 mb-6">
              {LANG_OPTIONS.map((lang) => {
                const isSelected = pendingLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setPendingLang(lang.code)}
                    type="button"
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] outline-none text-left ${
                      isSelected
                        ? 'bg-rural-green-800 border-rural-green-900 text-cream-50'
                        : 'bg-cream-50 border-cream-800 text-earth-900 hover:border-rural-green-300'
                    }`}
                  >
                    <span className="text-xl">{lang.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-base ${isSelected ? 'text-cream-50' : 'text-earth-900'}`}>{lang.label}</p>
                      <p className={`text-xs ${isSelected ? 'text-cream-50/70' : 'text-earth-500'}`}>{lang.sublabel}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-cream-50 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLangPanel(false)}
                type="button"
                className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 text-earth-900 font-bold rounded-xl border border-cream-800 transition-colors text-sm active:scale-[0.98]"
              >
                {t('profile.langPanelCancel')}
              </button>
              <button
                onClick={handleSaveLanguage}
                type="button"
                className="flex-1 py-3 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl shadow-xs transition-colors text-sm active:scale-[0.98]"
              >
                {t('profile.langPanelSave')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showConfirmLogout && (
        <div className="absolute inset-0 bg-earth-900/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-sm bg-cream-50 border-2 border-cream-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-3 text-harvest-orange-dark mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">{t('auth.logoutConfirmTitle')}</h3>
            </div>
            
            <p className="text-sm text-earth-800 font-medium leading-relaxed mb-6">
              {t('auth.logoutConfirmMsg')}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowConfirmLogout(false);
                  logout();
                }}
                type="button"
                className="w-full py-3.5 bg-harvest-orange hover:bg-harvest-orange-dark text-cream-50 font-bold rounded-xl shadow-xs transition-colors text-sm active:scale-[0.98]"
              >
                {t('auth.logoutYes')}
              </button>
              <button
                onClick={() => setShowConfirmLogout(false)}
                type="button"
                className="w-full py-3.5 bg-cream-100 hover:bg-cream-200 text-earth-900 font-bold rounded-xl border border-cream-800 transition-colors text-sm active:scale-[0.98]"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogOut, User, MapPin, Phone, Languages, AlertCircle, Check, Edit3, X, Save } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

const LANG_OPTIONS = [
  { code: 'hi', label: 'हिंदी', sublabel: 'Hindi', emoji: '🇮🇳' },
  { code: 'en', label: 'English', sublabel: 'English', emoji: '🔤' },
  { code: 'hinglish', label: 'Hinglish', sublabel: 'Roman Hindi', emoji: '💬' },
];

const INDIAN_STATES = [
  'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Gujarat', 'Maharashtra', 'Bihar', 'Karnataka', 'Tamil Nadu',
];

const Profile: React.FC = () => {
  const { user, logout, setLanguage, language, updateProfile } = useStore();
  const { t } = useTranslation();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingLang, setPendingLang] = useState(language || 'hi');

  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editVillage, setEditVillage] = useState(user?.village || '');
  const [editState, setEditState] = useState(user?.state || 'Rajasthan');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const currentLangLabel = LANG_OPTIONS.find((l) => l.code === language)?.label || 'हिंदी';

  const handleOpenEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditVillage(user.village);
      setEditState(user.state || 'Rajasthan');
      setEditError('');
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editName.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }
    if (!editVillage.trim()) {
      setEditError('Village cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: editName.trim(),
        village: editVillage.trim(),
        state: editState,
      });
      setIsSaving(false);
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile.');
      setIsSaving(false);
    }
  };

  const handleSaveLanguage = () => {
    setLanguage(pendingLang);
    setShowLangPanel(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-cream-950 relative">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-earth-900">{t('profile.heading')}</h2>
        {user && (
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 text-xs font-bold rounded-xl shadow-xs transition-colors outline-none active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* User Information Card */}
      {user ? (
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-cream-800">
            <div className="flex items-center gap-4">
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
            <button
              onClick={handleOpenEdit}
              type="button"
              className="p-2 text-earth-600 hover:text-rural-green-800 hover:bg-cream-100 rounded-xl transition-colors outline-none"
              aria-label="Edit Profile"
            >
              <Edit3 className="w-5 h-5" />
            </button>
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
                <p className="font-semibold text-base mt-0.5">{user.village}{user.state ? `, ${user.state}` : ''}</p>
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
        {/* Edit Profile Entry */}
        {user && (
          <button
            type="button"
            onClick={handleOpenEdit}
            className="w-full text-left p-4 bg-cream-50 border border-cream-800 hover:bg-rural-green-50 hover:border-rural-green-300 rounded-2xl text-earth-800 font-semibold text-sm flex justify-between items-center transition-colors active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-rural-green-700" />
              Edit Profile (प्रोफ़ाइल संपादित करें)
            </span>
            <span className="text-xs text-earth-500">▶</span>
          </button>
        )}

        {/* Change Language */}
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

      {/* ── Edit Profile Modal ─────────────────────────────────────── */}
      {showEditModal && (
        <div className="absolute inset-0 bg-earth-900/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-cream-50 border-2 border-cream-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-earth-900">
                <Edit3 className="w-5 h-5 text-rural-green-800" />
                <h3 className="text-lg font-bold">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-earth-500 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {editError && (
                <p className="text-xs font-semibold text-harvest-orange-dark bg-harvest-orange/10 p-2.5 rounded-lg border border-harvest-orange/20">
                  ⚠️ {editError}
                </p>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-semibold text-earth-950 text-sm"
                  required
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Village / City</label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-semibold text-earth-950 text-sm"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">State</label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-950 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-semibold text-earth-950 text-sm"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Phone (Read Only) */}
              <div>
                <label className="block text-xs font-semibold text-earth-500 mb-1">Phone Number (Registered)</label>
                <input
                  type="text"
                  value={user?.phone || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-earth-100 border border-cream-800 text-earth-500 rounded-xl text-sm font-semibold cursor-not-allowed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 text-earth-900 font-bold rounded-xl border border-cream-800 transition-colors text-sm active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl shadow-xs transition-colors text-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import { X, Send, Sprout } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

interface BazaarPostFormProps {
  onClose: () => void;
}

export const BazaarPostForm: React.FC<BazaarPostFormProps> = ({ onClose }) => {
  const { user, createBazaarPostApi } = useStore();
  const { t } = useTranslation();

  const [type, setType] = useState<'need' | 'offer'>('need');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState(user ? `${user.village}, ${user.state}` : '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError(t('validation.contentRequired'));
      return;
    }

    if (!location.trim()) {
      setError(t('validation.locationRequired'));
      return;
    }

    try {
      await createBazaarPostApi({
        type,
        content: content.trim(),
        location: location.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'पोस्ट बनाने में विफल (Failed to create post)');
    }
  };

  return (
    <div className="absolute inset-0 bg-cream-950 z-30 flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      
      {/* Form Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-cream-50 border-b border-cream-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-rural-green-800 p-1 rounded-lg text-cream-50">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-earth-900">
            {t('bazaar.createPost')}
          </span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 pb-8">
        
        {/* Validation Error */}
        {error && (
          <div className="p-3 bg-harvest-orange/10 border border-harvest-orange/20 rounded-2xl text-xs font-semibold text-harvest-orange-dark">
            ⚠️ {error}
          </div>
        )}

        {/* Post Type Picker */}
        <div>
          <label className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-2 pl-1">
            {t('bazaar.typeLabel')}
          </label>
          <div className="flex p-1 bg-cream-100 border border-cream-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('need')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all outline-none ${
                type === 'need'
                  ? 'bg-harvest-orange text-cream-50 shadow-sm'
                  : 'text-earth-700 hover:bg-cream-200'
              }`}
            >
              {t('bazaar.needType')}
            </button>
            <button
              type="button"
              onClick={() => setType('offer')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all outline-none ${
                type === 'offer'
                  ? 'bg-rural-green-800 text-cream-50 shadow-sm'
                  : 'text-earth-700 hover:bg-cream-200'
              }`}
            >
              {t('bazaar.offerType')}
            </button>
          </div>
        </div>

        {/* Content TextArea */}
        <div>
          <label htmlFor="bp-content" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
            {t('bazaar.descLabel')} *
          </label>
          <textarea
            id="bp-content"
            rows={5}
            placeholder={
              type === 'need'
                ? t('bazaar.needPlaceholder')
                : t('bazaar.offerPlaceholder')
            }
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="bp-location" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
            {t('bazaar.locationLabel')} *
          </label>
          <input
            id="bp-location"
            type="text"
            placeholder="गांव, जिला"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-base active:scale-[0.98] outline-none focus:ring-4 focus:ring-rural-green-300"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            {t('bazaar.publish')}
          </button>
        </div>
      </form>
    </div>
  );
};

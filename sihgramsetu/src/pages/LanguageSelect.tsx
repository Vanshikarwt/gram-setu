import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useStore } from '../store/useStore';

const LANG_OPTIONS = [
  {
    code: 'hi',
    label: 'हिंदी',
    sublabel: 'Hindi',
    emoji: '🇮🇳',
    description: 'हिंदी में GramSetu चलाएं',
  },
  {
    code: 'en',
    label: 'English',
    sublabel: 'English',
    emoji: '🔤',
    description: 'Use GramSetu in English',
  },
  {
    code: 'hinglish',
    label: 'Hinglish',
    sublabel: 'Roman Hindi',
    emoji: '💬',
    description: 'Hinglish mein GramSetu use karo',
  },
] as const;

const LanguageSelect: React.FC = () => {
  const navigate = useNavigate();
  const setLanguage = useStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setLanguage(selected);
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-10 bg-cream-950 select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8 pt-4">
        <div className="bg-rural-green-800 p-4 rounded-3xl text-cream-50 shadow-lg mb-4">
          <Sprout className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-rural-green-900 tracking-tight mb-1">
          GramSetu
        </h1>
        <p className="text-sm text-earth-600 font-medium">
          गांव की मंडी / Village Marketplace
        </p>
      </div>

      {/* Language Options */}
      <div className="space-y-4 flex-1">
        <p className="text-center text-base font-bold text-earth-700 mb-2">
          Choose Language / भाषा चुनें / Bhasha Chunein
        </p>

        {LANG_OPTIONS.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              type="button"
              className={`w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-200 active:scale-[0.98] outline-none text-left ${
                isSelected
                  ? 'bg-rural-green-800 border-rural-green-900 text-cream-50 shadow-lg scale-[1.02]'
                  : 'bg-cream-50 border-cream-800 text-earth-900 hover:border-rural-green-300 hover:bg-rural-green-50'
              }`}
            >
              {/* Radio Indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-cream-50 bg-cream-50'
                    : 'border-earth-400 bg-transparent'
                }`}
              >
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-rural-green-800" />
                )}
              </div>

              {/* Emoji */}
              <span className="text-3xl shrink-0">{lang.emoji}</span>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className={`text-xl font-extrabold leading-tight ${isSelected ? 'text-cream-50' : 'text-earth-900'}`}>
                  {lang.label}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${isSelected ? 'text-cream-50/80' : 'text-earth-500'}`}>
                  {lang.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="mt-8 pt-4">
        <button
          onClick={handleContinue}
          disabled={!selected}
          type="button"
          className="w-full py-4 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-2xl text-base shadow-md transition-all active:scale-[0.98] outline-none focus:ring-4 focus:ring-rural-green-300 disabled:opacity-40 disabled:pointer-events-none"
        >
          {selected
            ? selected === 'hi'
              ? 'आगे बढ़ें →'
              : selected === 'hinglish'
              ? 'Aage Chalein →'
              : 'Continue →'
            : 'Choose a language above'}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelect;

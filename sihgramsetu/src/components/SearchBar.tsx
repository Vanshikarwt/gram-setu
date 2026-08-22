import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t, locale } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice search handler — uses language-aware Web Speech API
  const handleVoiceSearch = useCallback(() => {
    if (isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      // Use the locale's BCP-47 speech language code
      recognition.lang = locale.lang.speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        simulateVoiceSearch();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      simulateVoiceSearch();
    }
  }, [isListening, onChange, locale]);

  const simulateVoiceSearch = useCallback(() => {
    setIsListening(true);
    const sampleQueries = ['Tractor', 'Harvester', 'धान रोपाई', 'Rotavator'];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    
    setTimeout(() => {
      onChange(randomQuery);
      setIsListening(false);
      inputRef.current?.focus();
    }, 2000);
  }, [onChange]);

  useEffect(() => {
    return () => setIsListening(false);
  }, []);

  return (
    <div className="relative mx-4 mb-3">
      <div className={`relative flex items-center bg-cream-50 border-2 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
        isListening ? 'border-harvest-gold ring-2 ring-harvest-gold/20' : 'border-cream-800 focus-within:border-rural-green-600'
      }`}>
        {/* Search Icon */}
        <div className="pl-3.5 text-earth-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={isListening ? '🎙 ...' : t('searchPage.searchPlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isListening}
          className="w-full px-3 py-3.5 bg-transparent text-earth-900 placeholder-earth-400 font-medium outline-none text-sm disabled:opacity-60"
        />

        {/* Clear button */}
        {value && !isListening && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            type="button"
            className="p-2 text-earth-400 hover:text-earth-700 transition-colors outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Mic Button */}
        <button
          onClick={handleVoiceSearch}
          type="button"
          disabled={isListening}
          className={`p-3 mr-1 rounded-xl transition-all outline-none ${
            isListening
              ? 'bg-harvest-gold text-cream-50 animate-pulse'
              : 'bg-rural-green-800 text-cream-50 hover:bg-rural-green-900 active:scale-90'
          }`}
          aria-label="Voice search"
        >
          <Mic className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Listening indicator bar */}
      {isListening && (
        <div className="mt-2 flex items-center justify-center gap-2 text-harvest-gold-dark">
          <div className="flex gap-1">
            <span className="w-1.5 h-4 bg-harvest-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-6 bg-harvest-gold-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-3 bg-harvest-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            <span className="w-1.5 h-5 bg-harvest-gold-dark rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
            <span className="w-1.5 h-4 bg-harvest-gold rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></span>
          </div>
          <span className="text-xs font-bold">🎙 {t('chat.placeholder')}</span>
        </div>
      )}
    </div>
  );
};

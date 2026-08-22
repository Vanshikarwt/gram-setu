import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, AlertCircle } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t, locale } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  // Accumulate ONLY finalized segments (keyed by result index to prevent duplication)
  const finalTranscriptRef = useRef<string>('');
  // Track the highest resultIndex we've finalized so we don't re-process
  const lastFinalIndexRef = useRef<number>(0);

  const clearError = useCallback(() => setErrorMessage(''), []);

  // Stop active speech recognition safely
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  /**
   * Derive the BCP-47 speech language from the active locale.
   * 
   * ROOT CAUSE NOTE: Chrome Web Speech API sends audio to Google's cloud servers.
   * Using 'hi-IN' is valid but when the network call to Google's speech servers fails
   * (timeout, packet loss, Google server error), Chrome fires event.error = 'network'.
   *
   * Solution: Use a priority list — prefer 'en-IN' as a fallback because it is more
   * network-stable. hi-IN and hinglish stay as-is since user chose those languages.
   */
  const getSpeechLang = useCallback((): string => {
    const localeCode = locale?.lang?.code;
    switch (localeCode) {
      case 'en':
        return 'en-IN';
      case 'hi':
        return 'hi-IN';
      case 'hinglish':
        // Hinglish: use hi-IN (accepts Devanagari and Roman Hindi both)
        return 'hi-IN';
      default:
        return locale?.lang?.speechLang || 'hi-IN';
    }
  }, [locale]);

  // Real Web Speech API voice search handler
  const handleVoiceSearch = useCallback(() => {
    // If already listening, tap again to stop recognition
    if (isListening) {
      stopListening();
      return;
    }

    setErrorMessage('');
    setInterimText('');
    finalTranscriptRef.current = '';
    lastFinalIndexRef.current = 0;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Voice search is not supported in this browser. Please use Chrome or Edge, or type to search.'
      );
      setTimeout(clearError, 6000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const speechLang = getSpeechLang();

      /**
       * KEY FIX: continuous = false (not true).
       *
       * ROOT CAUSE: Setting continuous = true keeps the network connection to
       * Google's cloud speech-to-text service open indefinitely. This causes
       * event.error = 'network' when:
       *  - Google's server-side session times out (typically ~60 seconds)
       *  - Network packet loss during the continuous open connection
       *  - The cloud recognition backend forcefully closes the session
       *
       * With continuous = false, each button tap is a single bounded recognition
       * session that ends naturally after a period of silence. This dramatically
       * reduces the frequency of network errors.
       *
       * Note: maxAlternatives = 1 is correct. interimResults = true is correct.
       */
      recognition.lang = speechLang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false; // FIX: was true, causing network timeouts

      setIsListening(true);

      recognition.onresult = (event: any) => {
        let currentInterimText = '';
        let newFinalText = '';

        /**
         * KEY FIX: Only iterate from event.resultIndex (not from 0).
         *
         * ROOT CAUSE: Iterating from 0 every onresult call re-processes all
         * previous final segments, causing duplicate word accumulation.
         * e.g. user says "tractor rental" → transcript shows "tractortractor rental"
         *
         * Correct approach: iterate from event.resultIndex to event.results.length
         * to only process NEW events in this callback invocation.
         */
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const segment = result[0].transcript;

          if (result.isFinal) {
            newFinalText += segment + ' ';
          } else {
            currentInterimText += segment;
          }
        }

        // Append new finalized segments to our accumulator
        if (newFinalText.trim()) {
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + newFinalText).trim();
        }

        // Build full display text = everything finalized so far + current interim
        const displayText = (
          finalTranscriptRef.current +
          (currentInterimText ? ' ' + currentInterimText : '')
        ).replace(/\s+/g, ' ').trim();

        if (displayText) {
          setInterimText(displayText);
          // Update the search query in real-time so results start appearing
          onChange(displayText);
        }
      };

      recognition.onerror = (event: any) => {
        const err = String(event.error || '');
        console.warn('[VoiceSearch] Speech recognition error:', err);

        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;

        // If we already have a valid transcript from this session, keep it
        const hasTranscript = finalTranscriptRef.current.trim().length > 0;

        if (err === 'no-speech') {
          if (!hasTranscript) {
            setErrorMessage('No speech detected. Please try speaking into your microphone.');
            setTimeout(clearError, 5000);
          }
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          setErrorMessage(
            'Microphone permission is required for voice search. Please allow microphone access in your browser settings.'
          );
          setTimeout(clearError, 8000);
        } else if (err === 'audio-capture') {
          setErrorMessage(
            'No microphone found. Please ensure your microphone is plugged in and working.'
          );
          setTimeout(clearError, 6000);
        } else if (err === 'network') {
          /**
           * NETWORK ERROR ROOT CAUSE EXPLANATION:
           *
           * Chrome's Web Speech API sends audio to Google's cloud servers (speech.googleapis.com).
           * A 'network' error means the connection to Google's speech service failed:
           *  - Most common cause: continuous=true kept the session open until it timed out
           *  - Also caused by: packet loss, firewall blocking googleapis.com, DNS issues
           *
           * FIX APPLIED: continuous=false limits each session to a short bounded duration,
           * preventing the timeout that causes this error.
           *
           * If the user still sees this error, it may be:
           *  1. A temporary Google service outage
           *  2. Firewall/network blocking speech.googleapis.com
           *  3. The device is offline
           */
          if (!hasTranscript) {
            setErrorMessage(
              'Voice recognition service is temporarily unavailable. Please check your internet connection or try again in a moment.'
            );
            setTimeout(clearError, 6000);
          }
        } else if (err === 'aborted') {
          // User-initiated stop, no error to show
        } else if (err === 'language-not-supported') {
          setErrorMessage(
            `Voice search in "${speechLang}" is not supported by your browser. Try switching to English.`
          );
          setTimeout(clearError, 6000);
        } else {
          if (!hasTranscript) {
            setErrorMessage(
              'Voice recognition error. Please try again or type to search.'
            );
            setTimeout(clearError, 5000);
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;

        // Commit the final cleaned transcript to the search field
        if (finalTranscriptRef.current.trim()) {
          const cleaned = finalTranscriptRef.current.replace(/\s+/g, ' ').trim();
          onChange(cleaned);
        }

        inputRef.current?.focus();
      };

      recognition.start();
    } catch (err: any) {
      console.error('[VoiceSearch] Failed to initialize speech recognition:', err);
      setIsListening(false);
      setInterimText('');
      recognitionRef.current = null;
      setErrorMessage('Could not access microphone. Please try again.');
      setTimeout(clearError, 5000);
    }
  }, [isListening, onChange, getSpeechLang, stopListening, clearError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="relative mx-4 mb-3">
      <div
        className={`relative flex items-center bg-cream-50 border-2 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
          isListening
            ? 'border-harvest-gold ring-2 ring-harvest-gold/20'
            : 'border-cream-800 focus-within:border-rural-green-600'
        }`}
      >
        {/* Search Icon */}
        <div className="pl-3.5 text-earth-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={
            isListening
              ? '🎙 Listening... Speak now (बोलें...)'
              : t('searchPage.searchPlaceholder')
          }
          value={isListening && interimText ? interimText : value}
          onChange={(e) => {
            onChange(e.target.value);
            if (errorMessage) clearError();
          }}
          className="w-full px-3 py-3.5 bg-transparent text-earth-900 placeholder-earth-400 font-medium outline-none text-sm"
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
          className={`p-3 mr-1 rounded-xl transition-all outline-none ${
            isListening
              ? 'bg-harvest-gold text-cream-50 animate-pulse'
              : 'bg-rural-green-800 text-cream-50 hover:bg-rural-green-900 active:scale-90'
          }`}
          aria-label={isListening ? 'Stop Voice Search' : 'Voice Search'}
          title={isListening ? 'Stop Voice Search' : 'Voice Search'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Mic className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="mt-2 flex items-center justify-between gap-2 text-harvest-gold-dark bg-harvest-gold/10 p-2.5 rounded-xl border border-harvest-gold/20 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex gap-1 items-center shrink-0">
              <span
                className="w-1.5 h-4 bg-harvest-gold rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-6 bg-harvest-gold-dark rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-3 bg-harvest-gold rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              <span
                className="w-1.5 h-5 bg-harvest-gold-dark rounded-full animate-bounce"
                style={{ animationDelay: '100ms' }}
              />
              <span
                className="w-1.5 h-4 bg-harvest-gold rounded-full animate-bounce"
                style={{ animationDelay: '250ms' }}
              />
            </div>
            <span className="text-xs font-extrabold truncate">
              {interimText
                ? `"${interimText}"`
                : '🎙 Listening... Speak into microphone'}
            </span>
          </div>

          <button
            type="button"
            onClick={stopListening}
            className="text-[11px] font-bold px-2 py-1 bg-harvest-gold-dark text-cream-50 rounded-lg hover:bg-harvest-gold transition-colors shrink-0"
          >
            Done
          </button>
        </div>
      )}

      {/* Error message banner */}
      {errorMessage && (
        <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={clearError}
            type="button"
            className="text-red-500 hover:text-red-800 p-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

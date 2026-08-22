import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Booking } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose }) => {
  const { user, addReview } = useStore();
  const { t } = useTranslation();
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [hovered, setHovered] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const displayRating = hovered || rating;

  const RATING_LABELS: Record<number, string> = {
    0: t('review.ratingLabel'),
    1: '😞 Very Poor',
    2: '😐 Poor',
    3: '🙂 Average',
    4: '😊 Good',
    5: '🤩 Excellent!',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t('validation.ratingRequired'));
      return;
    }
    if (!user) return;

    try {
      await addReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || t('review.failedError'));
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="w-full max-w-md bg-cream-50 rounded-t-3xl p-6 text-center animate-in slide-in-from-bottom duration-300">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="text-xl font-extrabold text-earth-900 mb-2">{t('review.successTitle')}</h3>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${s <= rating ? 'text-harvest-gold-dark fill-harvest-gold-dark' : 'text-earth-300'}`}
              />
            ))}
          </div>
          <p className="text-sm text-earth-600 mb-6">
            {t('review.successMsg')}
          </p>
          <button
            onClick={onClose}
            type="button"
            className="w-full py-3.5 bg-rural-green-800 text-cream-50 font-bold rounded-xl text-sm outline-none active:scale-[0.98]"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    );
  }

  // ── Review Form ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-cream-50 rounded-t-3xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-earth-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-800">
          <div>
            <h3 className="font-extrabold text-base text-earth-900">{t('review.heading')}</h3>
            <p className="text-xs text-earth-500 font-medium truncate max-w-[240px]">{booking.listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full bg-cream-100 text-earth-700 active:scale-90 outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-harvest-orange/10 border border-harvest-orange/20 rounded-xl text-xs font-semibold text-harvest-orange-dark">
              ⚠️ {error}
            </div>
          )}

          {/* Star selector */}
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-earth-500 mb-3">
              {t('review.ratingLabel')}
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              {([1, 2, 3, 4, 5] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setRating(s); setError(''); }}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 active:scale-90 transition-transform outline-none"
                  aria-label={`${s} stars`}
                >
                  <Star
                    className={`w-11 h-11 transition-colors ${
                      s <= displayRating
                        ? 'text-harvest-gold-dark fill-harvest-gold-dark'
                        : 'text-earth-300 fill-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-earth-700">{RATING_LABELS[displayRating]}</p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-earth-500 block mb-1.5">
              {t('review.commentLabel')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('review.commentPlaceholder')}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm text-earth-950 resize-none leading-relaxed transition-colors"
            />
            <p className="text-[10px] text-earth-400 text-right mt-0.5">{comment.length}/300</p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-rural-green-800 text-cream-50 font-bold rounded-2xl text-base flex items-center justify-center gap-2 active:scale-[0.98] outline-none shadow-md"
          >
            <Star className="w-5 h-5 fill-cream-50" />
            {t('review.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

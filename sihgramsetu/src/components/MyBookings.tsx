import React, { useState } from 'react';
import { CalendarDays, Clock, IndianRupee, MapPin, CreditCard, Navigation, Star, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FriendlyEmptyState } from './FriendlyEmptyState';
import { PaymentGateway } from './PaymentGateway';
import { MockTracking } from './MockTracking';
import { ReviewModal } from './ReviewModal';
import type { Booking, BookingStatus } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

export const MyBookings: React.FC = () => {
  const { user, bookings, reviews } = useStore();
  const { t } = useTranslation();

  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Build status config from active locale (evaluated per-render so language changes are instant)
  const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    pending:   { label: `⏳ ${t('status.pending')}`,   bg: 'bg-harvest-gold/10',     text: 'text-harvest-gold-dark',  border: 'border-harvest-gold/30',   dot: 'bg-harvest-gold-dark' },
    accepted:  { label: `✅ ${t('status.accepted')}`,  bg: 'bg-rural-green-100',      text: 'text-rural-green-800',    border: 'border-rural-green-200',   dot: 'bg-rural-green-700' },
    rejected:  { label: `❌ ${t('status.rejected')}`,  bg: 'bg-earth-100',            text: 'text-earth-600',          border: 'border-earth-300',         dot: 'bg-earth-400' },
    paid:      { label: `💚 ${t('status.paid')}`,      bg: 'bg-rural-green-700',      text: 'text-cream-50',           border: 'border-rural-green-800',   dot: 'bg-cream-50' },
    active:    { label: `🚜 ${t('status.active')}`,    bg: 'bg-blue-100',             text: 'text-blue-800',           border: 'border-blue-200',          dot: 'bg-blue-600' },
    completed: { label: `🎉 ${t('status.completed')}`, bg: 'bg-rural-green-800',      text: 'text-cream-50',           border: 'border-rural-green-900',   dot: 'bg-cream-50' },
  };

  const myBookings = bookings
    .filter((b) => b.consumerId === user?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const hasReview = (bookingId: string) =>
    reviews.some((r) => r.bookingId === bookingId && r.consumerId === user?.id);

  if (myBookings.length === 0) {
    return (
      <FriendlyEmptyState
        iconName="CalendarX"
        title={t('booking.noBookings')}
        description={t('booking.noBookingsDesc')}
        actionText=""
        onAction={() => {}}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {myBookings.map((booking) => {
          const cfg = STATUS_CONFIG[booking.status];
          const isAccepted   = booking.status === 'accepted';
          const isPaid       = booking.status === 'paid';
          const isActive     = booking.status === 'active';
          const isCompleted  = booking.status === 'completed';
          const isMachinery  = booking.listingType === 'machinery';
          const alreadyReviewed = hasReview(booking.id);

          return (
            <div
              key={booking.id}
              className={`bg-cream-50 border-2 rounded-3xl p-4 shadow-xs transition-all ${
                isCompleted
                  ? 'border-rural-green-800 bg-rural-green-50/20'
                  : isPaid
                    ? 'border-rural-green-700 bg-rural-green-50/30'
                    : isActive
                      ? 'border-blue-300 bg-blue-50/20'
                      : cfg.border
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-earth-500 mb-0.5">
                    {booking.listingType === 'machinery' ? `🚜 ${t('filters.machinery')}` : `👷 ${t('filters.labor')}`}
                  </p>
                  <h4 className="font-bold text-sm text-earth-900 leading-tight truncate">
                    {booking.listingTitle}
                  </h4>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-cream-100 rounded-xl p-2">
                  <CalendarDays className="w-4 h-4 mx-auto text-earth-500 mb-0.5" />
                  <p className="text-[10px] font-bold text-earth-700 truncate">
                    {booking.endDate && booking.endDate !== booking.date ? `${booking.date} to ${booking.endDate.slice(5)}` : booking.date}
                  </p>
                  <p className="text-[9px] text-earth-400">{t('booking.dateLabel')}</p>
                </div>
                <div className="bg-cream-100 rounded-xl p-2">
                  <Clock className="w-4 h-4 mx-auto text-earth-500 mb-0.5" />
                  <p className="text-[10px] font-bold text-earth-700">
                    {booking.bookingType === 'hourly' || booking.hours
                      ? `${booking.hours || booking.quantity} ${t('booking.hr')}`
                      : `${booking.days || booking.quantity} ${t('booking.day')}`}
                  </p>
                  <p className="text-[9px] text-earth-400">{t('booking.durationLabel')}</p>
                </div>
                <div className="bg-cream-100 rounded-xl p-2">
                  <IndianRupee className="w-4 h-4 mx-auto text-rural-green-700 mb-0.5" />
                  <p className="text-[10px] font-bold text-rural-green-900">₹{booking.totalPrice}</p>
                  <p className="text-[9px] text-earth-400">{t('booking.totalLabel')}</p>
                </div>
              </div>

              {booking.listingLocation && (
                <div className="flex items-center gap-1 mt-2.5 text-[10px] text-earth-400 font-semibold">
                  <MapPin className="w-3 h-3" />
                  {booking.listingLocation}
                </div>
              )}

              {/* ── Action buttons based on status ── */}

              {/* Accepted → Pay Now */}
              {isAccepted && (
                <button
                  onClick={() => setPayingBooking(booking)}
                  type="button"
                  className="mt-3 w-full py-3 bg-harvest-gold-dark hover:bg-harvest-gold text-cream-50 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all outline-none shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('booking.payNow')} — ₹{booking.totalPrice}
                </button>
              )}

              {/* Paid → waiting for provider */}
              {isPaid && (
                <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-rural-green-100 rounded-xl border border-rural-green-200">
                  <span className="text-xs font-extrabold text-rural-green-800">
                    💚 {t('booking.paidAwaitingStart')}
                  </span>
                </div>
              )}

              {/* Active → Track */}
              {isActive && (
                <button
                  onClick={() => setTrackingBooking(booking)}
                  type="button"
                  className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all outline-none shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  {isMachinery ? `🗺️ ${t('booking.track')}` : `🔍 ${t('booking.trackJob')}`}
                </button>
              )}

              {/* Completed → Review */}
              {isCompleted && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-2 py-2 bg-rural-green-100 rounded-xl border border-rural-green-200">
                    <span className="text-xs font-extrabold text-rural-green-800">🎉 {t('booking.completed')}</span>
                  </div>
                  {alreadyReviewed ? (
                    <div className="flex items-center justify-center gap-1.5 py-2 bg-cream-100 rounded-xl border border-cream-800">
                      <CheckCircle className="w-4 h-4 text-rural-green-700" />
                      <span className="text-xs font-bold text-earth-600">{t('booking.reviewed')}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewBooking(booking)}
                      type="button"
                      className="w-full py-3 bg-harvest-gold-dark hover:bg-harvest-gold text-cream-50 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] outline-none shadow-sm"
                    >
                      <Star className="w-4 h-4 fill-cream-50" />
                      {t('booking.leaveReview')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlays */}
      {payingBooking && (
        <PaymentGateway booking={payingBooking} onClose={() => setPayingBooking(null)} />
      )}
      {trackingBooking && (
        <MockTracking booking={trackingBooking} onClose={() => setTrackingBooking(null)} />
      )}
      {reviewBooking && (
        <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} />
      )}
    </>
  );
};

import React from 'react';
import { CalendarDays, Clock, IndianRupee, User, CheckCircle, XCircle, Banknote, Play, FlagTriangleRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FriendlyEmptyState } from './FriendlyEmptyState';
import { useTranslation } from '../locales/useTranslation';

export const IncomingRequests: React.FC = () => {
  const { user, bookings, updateBookingStatus } = useStore();
  const { t } = useTranslation();

  // Filter bookings to ONLY include requests where the logged-in user is the provider
  const providerBookings = (bookings || []).filter((b) => b && user && b.providerId === user.id);
  const allBookings = [...providerBookings].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const pendingBookings   = allBookings.filter((b) => b.status === 'pending');
  const acceptedBookings  = allBookings.filter((b) => b.status === 'accepted');
  const paidBookings      = allBookings.filter((b) => b.status === 'paid');
  const activeBookings    = allBookings.filter((b) => b.status === 'active');
  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const rejectedBookings  = allBookings.filter((b) => b.status === 'rejected');

  if (allBookings.length === 0) {
    return (
      <FriendlyEmptyState
        iconName="Inbox"
        title={t('booking.noIncoming') || 'No Incoming Requests'}
        description={t('booking.noIncomingDesc') || 'When consumers book your listings, requests will appear here.'}
        actionText=""
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">

      {/* ── 1. Pending Requests (Accept / Decline) ──────────── */}
      {pendingBookings.length > 0 && (
        <Section title={`⏳ Pending Requests (${t('status.pending') || 'Pending'})`} count={pendingBookings.length}>
          {pendingBookings.map((b) => (
            <BookingCard key={b.id} booking={b}>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateBookingStatus(b.id, 'accepted')}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl text-xs active:scale-95 transition-all outline-none shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" /> {t('booking.accept') || 'Accept'}
                </button>
                <button
                  onClick={() => updateBookingStatus(b.id, 'rejected')}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-cream-100 hover:bg-cream-200 border border-cream-800 text-earth-800 font-bold rounded-xl text-xs active:scale-95 transition-all outline-none"
                >
                  <XCircle className="w-4 h-4 text-harvest-orange-dark" /> {t('booking.reject') || 'Decline'}
                </button>
              </div>
            </BookingCard>
          ))}
        </Section>
      )}

      {/* ── 2. Accepted — Awaiting Payment ─────────── */}
      {acceptedBookings.length > 0 && (
        <Section title="✅ Accepted Requests" count={acceptedBookings.length}>
          {acceptedBookings.map((b) => (
            <BookingCard key={b.id} booking={b} badgeLabel="✅ Accepted" badgeClass="bg-rural-green-100 text-rural-green-800 border-rural-green-200" />
          ))}
        </Section>
      )}

      {/* ── 3. Paid — Ready to Start ──────── */}
      {paidBookings.length > 0 && (
        <Section title="💚 Confirmed — Ready to Start" count={paidBookings.length} accent>
          {paidBookings.map((b) => (
            <BookingCard key={b.id} booking={b} badgeLabel="💚 PAID" badgeClass="bg-rural-green-700 text-cream-50 border-rural-green-800">
              <button
                onClick={() => updateBookingStatus(b.id, 'active')}
                type="button"
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs active:scale-[0.98] outline-none shadow-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                {t('booking.markActive') || 'Start Job'}
              </button>
            </BookingCard>
          ))}
        </Section>
      )}

      {/* ── 4. Active Jobs ─────── */}
      {activeBookings.length > 0 && (
        <Section title="🚜 Active Jobs" count={activeBookings.length} active>
          {activeBookings.map((b) => (
            <BookingCard key={b.id} booking={b} badgeLabel="🚜 Active" badgeClass="bg-blue-100 text-blue-800 border-blue-200" active>
              <button
                onClick={() => updateBookingStatus(b.id, 'completed')}
                type="button"
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl text-xs active:scale-[0.98] outline-none shadow-xs"
              >
                <FlagTriangleRight className="w-4 h-4" />
                {t('booking.markComplete') || 'Complete Job'}
              </button>
            </BookingCard>
          ))}
        </Section>
      )}

      {/* ── 5. Completed Jobs ───────────────────────────────── */}
      {completedBookings.length > 0 && (
        <Section title="🎉 Completed Jobs" count={completedBookings.length}>
          {completedBookings.map((b) => (
            <BookingCard key={b.id} booking={b} badgeLabel="🎉 Completed" badgeClass="bg-rural-green-800 text-cream-50 border-rural-green-900">
              <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-rural-green-100 rounded-xl border border-rural-green-200">
                <Banknote className="w-4 h-4 text-rural-green-800" />
                <span className="text-xs font-extrabold text-rural-green-800">{t('status.completed') || 'Completed'} ✓</span>
              </div>
            </BookingCard>
          ))}
        </Section>
      )}

      {/* ── 6. Declined / Rejected ─────────────── */}
      {rejectedBookings.length > 0 && (
        <Section title="❌ Declined Requests" count={rejectedBookings.length} muted>
          {rejectedBookings.map((b) => (
            <BookingCard key={b.id} booking={b} badgeLabel="❌ Declined" badgeClass="bg-earth-100 text-earth-600 border-earth-300" muted />
          ))}
        </Section>
      )}
    </div>
  );
};

// ── Section wrapper ─────────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  count: number;
  accent?: boolean;
  active?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}> = ({ title, count, accent, active, muted, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className={`text-xs font-extrabold uppercase tracking-wider ${
        accent ? 'text-rural-green-800' : active ? 'text-blue-700' : muted ? 'text-earth-400' : 'text-earth-600'
      }`}>
        {title}
      </span>
      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
        accent
          ? 'bg-rural-green-700 text-cream-50'
          : active
            ? 'bg-blue-600 text-white'
            : muted
              ? 'bg-earth-200 text-earth-500'
              : 'bg-earth-200 text-earth-700'
      }`}>
        {count}
      </span>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// ── Booking card ────────────────────────────────────────────────────────────
const BookingCard: React.FC<{
  booking: ReturnType<typeof useStore.getState>['bookings'][number];
  badgeLabel?: string;
  badgeClass?: string;
  muted?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}> = ({ booking, badgeLabel, badgeClass, muted, active, children }) => (
  <div className={`bg-cream-50 border-2 rounded-3xl p-4 shadow-xs ${
    active ? 'border-blue-300 bg-blue-50/20' : muted ? 'border-earth-300' : 'border-cream-800'
  }`}>
    {/* Top row */}
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-extrabold text-earth-500 mb-0.5">Booking Request</p>
        <h4 className="font-bold text-sm text-earth-900 leading-tight truncate">{booking.listingTitle || 'Requested Listing'}</h4>
      </div>
      {badgeLabel && (
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border shrink-0 ${badgeClass}`}>
          {badgeLabel}
        </span>
      )}
    </div>

    {/* Consumer */}
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-earth-200 flex items-center justify-center shrink-0">
        <User className="w-4 h-4 text-earth-600" />
      </div>
      <span className="text-xs font-bold text-earth-700">{booking.consumerName || 'Consumer User'}</span>
    </div>

    {/* Details grid */}
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-cream-100 rounded-xl p-2">
        <CalendarDays className="w-4 h-4 mx-auto text-earth-500 mb-0.5" />
        <p className="text-[10px] font-bold text-earth-700 truncate">
          {booking.endDate && booking.endDate !== booking.date ? `${booking.date} to ${booking.endDate.slice(5)}` : booking.date || 'TBD'}
        </p>
        <p className="text-[9px] text-earth-400 font-semibold">Date</p>
      </div>
      <div className="bg-cream-100 rounded-xl p-2">
        <Clock className="w-4 h-4 mx-auto text-earth-500 mb-0.5" />
        <p className="text-[10px] font-bold text-earth-700">
          {booking.bookingType === 'hourly' || booking.hours
            ? `${booking.hours || booking.quantity || 1} Hr`
            : `${booking.days || booking.quantity || 1} Day`}
        </p>
        <p className="text-[9px] text-earth-400 font-semibold">Duration</p>
      </div>
      <div className="bg-cream-100 rounded-xl p-2">
        <IndianRupee className="w-4 h-4 mx-auto text-rural-green-700 mb-0.5" />
        <p className="text-[10px] font-bold text-rural-green-900">₹{booking.totalPrice || 0}</p>
        <p className="text-[9px] text-earth-400 font-semibold">Total</p>
      </div>
    </div>

    {children}
  </div>
);

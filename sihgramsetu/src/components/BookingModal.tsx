import React, { useState, useMemo, useEffect } from 'react';
import { X, CalendarDays, Clock, IndianRupee, CheckCircle, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Listing } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

interface BookingModalProps {
  listing: Listing;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ listing, onClose }) => {
  const { user, addBooking } = useStore();
  const { t } = useTranslation();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const bookedSet = useMemo(() => new Set(listing.bookedDates || []), [listing.bookedDates]);
  const configuredDates = listing.availabilityDates || [];

  // Generate candidate dates list
  const calendarDates = useMemo(() => {
    if (configuredDates.length > 0) {
      return configuredDates;
    }
    const dates: string[] = [];
    const cur = new Date();
    cur.setDate(cur.getDate() + 1);
    for (let i = 0; i < 15; i++) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [configuredDates]);

  // Selected dates list — default to first available non-booked date
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const firstAvailable = calendarDates.find((d) => !bookedSet.has(d));
    return firstAvailable ? [firstAvailable] : [minDateStr];
  });

  const [hours, setHours] = useState<number>(4);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rates
  const hourlyRate = listing.hourlyPrice ?? listing.price;
  const dailyRate = listing.dailyPrice ?? (listing.hourlyPrice ? listing.hourlyPrice * 6 : listing.price * 6);

  // Dynamic Mode: Exactly 1 date => Hourly booking; >1 date => Daily booking
  const isHourlyMode = selectedDates.length === 1;
  const numDays = selectedDates.length;

  // Price Calculation
  const totalPrice = isHourlyMode ? hourlyRate * hours : dailyRate * numDays;

  // Toggle date selection via Calendar Grid
  const handleToggleDatePill = (dStr: string) => {
    if (bookedSet.has(dStr)) {
      setError('Selected date is unavailable.');
      return;
    }

    if (selectedDates.includes(dStr)) {
      if (selectedDates.length === 1) return; // Keep at least 1 date
      setSelectedDates(selectedDates.filter((d) => d !== dStr));
      setError('');
    } else {
      const newSelection = [...selectedDates, dStr].sort();
      const start = newSelection[0];
      const end = newSelection[newSelection.length - 1];
      
      // Check if range contains any booked dates
      const hasBookedInRange = calendarDates.some(
        (d) => d >= start && d <= end && bookedSet.has(d)
      );

      if (hasBookedInRange) {
        setError('Please select only available dates.');
        return;
      }
      setSelectedDates(newSelection);
      setError('');
    }
  };

  // Add date handler
  const handleAddDate = () => {
    const lastDateStr = selectedDates[selectedDates.length - 1] || minDateStr;
    const availableFutureDate = calendarDates.find(
      (d) => d > lastDateStr && !selectedDates.includes(d) && !bookedSet.has(d)
    );

    if (availableFutureDate) {
      setSelectedDates([...selectedDates, availableFutureDate].sort());
      setError('');
    } else {
      setError('No more available dates to add.');
    }
  };

  // Remove date handler
  const handleRemoveDate = (index: number) => {
    if (selectedDates.length <= 1) return;
    const updated = selectedDates.filter((_, i) => i !== index);
    setSelectedDates(updated);
    setError('');
  };

  // Update specific date
  const handleDateChange = (index: number, val: string) => {
    if (bookedSet.has(val)) {
      setError('Selected date is unavailable.');
      return;
    }
    const updated = [...selectedDates];
    updated[index] = val;
    const sorted = Array.from(new Set(updated)).sort();
    
    // Validate range does not bridge across booked dates
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const hasBookedInRange = calendarDates.some(
      (d) => d >= start && d <= end && bookedSet.has(d)
    );

    if (hasBookedInRange) {
      setError('Please select only available dates.');
      return;
    }

    setSelectedDates(sorted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedDates.length === 0 || !selectedDates[0]) {
      setError(t('validation.dateRequired'));
      return;
    }

    // Final pre-submit availability check
    const hasUnavailable = selectedDates.some((d) => bookedSet.has(d));
    if (hasUnavailable) {
      setError('Sorry, some of the selected dates are no longer available. Please select another date.');
      return;
    }

    if (isHourlyMode && hours < 1) {
      setError(t('validation.quantityMin'));
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const sortedDates = [...selectedDates].sort();
      await addBooking({
        listingId: listing.id,
        startDate: sortedDates[0],
        endDate: sortedDates[sortedDates.length - 1],
        dates: sortedDates,
        hours: isHourlyMode ? hours : undefined,
        days: !isHourlyMode ? numDays : undefined,
        bookingType: isHourlyMode ? 'hourly' : 'daily',
        quantity: isHourlyMode ? hours : numDays,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Sorry, some of the selected dates are no longer available. Please select another date.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const dateDisplay = isHourlyMode
      ? selectedDates[0]
      : `${selectedDates[0]} – ${selectedDates[selectedDates.length - 1]}`;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="w-full max-w-md bg-cream-50 rounded-t-3xl p-6 text-center animate-in slide-in-from-bottom duration-300">
          <div className="w-16 h-16 bg-rural-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-rural-green-700" />
          </div>
          <h3 className="text-xl font-extrabold text-earth-900 mb-2">
            {t('booking.requestSent')}
          </h3>
          <p className="text-sm text-earth-600 leading-relaxed mb-2 font-bold">
            {listing.title}
          </p>

          {/* Booking Summary Box */}
          <div className="p-4 bg-cream-100 rounded-2xl text-xs space-y-1.5 text-left border border-cream-800 mb-5">
            <div className="flex justify-between">
              <span className="text-earth-500 font-semibold">{isHourlyMode ? 'Date:' : 'Dates:'}</span>
              <span className="font-bold text-earth-900">{dateDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-earth-500 font-semibold">Duration:</span>
              <span className="font-bold text-earth-900">
                {isHourlyMode ? `${hours} hours` : `${numDays} days`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-earth-500 font-semibold">Rate:</span>
              <span className="font-bold text-earth-900">
                ₹{isHourlyMode ? hourlyRate : dailyRate}/{isHourlyMode ? 'hour' : 'day'}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-cream-800 text-sm">
              <span className="font-extrabold text-earth-900">Total:</span>
              <span className="font-black text-rural-green-800">₹{totalPrice}</span>
            </div>
          </div>

          <p className="text-xs text-earth-500 mb-6">
            {t('booking.awaitApproval')}
          </p>
          <button
            onClick={onClose}
            type="button"
            className="w-full py-3.5 bg-rural-green-800 text-cream-50 font-bold rounded-xl shadow-md text-sm active:scale-[0.98] outline-none"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    );
  }

  // ── Booking Form ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-cream-50 rounded-t-3xl animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-earth-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-earth-900">{t('booking.bookNow')}</h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isHourlyMode
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                {isHourlyMode ? `⏱ ${t('booking.hourlyBookingMode')}` : `📅 ${t('booking.dailyBookingMode')}`}
              </span>
            </div>
            <p className="text-xs text-earth-500 font-medium truncate max-w-[240px] mt-0.5">{listing.title}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-harvest-orange/10 border border-harvest-orange/20 rounded-xl text-xs font-semibold text-harvest-orange-dark flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Calendar Date Picker Grid */}
          <div className="bg-cream-100/70 border border-cream-800/60 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-earth-800 uppercase tracking-wider">
                <CalendarDays className="w-3.5 h-3.5 text-rural-green-800" />
                Select Dates (📅 कैलेंडर से चुनें)
              </label>
              <span className="text-[10px] text-earth-500 font-bold">
                {selectedDates.length} selected
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto p-1">
              {calendarDates.map((dStr) => {
                const isBooked = bookedSet.has(dStr);
                const isSelected = selectedDates.includes(dStr);
                const formattedDate = new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <button
                    key={dStr}
                    type="button"
                    disabled={isBooked}
                    onClick={() => handleToggleDatePill(dStr)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-extrabold border transition-all text-center flex flex-col items-center justify-center outline-none ${
                      isBooked
                        ? 'bg-red-50 text-red-600 border-red-200 line-through opacity-60 cursor-not-allowed pointer-events-none'
                        : isSelected
                        ? 'bg-rural-green-800 text-cream-50 border-rural-green-900 shadow-sm scale-105'
                        : 'bg-cream-50 text-earth-850 border-cream-800 hover:border-rural-green-600'
                    }`}
                  >
                    <span>{formattedDate}</span>
                    <span className={`text-[9px] font-semibold ${isBooked ? 'text-red-500' : isSelected ? 'text-cream-50/80' : 'text-earth-400'}`}>
                      {isBooked ? 'Booked' : isSelected ? '✓ Selected' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Date Inputs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-earth-500 uppercase tracking-wider">
                {t('booking.selectDates')} *
              </label>
              <button
                type="button"
                onClick={handleAddDate}
                className="text-xs font-extrabold text-rural-green-800 hover:underline flex items-center gap-0.5 outline-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                {t('booking.addAnotherDate')}
              </button>
            </div>

            <div className="space-y-2">
              {selectedDates.map((d, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="date"
                    min={minDateStr}
                    value={d}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm font-medium text-earth-950 transition-colors"
                    required
                  />
                  {selectedDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(index)}
                      className="p-2 text-earth-400 hover:text-red-600 rounded-xl bg-cream-100 hover:bg-red-50 border border-cream-800 transition-colors outline-none"
                      aria-label="Remove date"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Section: Hourly Selector vs Daily Mode Summary */}
          {isHourlyMode ? (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bk-hours" className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  {t('booking.howManyHours')} *
                </label>
                <span className="text-xs font-extrabold text-blue-800">
                  ₹{hourlyRate}/{t('booking.hr')}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="w-11 h-11 rounded-xl bg-cream-50 border border-blue-200 text-earth-900 font-extrabold text-xl flex items-center justify-center active:scale-90 transition-transform outline-none"
                >−</button>
                <input
                  id="bk-hours"
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => { setHours(Math.max(1, parseInt(e.target.value) || 1)); setError(''); }}
                  className="flex-1 px-4 py-2.5 bg-cream-50 border border-blue-200 focus:border-blue-600 rounded-xl outline-none text-base font-black text-earth-950 text-center transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setHours(Math.min(24, hours + 1))}
                  className="w-11 h-11 rounded-xl bg-cream-50 border border-blue-200 text-earth-900 font-extrabold text-xl flex items-center justify-center active:scale-90 transition-transform outline-none"
                >+</button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider block">
                  {t('booking.numberOfDays')}
                </span>
                <span className="text-base font-black text-purple-900">
                  {numDays} {t('booking.daysLabel')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-purple-700 font-semibold block">{t('booking.ratePerDay')}</span>
                <span className="text-sm font-extrabold text-purple-950">₹{dailyRate}/day</span>
              </div>
            </div>
          )}

          {/* Price Calculation Summary */}
          <div className="p-4 bg-rural-green-50 border border-rural-green-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-earth-700 font-medium">
              <span>Rate:</span>
              <span className="font-bold text-earth-900">
                ₹{isHourlyMode ? hourlyRate : dailyRate} / {isHourlyMode ? 'hour' : 'day'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-earth-700 font-medium">
              <span>Duration:</span>
              <span className="font-bold text-earth-900">
                {isHourlyMode ? `${hours} hours` : `${numDays} days`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-rural-green-200/60">
              <span className="text-sm font-extrabold text-earth-900">Total Price:</span>
              <span className="text-xl font-black text-rural-green-900">₹{totalPrice}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-base active:scale-[0.98] outline-none disabled:opacity-50"
          >
            <CalendarDays className="w-5 h-5" />
            {t('booking.sendRequest')}
          </button>
        </form>
      </div>
    </div>
  );
};

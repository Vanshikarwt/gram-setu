import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tractor, UserCheck, MapPin, Clock, IndianRupee, MessageCircle, Star, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BookingModal } from './BookingModal';
import type { Listing } from '../store/useStore';
import { api } from '../utils/api';

interface ListingDetailProps {
  listing: Listing;
  onClose: () => void;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ listing, onClose }) => {
  const navigate = useNavigate();
  const { user, startConversationWithUser, reviews: storeReviews } = useStore();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [apiReviews, setApiReviews] = useState<any[]>([]);

  // Fetch backend reviews for this listing
  useEffect(() => {
    api.get(`/listings/${listing.id}/reviews`).then((res) => {
      if (res.reviews) {
        setApiReviews(res.reviews);
      }
    }).catch((err) => console.error('Failed to fetch listing reviews:', err));
  }, [listing.id]);

  // Combine API reviews & store reviews (deduplicated)
  const combinedReviews = [...apiReviews];
  storeReviews.filter((r) => r.listingId === listing.id).forEach((sr) => {
    if (!combinedReviews.some((ar) => ar.id === sr.id || ar.bookingId === sr.bookingId)) {
      combinedReviews.push({
        id: sr.id,
        consumerName: sr.consumerName,
        rating: sr.rating,
        comment: sr.comment,
        createdAt: new Date(sr.timestamp).toISOString(),
      });
    }
  });

  const listingReviews = combinedReviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const avgRating = listingReviews.length
    ? listingReviews.reduce((sum, r) => sum + r.rating, 0) / listingReviews.length
    : (listing.averageRating || 0);

  const renderStars = (rating: number, size = 'w-4 h-4') =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${
          s <= Math.round(rating)
            ? 'text-harvest-gold-dark fill-harvest-gold-dark'
            : 'text-earth-300 fill-transparent'
        }`}
      />
    ));

  const Icon = listing.type === 'machinery' ? Tractor : UserCheck;
  const typeLabel = listing.type === 'machinery' ? 'कृषि उपकरण (Machinery)' : 'कृषि श्रम (Labor)';

  const providerName = listing.providerName || `Provider #${listing.providerId.slice(-4)}`;

  const handleChatWithProvider = async () => {
    if (!user) return;
    if (listing.providerId === user.id) return;

    const convId = await startConversationWithUser(listing.providerId);
    if (convId) {
      onClose();
      navigate('/chat');
    }
  };

  const isOwnListing = user?.id === listing.providerId;

  return (
    <div className="absolute inset-0 bg-cream-950 z-30 flex flex-col animate-in slide-in-from-right duration-250 select-none">

      {/* Detail Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 bg-cream-50 border-b border-cream-800 shadow-xs">
        <button
          onClick={onClose}
          type="button"
          className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-earth-500">{typeLabel}</span>
          <h2 className="font-bold text-base text-earth-900 leading-tight truncate max-w-[260px]">{listing.title}</h2>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">

        {/* Hero Image Placeholder */}
        <div className={`w-full h-48 rounded-3xl flex flex-col items-center justify-center shadow-inner ${
          listing.type === 'machinery'
            ? 'bg-gradient-to-br from-rural-green-100 to-rural-green-200'
            : 'bg-gradient-to-br from-earth-100 to-earth-200'
        }`}>
          <Icon className={`w-16 h-16 ${listing.type === 'machinery' ? 'text-rural-green-600' : 'text-earth-600'}`} />
          <span className="text-xs font-semibold text-earth-500 mt-2">चित्र जल्द ही उपलब्ध (Image coming soon)</span>
        </div>

        {/* Title & Status */}
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-extrabold text-earth-900 leading-tight">{listing.title}</h1>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
              listing.status === 'active'
                ? 'bg-rural-green-100 text-rural-green-800 border-rural-green-200'
                : 'bg-earth-200 text-earth-700 border-earth-300'
            }`}>
              {listing.status === 'active' ? '✅ उपलब्ध (Available)' : '⏸ अनुपलब्ध (Unavailable)'}
            </span>
          </div>

          {/* Average rating row */}
          {listingReviews.length > 0 ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">{renderStars(avgRating, 'w-4 h-4')}</div>
              <span className="text-sm font-extrabold text-earth-900">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-earth-500 font-semibold">({listingReviews.length} समीक्षा)</span>
            </div>
          ) : (
            <p className="text-xs text-earth-400 mt-2 font-medium">⭐ अभी तक कोई समीक्षा नहीं (No reviews yet)</p>
          )}
          <p className="text-sm text-earth-700 leading-relaxed mt-3">
            {listing.description || 'कोई विवरण उपलब्ध नहीं है। कृपया सेवा प्रदाता से संपर्क करें। (No description available. Please contact the provider.)'}
          </p>
        </div>

        {/* Price & Billing Unit */}
        {(listing.hourlyPrice || listing.price) && listing.dailyPrice && (listing.type === 'machinery' || listing.type === 'labor') ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 text-center">
              <IndianRupee className="w-5 h-5 mx-auto text-rural-green-800 mb-1" />
              <span className="block text-xl font-extrabold text-rural-green-900">₹{listing.hourlyPrice ?? listing.price}</span>
              <span className="text-[11px] font-semibold text-earth-500">प्रति घंटा (Per Hour)</span>
            </div>
            <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 text-center">
              <IndianRupee className="w-5 h-5 mx-auto text-rural-green-800 mb-1" />
              <span className="block text-xl font-extrabold text-rural-green-900">₹{listing.dailyPrice}</span>
              <span className="text-[11px] font-semibold text-earth-500">प्रति दिन (Per Day)</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 text-center">
              <IndianRupee className="w-5 h-5 mx-auto text-rural-green-800 mb-1" />
              <span className="block text-2xl font-extrabold text-rural-green-900">₹{listing.price}</span>
              <span className="text-[11px] font-semibold text-earth-500">
                {listing.unit === 'per hour' ? 'प्रति घंटा (Per Hour)' : 'प्रति दिन (Per Day)'}
              </span>
            </div>
            <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-harvest-gold-dark mb-1" />
              <span className="block text-lg font-extrabold text-earth-900">
                {listing.unit === 'per hour' ? 'घंटे के हिसाब' : 'दैनिक दर'}
              </span>
              <span className="text-[11px] font-semibold text-earth-500">Billing Unit</span>
            </div>
          </div>
        )}

        {/* Dynamic Resource Availability Section */}
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-rural-green-800" />
              <h3 className="font-extrabold text-sm text-earth-900 uppercase tracking-wide">
                📅 उपलब्धता (Resource Availability)
              </h3>
            </div>
            {listing.availabilityDates && listing.availabilityDates.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rural-green-100 text-rural-green-800 border border-rural-green-200">
                {listing.availabilityDates.filter((d) => !(listing.bookedDates || []).includes(d)).length} दिन उपलब्ध
              </span>
            )}
          </div>

          {listing.availabilityDates && listing.availabilityDates.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-earth-600 font-medium">
                उपलब्ध और बुक की गई तिथियां (Available & booked dates):
              </p>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {listing.availabilityDates.map((dStr) => {
                  const isBooked = (listing.bookedDates || []).includes(dStr);
                  const formattedDate = new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  return (
                    <span
                      key={dStr}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                        isBooked
                          ? 'bg-red-50 text-red-700 border-red-200 line-through opacity-75'
                          : 'bg-rural-green-100 text-rural-green-900 border-rural-green-300 shadow-xs'
                      }`}
                    >
                      {isBooked ? '❌' : '✅'} {formattedDate}
                      {isBooked && <span className="text-[9px] no-underline font-normal text-red-600 bg-white px-1 rounded ml-1">Booked</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-earth-500 font-medium italic">
              इस संसाधन के लिए सभी तिथियां खुली हैं (All dates open for booking).
            </p>
          )}
        </div>

        {/* Location */}
        <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rural-green-100 text-rural-green-800 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-earth-500 font-extrabold uppercase tracking-wider">स्थान (Location)</span>
            <p className="font-bold text-sm text-earth-900">{listing.location}</p>
          </div>
        </div>

        {/* Provider Info */}
        <div className="bg-cream-50 border border-cream-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-earth-200 rounded-full flex items-center justify-center text-earth-700 font-bold text-lg border border-cream-800">
            👤
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-earth-500 font-extrabold uppercase tracking-wider">सेवा प्रदाता (Provider)</span>
            <p className="font-bold text-sm text-earth-900">{providerName}</p>
          </div>
        </div>

        {/* ── Reviews Section ────────────────────────────────────────────────── */}
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-earth-900">⭐ समीक्षाएं (Reviews)</h3>
            {listingReviews.length > 0 && (
              <span className="text-[10px] font-extrabold text-earth-500 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-800">
                {listingReviews.length} total
              </span>
            )}
          </div>

          {listingReviews.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🌾</p>
              <p className="text-xs font-semibold text-earth-500">
                अभी तक कोई समीक्षा नहीं।
              </p>
              <p className="text-[10px] text-earth-400 mt-0.5">
                No reviews yet. Be the first to book!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listingReviews.map((review) => (
                <div key={review.id} className="bg-cream-100 rounded-2xl p-3.5 border border-cream-200">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="text-xs font-extrabold text-earth-900">{review.consumer?.name || review.consumerName || 'Kisan User'}</p>
                      <p className="text-[10px] text-earth-400 font-medium">
                        {new Date(review.createdAt || review.timestamp || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renderStars(review.rating, 'w-3.5 h-3.5')}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-earth-700 leading-relaxed">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-cream-50 border-t border-cream-800 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3.5 bg-cream-100 hover:bg-cream-200 border border-cream-800 text-earth-800 font-bold rounded-xl transition-colors text-sm active:scale-[0.98] outline-none"
          >
            वापस (Back)
          </button>

          {isOwnListing ? (
            <button
              type="button"
              disabled
              className="flex-[2] py-3.5 bg-earth-200 text-earth-500 font-bold rounded-xl text-sm cursor-not-allowed"
            >
              आपकी लिस्टिंग (Your Listing)
            </button>
          ) : (
            <button
              onClick={handleChatWithProvider}
              type="button"
              className="flex-[2] py-3.5 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl shadow-md text-sm active:scale-[0.98] outline-none flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4.5 h-4.5 stroke-[2.5]" />
              प्रदाता से बात करें (Chat)
            </button>
          )}
        </div>

        {/* Book Now placeholder */}
        <button
          onClick={() => setShowBookingModal(true)}
          type="button"
          disabled={listing.status !== 'active' || isOwnListing}
          className="w-full mt-2 py-3 bg-harvest-gold-dark hover:bg-harvest-gold disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 font-bold rounded-xl text-sm active:scale-[0.98] transition-colors outline-none"
        >
          📅 बुक करें (Book Now)
        </button>
      </div>

      {/* Booking Modal Overlay */}
      {showBookingModal && (
        <BookingModal
          listing={listing}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

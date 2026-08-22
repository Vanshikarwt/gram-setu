import React from 'react';
import { Tractor, UserCheck, MapPin, ChevronRight, Leaf, Warehouse, ShoppingBag, Package, Star, CalendarDays } from 'lucide-react';
import type { Listing } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

interface ConsumerListingCardProps {
  listing: Listing;
  onTap: (listing: Listing) => void;
}

const TYPE_META: Record<string, {
  Icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelHi: string;
  iconBg: string;
  iconText: string;
}> = {
  machinery:    { Icon: Tractor,     labelEn: 'Machinery',    labelHi: 'उपकरण',         iconBg: 'bg-blue-100',          iconText: 'text-blue-700' },
  labor:        { Icon: UserCheck,   labelEn: 'Labor',        labelHi: 'श्रम',           iconBg: 'bg-purple-100',        iconText: 'text-purple-700' },
  crop_residue: { Icon: Leaf,        labelEn: 'Crop Residue', labelHi: 'फसल अवशेष',     iconBg: 'bg-amber-100',         iconText: 'text-amber-700' },
  storage:      { Icon: Warehouse,   labelEn: 'Storage',      labelHi: 'भंडारण',         iconBg: 'bg-cyan-100',          iconText: 'text-cyan-700' },
  agri_product: { Icon: ShoppingBag, labelEn: 'Agri Product', labelHi: 'कृषि उत्पाद',   iconBg: 'bg-rural-green-100',   iconText: 'text-rural-green-800' },
};

export const ConsumerListingCard: React.FC<ConsumerListingCardProps> = ({ listing, onTap }) => {
  const { t } = useTranslation();
  const meta = TYPE_META[listing.type] ?? { Icon: Package, labelEn: listing.type, labelHi: listing.type, iconBg: 'bg-earth-200', iconText: 'text-earth-700' };
  const { Icon, labelEn, labelHi, iconBg, iconText } = meta;

  // Stock indicator for agri_product / crop_residue
  const hasStock = listing.stock != null;
  const stockLow = hasStock && (listing.stock as number) < 50;

  // Rating display
  const hasRating = listing.averageRating != null && (listing.averageRating as number) > 0;
  const ratingDisplay = hasRating ? (listing.averageRating as number).toFixed(1) : null;
  const reviewCount = listing.reviewCount ?? 0;

  return (
    <button
      onClick={() => onTap(listing)}
      type="button"
      className="w-full text-left bg-cream-50 border border-cream-800 rounded-3xl p-4 shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-150 select-none outline-none focus:ring-2 focus:ring-rural-green-300"
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={`p-3 rounded-2xl shrink-0 ${iconBg} ${iconText}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type badge + category */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-earth-500">
              {labelHi} ({labelEn})
            </span>
            {listing.category && (
              <span className="text-[9px] bg-earth-100 text-earth-600 font-bold px-1.5 py-0.5 rounded-md capitalize">
                {listing.category.replace('-', ' ')}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base text-earth-900 leading-tight truncate">
            {listing.title}
          </h3>
          <p className="text-xs text-earth-600 leading-relaxed line-clamp-2 mt-1">
            {listing.description || 'कोई विवरण नहीं (No description)'}
          </p>

          {/* Rating row */}
          {hasRating && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= Math.round(listing.averageRating as number)
                        ? 'text-harvest-gold-dark fill-harvest-gold-dark'
                        : 'text-earth-300 fill-transparent'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-earth-600">
                {ratingDisplay}
                {reviewCount > 0 && (
                  <span className="font-normal text-earth-400"> ({reviewCount} {t('home.reviews')})</span>
                )}
              </span>
            </div>
          )}

          {/* Stock badge for product/residue listings */}
          {hasStock && (
            <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
              stockLow ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-rural-green-50 text-rural-green-800 border border-rural-green-200'
            }`}>
              <Package className="w-3 h-3" />
              {stockLow ? `केवल ${listing.stock} बचे!` : `स्टॉक: ${listing.stock} ${listing.unit.replace('per ', '')}`}
            </div>
          )}

          {/* Capacity badge for storage listings */}
          {listing.capacity != null && (
            <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Warehouse className="w-3 h-3" />
              क्षमता: {listing.capacity} टन
            </div>
          )}

          {/* Availability badge */}
          {listing.availabilityDates && listing.availabilityDates.length > 0 && (
            <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rural-green-50 text-rural-green-800 border border-rural-green-200">
              <CalendarDays className="w-3 h-3" />
              <span>उपलब्ध: {listing.availabilityDates.filter((d) => !(listing.bookedDates || []).includes(d)).length} दिन ({listing.bookedDates?.length || 0} बुक)</span>
            </div>
          )}

          {/* Location & Price Row */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-cream-800/40">
            <div className="flex items-center gap-1 text-[11px] text-earth-500 font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{listing.location}</span>
            </div>
            <div className="text-sm font-extrabold text-rural-green-900 whitespace-nowrap text-right">
              {(listing.hourlyPrice || listing.price) && listing.dailyPrice && (listing.type === 'machinery' || listing.type === 'labor') ? (
                <div className="flex items-center gap-1">
                  <span>₹{listing.hourlyPrice ?? listing.price}<span className="text-[10px] font-semibold text-earth-500">/hr</span></span>
                  <span className="text-xs text-earth-400 font-normal">·</span>
                  <span>₹{listing.dailyPrice}<span className="text-[10px] font-semibold text-earth-500">/day</span></span>
                </div>
              ) : (
                <>
                  ₹{listing.price}
                  <span className="text-[10px] font-semibold text-earth-500">
                    {' '}/ {listing.unit}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chevron indicator */}
        <div className="self-center text-earth-300 shrink-0">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
};

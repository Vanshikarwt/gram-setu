import React, { useState } from 'react';
import { Tractor, UserCheck, MapPin, Trash2, Edit2, AlertTriangle, Activity, Leaf, Warehouse, ShoppingBag, Package } from 'lucide-react';
import type { Listing } from '../store/useStore';
import { useStore } from '../store/useStore';
import { calculateUtilization } from '../utils/aiInsights';

const TYPE_META: Record<string, {
  Icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelHi: string;
  iconBg: string;
  iconText: string;
}> = {
  machinery: { Icon: Tractor, labelEn: 'Machinery', labelHi: 'उपकरण', iconBg: 'bg-blue-100', iconText: 'text-blue-700' },
  labor: { Icon: UserCheck, labelEn: 'Labor', labelHi: 'श्रम', iconBg: 'bg-purple-100', iconText: 'text-purple-700' },
  crop_residue: { Icon: Leaf, labelEn: 'Crop Residue', labelHi: 'फसल अवशेष', iconBg: 'bg-amber-100', iconText: 'text-amber-700' },
  storage: { Icon: Warehouse, labelEn: 'Storage', labelHi: 'भंडारण', iconBg: 'bg-cyan-100', iconText: 'text-cyan-700' },
  agri_product: { Icon: ShoppingBag, labelEn: 'Agri Product', labelHi: 'कृषि उत्पाद', iconBg: 'bg-rural-green-100', iconText: 'text-rural-green-800' },
};

interface ListingCardProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onEdit, onDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const bookings = useStore((state) => state.bookings);

  const utilization = calculateUtilization(listing.id, bookings);

  const meta = TYPE_META[listing.type] ?? { Icon: Package, labelEn: listing.type, labelHi: listing.type, iconBg: 'bg-earth-200', iconText: 'text-earth-700' };
  const { Icon, labelHi, labelEn, iconBg, iconText } = meta;
  const typeLabel = `${labelHi} (${labelEn})`;
  const statusLabel = listing.status === 'active' ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)';
  const statusColor = listing.status === 'active' 
    ? 'bg-rural-green-100 text-rural-green-800 border-rural-green-200' 
    : 'bg-earth-200 text-earth-700 border-earth-300';

  return (
    <div className="relative bg-cream-50 border border-cream-800 rounded-3xl p-4.5 shadow-sm hover:shadow-md transition-shadow select-none overflow-hidden min-h-[170px] flex flex-col justify-between">
      
      {/* Visual Confirm Delete Card Overlay */}
      {showConfirmDelete ? (
        <div className="absolute inset-0 bg-harvest-orange-dark/95 flex flex-col justify-center items-center p-4 text-center z-10 animate-in fade-in duration-150">
          <AlertTriangle className="w-8 h-8 text-cream-50 mb-2 animate-bounce" />
          <h4 className="font-bold text-cream-50 text-sm">
            क्या आप इसे हटाना चाहते हैं?
          </h4>
          <p className="text-xs text-cream-100/90 mt-1 mb-4 leading-tight">
            Confirm delete for "{listing.title}"?
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => onDelete(listing.id)}
              type="button"
              className="flex-1 py-2 bg-cream-50 text-harvest-orange-dark font-extrabold rounded-xl text-xs hover:bg-cream-100 active:scale-95 transition-all outline-none"
            >
              हाँ (Delete)
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              type="button"
              className="flex-1 py-2 bg-transparent text-cream-50 border border-cream-100/30 font-extrabold rounded-xl text-xs hover:bg-cream-100/10 active:scale-95 transition-all outline-none"
            >
              नहीं (Cancel)
            </button>
          </div>
        </div>
      ) : null}

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            {/* Icon Frame */}
            <div className={`p-2.5 rounded-2xl ${iconBg} ${iconText}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-earth-500">
                {typeLabel}
              </span>
              <h3 className="font-bold text-base text-earth-900 leading-tight">
                {listing.title}
              </h3>
            </div>
          </div>
          {/* Status Badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-earth-700 leading-relaxed text-left line-clamp-2 mb-2 pl-1">
          {listing.description || 'कोई विवरण नहीं (No description provided)'}
        </p>

        {/* AI Resource Utilization / Idle Metric */}
        <div className="mb-3 pl-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Activity className="w-3.5 h-3.5 text-earth-500 shrink-0" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${utilization.statusColor}`}>
              {utilization.label}
            </span>
            {/* Stock badge */}
            {listing.stock != null && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                (listing.stock as number) < 50
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-rural-green-50 text-rural-green-800 border-rural-green-200'
              }`}>
                स्टॉक: {listing.stock}
              </span>
            )}
            {/* Capacity badge */}
            {listing.capacity != null && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-cyan-50 text-cyan-700 border-cyan-200">
                क्षमता: {listing.capacity}T
              </span>
            )}
          </div>
          {utilization.recommendation && (
            <p className="text-[10px] text-harvest-orange-dark font-medium mt-1 leading-tight">
              💡 {utilization.recommendation}
            </p>
          )}
        </div>
      </div>

      {/* Bottom details & CTA buttons */}
      <div className="flex items-end justify-between pt-2.5 border-t border-cream-800/60 mt-auto">
        <div className="text-left pl-1">
          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-earth-500 font-semibold mb-1 leading-none">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{listing.location}</span>
          </div>
          {/* Rate */}
          <div className="text-sm font-extrabold text-rural-green-900 leading-none mt-1.5">
            ₹{listing.price}{' '}
            <span className="text-[10px] font-semibold text-earth-500">
              / {listing.unit}
            </span>
          </div>
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(listing)}
            type="button"
            className="p-2.5 bg-cream-100 hover:bg-cream-200 text-earth-700 hover:text-earth-900 rounded-xl transition-colors border border-cream-800/20 active:scale-95 outline-none"
            aria-label="Edit Listing"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            type="button"
            className="p-2.5 bg-harvest-orange/10 hover:bg-harvest-orange/20 text-harvest-orange-dark rounded-xl transition-colors border border-harvest-orange/20 active:scale-95 outline-none"
            aria-label="Delete Listing"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Tractor, Leaf, HardHat, Warehouse, Package,
  SlidersHorizontal, X, Star, CalendarDays, Inbox, Plus,
  ChevronRight, Loader2, MapPin, Navigation, ArrowLeft, BarChart3,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { FriendlyEmptyState } from '../components/FriendlyEmptyState';
import { ListingCard } from '../components/ListingCard';
import { ListingForm } from '../components/ListingForm';
import { ConsumerListingCard } from '../components/ConsumerListingCard';
import { SearchBar } from '../components/SearchBar';
import { ListingDetail } from '../components/ListingDetail';
import { MyBookings } from '../components/MyBookings';
import { IncomingRequests } from '../components/IncomingRequests';
import { ProviderAnalytics } from '../components/ProviderAnalytics';
import type { Listing } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActiveFilters {
  minPrice: string;
  maxPrice: string;
  minRating: number; // 0 = any
  location: string;
  maxDistanceKm: string; // numeric distance limit e.g. "25"
}

const DEFAULT_FILTERS: ActiveFilters = { minPrice: '', maxPrice: '', minRating: 0, location: '', maxDistanceKm: '' };

/** Helper to compute deterministic numeric distance in km for a listing relative to user */
const getListingDistanceKm = (listing: Listing, userVillage?: string, userState?: string): number => {
  let hash = 0;
  for (let i = 0; i < listing.id.length; i++) {
    hash = (hash << 5) - hash + listing.id.charCodeAt(i);
    hash |= 0;
  }
  const uVillage = userVillage?.toLowerCase().trim() || '';
  const uState = userState?.toLowerCase().trim() || '';
  const loc = listing.location.toLowerCase();

  if (uVillage && loc.includes(uVillage)) {
    return (Math.abs(hash) % 5) + 2; // 2 to 6 km
  }
  if (uState && loc.includes(uState)) {
    return (Math.abs(hash) % 25) + 5; // 5 to 29 km
  }
  return (Math.abs(hash) % 75) + 15; // 15 to 89 km
};

// ─── Category card definitions ─────────────────────────────────────────────────

const CATEGORY_CARDS: {
  key: FilterCategory;
  emoji: string;
  labelKey: keyof ReturnType<ReturnType<typeof useTranslation>['t']> extends never ? string : string;
  iconBg: string;
  iconText: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'machinery',    emoji: '🚜', labelKey: 'home.catMachinery', iconBg: 'bg-blue-100',         iconText: 'text-blue-700',         Icon: Tractor   },
  { key: 'crop_residue', emoji: '🌾', labelKey: 'home.catResidue',   iconBg: 'bg-amber-100',        iconText: 'text-amber-700',        Icon: Leaf      },
  { key: 'labor',        emoji: '👷', labelKey: 'home.catLabor',     iconBg: 'bg-purple-100',       iconText: 'text-purple-700',       Icon: HardHat   },
  { key: 'storage',      emoji: '🏠', labelKey: 'home.catStorage',   iconBg: 'bg-cyan-100',         iconText: 'text-cyan-700',         Icon: Warehouse },
  { key: 'agri_product', emoji: '📦', labelKey: 'home.catOthers',    iconBg: 'bg-rural-green-100',  iconText: 'text-rural-green-800',  Icon: Package   },
];

// ─── Section Header ─────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}> = ({ title, onViewAll, viewAllLabel }) => (
  <div className="flex items-center justify-between px-4 mb-2">
    <h2 className="text-sm font-extrabold text-earth-900 uppercase tracking-wide">{title}</h2>
    {onViewAll && (
      <button
        onClick={onViewAll}
        type="button"
        className="flex items-center gap-0.5 text-xs font-bold text-rural-green-700 hover:underline outline-none"
      >
        {viewAllLabel} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ─── Horizontal mini card (for recently-viewed) ────────────────────────────────

const MiniListingCard: React.FC<{ listing: Listing; onTap: (l: Listing) => void }> = ({ listing, onTap }) => {
  const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
    machinery: Tractor, labor: HardHat, crop_residue: Leaf, storage: Warehouse, agri_product: Package,
  };
  const Icon = TYPE_ICON[listing.type] ?? Package;
  const TYPE_BG: Record<string, string> = {
    machinery: 'bg-blue-100 text-blue-700', labor: 'bg-purple-100 text-purple-700',
    crop_residue: 'bg-amber-100 text-amber-700', storage: 'bg-cyan-100 text-cyan-700',
    agri_product: 'bg-rural-green-100 text-rural-green-800',
  };
  const cls = TYPE_BG[listing.type] ?? 'bg-earth-100 text-earth-700';

  return (
    <button
      onClick={() => onTap(listing)}
      type="button"
      className="flex-shrink-0 w-40 bg-cream-50 border border-cream-800 rounded-2xl p-3 shadow-xs hover:shadow-sm active:scale-95 transition-all outline-none text-left"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${cls}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-extrabold text-earth-900 line-clamp-2 leading-tight mb-1">{listing.title}</p>
      <p className="text-[11px] font-bold text-rural-green-800">₹{listing.price}</p>
      <p className="text-[9px] text-earth-500 truncate mt-0.5">{listing.location}</p>
    </button>
  );
};

// ─── Filter Panel (slide-up) ───────────────────────────────────────────────────

interface FilterPanelProps {
  filters: ActiveFilters;
  onApply: (f: ActiveFilters) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onApply, onClose }) => {
  const { t } = useTranslation();
  const [local, setLocal] = useState<ActiveFilters>({ ...filters });

  const RATING_OPTIONS = [
    { value: 0, label: t('home.anyRating') },
    { value: 2, label: '2+ ⭐' },
    { value: 3, label: '3+ ⭐' },
    { value: 4, label: '4+ ⭐' },
  ];

  const handleClear = () => {
    const reset = { ...DEFAULT_FILTERS };
    setLocal(reset);
    onApply(reset);
    onClose();
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-cream-50 rounded-t-3xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-earth-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-800">
          <h3 className="font-extrabold text-base text-earth-900">{t('home.filterHeading')}</h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Distance Scale & Manual Input Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-extrabold uppercase tracking-widest text-earth-500 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-rural-green-800" />
                {t('home.distanceScaleFilter')}
              </p>
              {local.maxDistanceKm && (
                <span className="text-xs font-extrabold text-rural-green-800 bg-rural-green-100 border border-rural-green-300 px-2 py-0.5 rounded-md">
                  ≤ {local.maxDistanceKm} km
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              {/* Manual Number Input */}
              <div className="w-28 shrink-0">
                <label className="text-[10px] text-earth-500 font-bold mb-1 block">{t('home.maxDistanceLabel')}</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={150}
                    placeholder="25"
                    value={local.maxDistanceKm}
                    onChange={(e) => setLocal((p) => ({ ...p, maxDistanceKm: e.target.value }))}
                    className="w-full px-2.5 py-2 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm font-bold text-earth-950 transition-colors pr-7"
                  />
                  <span className="absolute right-2 text-xs text-earth-500 font-bold pointer-events-none">km</span>
                </div>
              </div>

              {/* Range Scale Slider */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-earth-500 font-bold">Scale (1 - 100 km)</label>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={local.maxDistanceKm || '100'}
                  onChange={(e) => setLocal((p) => ({ ...p, maxDistanceKm: e.target.value }))}
                  className="w-full accent-rural-green-800 cursor-pointer h-2 bg-cream-200 rounded-lg"
                />
              </div>
            </div>

            {/* Quick Distance Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 25, 50, 75].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLocal((p) => ({ ...p, maxDistanceKm: String(d) }))}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors outline-none ${
                    local.maxDistanceKm === String(d)
                      ? 'bg-rural-green-800 text-cream-50 border-rural-green-900'
                      : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
                  }`}
                >
                  ≤ {d} km
                </button>
              ))}
            </div>
          </div>

          {/* Location / Area Filter */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-earth-500 mb-3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rural-green-800" />
              {t('home.locationFilter')}
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder={t('home.locationFilterPlaceholder')}
                value={local.location}
                onChange={(e) => setLocal((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm font-medium text-earth-950 transition-colors pr-8"
              />
              {local.location && (
                <button
                  type="button"
                  onClick={() => setLocal((p) => ({ ...p, location: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-earth-500 mb-3">
              💰 {t('home.priceFilter')}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-earth-500 font-bold mb-1 block">{t('home.minPrice')}</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={local.minPrice}
                  onChange={(e) => setLocal((p) => ({ ...p, minPrice: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm font-medium text-earth-950 transition-colors"
                />
              </div>
              <span className="text-earth-400 font-bold mt-4">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-earth-500 font-bold mb-1 block">{t('home.maxPrice')}</label>
                <input
                  type="number"
                  min={0}
                  placeholder="10000"
                  value={local.maxPrice}
                  onChange={(e) => setLocal((p) => ({ ...p, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none text-sm font-medium text-earth-950 transition-colors"
                />
              </div>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500, 1000, 2000, 5000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLocal((p) => ({ ...p, maxPrice: String(v) }))}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors outline-none ${
                    local.maxPrice === String(v)
                      ? 'bg-rural-green-800 text-cream-50 border-rural-green-900'
                      : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
                  }`}
                >
                  ≤ ₹{v}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-earth-500 mb-3">
              ⭐ {t('home.ratingFilter')}
            </p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => {
                const isActive = local.minRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLocal((p) => ({ ...p, minRating: opt.value }))}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-bold text-xs transition-all outline-none ${
                      isActive
                        ? 'bg-harvest-gold-dark text-cream-50 border-harvest-gold'
                        : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
                    }`}
                  >
                    {opt.value > 0 && <Star className={`w-3 h-3 ${isActive ? 'fill-cream-50' : 'fill-harvest-gold-dark text-harvest-gold-dark'}`} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-3 bg-cream-100 border border-cream-800 text-earth-700 font-bold rounded-xl text-sm active:scale-95 transition-transform outline-none"
            >
              {t('home.clearFilters')}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl text-sm active:scale-95 transition-transform outline-none shadow-sm"
            >
              {t('home.applyFilters')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Home Component ────────────────────────────────────────────────────────

const Home: React.FC = () => {
  const {
    appMode,
    user,
    listings,
    fetchListings,
    fetchMyListings,
    addListing,
    updateListing,
    deleteListing,
    fetchMyRequests,
    fetchIncomingRequests,
    viewedListingIds,
    addViewedListing,
    providerTab,
    setProviderTab,
  } = useStore();
  const { t } = useTranslation();

  // Provider form control states
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Consumer state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [consumerTab, setConsumerTab] = useState<'discover' | 'bookings'>('discover');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);

  const hasActiveFilters =
    appliedFilters.minPrice !== '' ||
    appliedFilters.maxPrice !== '' ||
    appliedFilters.minRating > 0 ||
    appliedFilters.location.trim() !== '' ||
    appliedFilters.maxDistanceKm !== '';

  // Fetch listings based on mode & tab
  useEffect(() => {
    if (appMode === 'consumer') {
      if (consumerTab === 'discover') {
        setIsLoading(true);
        fetchListings().finally(() => setIsLoading(false));
      } else if (consumerTab === 'bookings') {
        fetchMyRequests();
      }
    } else {
      if (providerTab === 'listings') {
        fetchMyListings();
      } else if (providerTab === 'requests') {
        fetchIncomingRequests();
      }
      // 'analytics' tab: no extra fetch needed — ProviderAnalytics fetches its own data
    }
  }, [appMode, consumerTab, providerTab, fetchListings, fetchMyListings, fetchMyRequests, fetchIncomingRequests]);

  // ── All active listings ──────────────────────────────────────────────────────
  const allActive = useMemo(() => listings.filter((l) => l.status === 'active'), [listings]);

  // ── Apply search + category + price/rating filters ───────────────────────────
  const filteredListings = useMemo(() => {
    let results = allActive;

    // Category filter
    if (activeFilter !== 'all') {
      results = results.filter((l) => l.type === activeFilter);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }

    // Price filter
    const minP = appliedFilters.minPrice !== '' ? parseFloat(appliedFilters.minPrice) : null;
    const maxP = appliedFilters.maxPrice !== '' ? parseFloat(appliedFilters.maxPrice) : null;
    if (minP !== null) results = results.filter((l) => l.price >= minP);
    if (maxP !== null) results = results.filter((l) => l.price <= maxP);

    // Rating filter
    if (appliedFilters.minRating > 0) {
      results = results.filter(
        (l) => l.averageRating != null && (l.averageRating as number) >= appliedFilters.minRating
      );
    }

    // Location text filter
    if (appliedFilters.location.trim()) {
      const locQ = appliedFilters.location.trim().toLowerCase();
      results = results.filter((l) => l.location.toLowerCase().includes(locQ));
    }

    // Numeric Distance filter (in km)
    if (appliedFilters.maxDistanceKm !== '') {
      const maxDist = parseFloat(appliedFilters.maxDistanceKm);
      if (!isNaN(maxDist)) {
        results = results.filter(
          (l) => getListingDistanceKm(l, user?.village, user?.state) <= maxDist
        );
      }
    }

    return results;
  }, [allActive, activeFilter, searchQuery, appliedFilters]);

  // ── Nearby resources: match user village or state ────────────────────────────
  const nearbyListings = useMemo(() => {
    const village = user?.village?.toLowerCase().trim() || '';
    const state   = user?.state?.toLowerCase().trim()   || '';
    if (!village && !state) return allActive.slice(0, 6);
    return allActive
      .filter((l) => {
        const loc = l.location.toLowerCase();
        return (village && loc.includes(village)) || (state && loc.includes(state));
      })
      .slice(0, 6);
  }, [allActive, user]);

  // ── Available Now: top 6 active, newest first ────────────────────────────────
  const availableNow = useMemo(() => allActive.slice(0, 6), [allActive]);

  // ── Recommended: highest-rated listings not in recently viewed ───────────────
  const recommended = useMemo(() => {
    const viewedSet = new Set(viewedListingIds);
    return allActive
      .filter((l) => !viewedSet.has(l.id) && l.averageRating != null)
      .sort((a, b) => ((b.averageRating ?? 0) - (a.averageRating ?? 0)))
      .slice(0, 6);
  }, [allActive, viewedListingIds]);

  // ── Recently Viewed: match viewed IDs to current listings ───────────────────
  const recentlyViewedListings = useMemo(() => {
    if (!viewedListingIds.length) return [];
    const listingMap = new Map(allActive.map((l) => [l.id, l]));
    return viewedListingIds
      .map((id) => listingMap.get(id))
      .filter(Boolean) as Listing[];
  }, [viewedListingIds, allActive]);

  // ── Provider listings ────────────────────────────────────────────────────────
  const myProviderListings = user ? listings.filter((l) => l.providerId === user.id) : [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleTapListing = (listing: Listing) => {
    addViewedListing(listing.id);
    setSelectedListing(listing);
  };

  const handleCategoryClick = (cat: FilterCategory) => {
    setActiveFilter(cat);
    setSearchQuery('');
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleSaveListing = async (listingData: Omit<Listing, 'id' | 'providerId'> & { id?: string }) => {
    if (!user) return;
    try {
      const { id, ...dataToSave } = listingData;
      if (id) {
        await updateListing(id, dataToSave);
      } else {
        await addListing(dataToSave);
      }
      setShowForm(false);
      setEditingListing(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save listing');
    }
  };

  const handleEditClick = (listing: Listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteListing(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  // ── Helper: is there an active search or category or filter? ─────────────────
  const isSearchMode = searchQuery.trim() !== '' || activeFilter !== 'all' || hasActiveFilters;

  // ═══════════════════════════════════════════════════════════
  // 1. RENDER CONSUMER MODE
  // ═══════════════════════════════════════════════════════════
  if (appMode === 'consumer') {
    return (
      <div className="flex-1 flex flex-col py-3 relative">

        {/* Welcome Header */}
        <div className="px-4 mb-3">
          <h1 className="text-2xl font-extrabold text-earth-900 tracking-tight">
            🌾 {user?.name.split(' ')[0] || 'Namaste'}
          </h1>
          <p className="text-xs text-earth-550 font-medium">
            {t('searchPage.subheading')}
          </p>
        </div>

        {/* Tab Switcher: Discover / My Bookings */}
        <div className="flex gap-2 px-4 mb-3">
          <button
            onClick={() => setConsumerTab('discover')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition-all outline-none ${
              consumerTab === 'discover'
                ? 'bg-rural-green-800 text-cream-50 shadow-sm'
                : 'bg-cream-100 text-earth-600 border border-cream-800'
            }`}
          >
            🔍 {t('home.discoverTab')}
          </button>
          <button
            onClick={() => setConsumerTab('bookings')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition-all outline-none ${
              consumerTab === 'bookings'
                ? 'bg-rural-green-800 text-cream-50 shadow-sm'
                : 'bg-cream-100 text-earth-600 border border-cream-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            {t('home.bookingsTab')}
          </button>
        </div>

        {/* ── Discover Tab ─────────────────────────────────── */}
        {consumerTab === 'discover' && (
          <>
            {/* Search Bar + Filter Button Row */}
            <div className="flex items-start gap-2 pr-4">
              <div className="flex-1">
                {/* SearchBar — NOT MODIFIED, voice search untouched */}
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              {/* Filter Button */}
              <button
                onClick={() => setShowFilterPanel(true)}
                type="button"
                className={`mt-0 flex-shrink-0 flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl border-2 transition-all outline-none active:scale-90 ${
                  hasActiveFilters
                    ? 'bg-rural-green-800 text-cream-50 border-rural-green-900 shadow-sm'
                    : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
                }`}
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="text-[8px] font-extrabold leading-none">ON</span>
                )}
              </button>
            </div>

            {/* Active filters badge */}
            {hasActiveFilters && (
              <div className="mx-4 mb-2 flex items-center justify-between px-3 py-1.5 bg-rural-green-50 border border-rural-green-200 rounded-xl">
                <span className="text-[11px] font-bold text-rural-green-800">
                  🎛 {t('home.filtersActive')}
                  {appliedFilters.maxDistanceKm ? ` · 📏 ≤ ${appliedFilters.maxDistanceKm} km` : ''}
                  {appliedFilters.location ? ` · 📍 ${appliedFilters.location}` : ''}
                  {appliedFilters.maxPrice ? ` · ≤ ₹${appliedFilters.maxPrice}` : ''}
                  {appliedFilters.minPrice ? ` · ≥ ₹${appliedFilters.minPrice}` : ''}
                  {appliedFilters.minRating > 0 ? ` · ${appliedFilters.minRating}+ ⭐` : ''}
                </span>
                <button
                  onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
                  type="button"
                  className="p-0.5 rounded-full text-rural-green-700 hover:bg-rural-green-200 transition-colors outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-rural-green-700 animate-spin" />
                <span className="ml-2 text-sm text-earth-500 font-medium">{t('home.loading')}</span>
              </div>
            )}

            {/* ── SEARCH MODE: show flat filtered results ── */}
            {!isLoading && isSearchMode && (
              <>
                {/* Active Category Back Bar — allows user to go back to categories */}
                {activeFilter !== 'all' && (
                  <div className="mx-4 mb-3 flex items-center justify-between bg-rural-green-50 border border-rural-green-200 rounded-2xl px-3.5 py-2.5 shadow-xs">
                    <button
                      onClick={() => setActiveFilter('all')}
                      type="button"
                      className="flex items-center gap-1.5 text-xs font-extrabold text-rural-green-800 bg-cream-50 border border-rural-green-300 hover:bg-cream-100 px-3 py-1.5 rounded-xl transition-all active:scale-95 outline-none shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                      {t('home.backToCategories')}
                    </button>
                    <span className="text-xs font-extrabold text-earth-800 bg-cream-50/80 border border-cream-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 select-none">
                      {CATEGORY_CARDS.find((c) => c.key === activeFilter)?.emoji} {t(CATEGORY_CARDS.find((c) => c.key === activeFilter)?.labelKey as any)}
                    </span>
                  </div>
                )}

                <div className="px-5 mb-2">
                  <span className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">
                    {filteredListings.length} {t('common.available')}
                  </span>
                </div>

                {filteredListings.length > 0 ? (
                  <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
                    {filteredListings.map((listing) => (
                      <ConsumerListingCard
                        key={listing.id}
                        listing={listing}
                        onTap={handleTapListing}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center">
                    <FriendlyEmptyState
                      iconName="SearchX"
                      title={t('common.noResults')}
                      description={
                        searchQuery
                          ? `"${searchQuery}" — ${t('common.noResultsDesc')}`
                          : t('common.noResultsDesc')
                      }
                      actionText={t('searchPage.resetFilters')}
                      onAction={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                        setAppliedFilters(DEFAULT_FILTERS);
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* ── DISCOVERY MODE: sections view ── */}
            {!isLoading && !isSearchMode && (
              <div className="flex-1 overflow-y-auto pb-6 space-y-6">

                {/* ── Category Cards ── */}
                <div>
                  <SectionHeader title={t('home.categories')} />
                  <div className="px-4">
                    <div className="grid grid-cols-5 gap-2">
                      {CATEGORY_CARDS.map((cat) => {
                        const { Icon } = cat;
                        const isActive = activeFilter === cat.key;
                        return (
                          <button
                            key={cat.key}
                            onClick={() => handleCategoryClick(cat.key)}
                            type="button"
                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all outline-none active:scale-90 ${
                              isActive
                                ? 'border-rural-green-700 bg-rural-green-50 shadow-sm'
                                : 'border-cream-800 bg-cream-50 hover:bg-cream-100'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.iconBg} ${cat.iconText}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[9px] font-extrabold text-center leading-tight ${isActive ? 'text-rural-green-800' : 'text-earth-700'}`}>
                              {t(cat.labelKey as any)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Nearby Resources ── */}
                <div>
                  <SectionHeader
                    title={t('home.nearbyResources')}
                    onViewAll={nearbyListings.length > 0 ? () => { setActiveFilter('all'); } : undefined}
                    viewAllLabel={t('home.viewAll')}
                  />
                  {nearbyListings.length > 0 ? (
                    <div className="px-4 space-y-3">
                      {nearbyListings.map((listing) => (
                        <ConsumerListingCard
                          key={listing.id}
                          listing={listing}
                          onTap={handleTapListing}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mx-4 py-4 px-4 bg-cream-100 rounded-2xl text-center">
                      <p className="text-xs text-earth-500 font-medium">📍 {t('home.noNearby')}</p>
                    </div>
                  )}
                </div>

                {/* ── Available Now ── */}
                <div>
                  <SectionHeader title={t('home.availableNow')} />
                  {availableNow.length > 0 ? (
                    <div className="px-4 space-y-3">
                      {availableNow.map((listing) => (
                        <ConsumerListingCard
                          key={listing.id}
                          listing={listing}
                          onTap={handleTapListing}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mx-4 py-4 px-4 bg-cream-100 rounded-2xl text-center">
                      <p className="text-xs text-earth-500 font-medium">🌿 {t('common.noResults')}</p>
                    </div>
                  )}
                </div>

                {/* ── Recommended ── */}
                {recommended.length > 0 && (
                  <div>
                    <SectionHeader title={t('home.recommended')} />
                    <div className="px-4 space-y-3">
                      {recommended.map((listing) => (
                        <ConsumerListingCard
                          key={listing.id}
                          listing={listing}
                          onTap={handleTapListing}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Recently Viewed ── */}
                {recentlyViewedListings.length > 0 && (
                  <div>
                    <SectionHeader title={t('home.recentlyViewed')} />
                    <div className="px-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {recentlyViewedListings.map((listing) => (
                        <MiniListingCard key={listing.id} listing={listing} onTap={handleTapListing} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No listings at all — empty state */}
                {allActive.length === 0 && (
                  <div className="flex-1 flex flex-col justify-center px-4">
                    <FriendlyEmptyState
                      iconName="SearchX"
                      title={t('common.noResults')}
                      description={t('common.noResultsDesc')}
                      actionText={t('searchPage.resetFilters')}
                      onAction={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                        setAppliedFilters(DEFAULT_FILTERS);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── My Bookings Tab ── */}
        {consumerTab === 'bookings' && (
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <MyBookings />
          </div>
        )}

        {/* Listing Detail Overlay */}
        {selectedListing && (
          <ListingDetail
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}

        {/* Filter Panel */}
        {showFilterPanel && (
          <FilterPanel
            filters={appliedFilters}
            onApply={(f) => { setAppliedFilters(f); }}
            onClose={() => setShowFilterPanel(false)}
          />
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 2. RENDER PROVIDER MODE (unchanged layout from before)
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex-1 flex flex-col py-4 relative">

      {/* Provider Header */}
      <div className="flex items-center justify-between mx-4 mb-3">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-earth-900 tracking-tight">Provider Dashboard</h1>
          <p className="text-xs text-earth-550">{t('home.noListingsDesc')}</p>
        </div>

        {providerTab === 'listings' && myProviderListings.length > 0 && (
          <button
            onClick={() => {
              setEditingListing(null);
              setShowForm(true);
            }}
            type="button"
            className="flex items-center gap-1 px-3.5 py-2 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-xl shadow-sm text-xs active:scale-95 transition-transform outline-none"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {t('home.addListing')}
          </button>
        )}
      </div>

      {/* Provider Tab Switcher */}
      {providerTab !== 'analytics' && (
        <div className="flex gap-2 px-4 mb-4">
          <button
            onClick={() => setProviderTab('listings')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition-all outline-none ${
              providerTab === 'listings'
                ? 'bg-rural-green-800 text-cream-50 shadow-sm'
                : 'bg-cream-100 text-earth-600 border border-cream-800'
            }`}
          >
            🚜 {t('home.listingsTab')}
          </button>
          <button
            onClick={() => setProviderTab('requests')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition-all outline-none ${
              providerTab === 'requests'
                ? 'bg-rural-green-800 text-cream-50 shadow-sm'
                : 'bg-cream-100 text-earth-600 border border-cream-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            {t('home.requestsTab')}
          </button>
        </div>
      )}

      {/* ── My Listings Tab ── */}
      {providerTab === 'listings' && (
        myProviderListings.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <FriendlyEmptyState
              iconName="Tractor"
              title={t('home.noListings')}
              description={t('home.noListingsDesc')}
              actionText={t('home.createFirstListing')}
              onAction={() => {
                setEditingListing(null);
                setShowForm(true);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-24">
            {myProviderListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )
      )}

      {/* ── Incoming Requests Tab ── */}
      {providerTab === 'requests' && (
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <IncomingRequests />
        </div>
      )}

      {/* ── My Analytics Tab ── */}
      {providerTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto pb-6">
          <ProviderAnalytics showForecasting showIdleStats />
        </div>
      )}

      {/* FAB */}
      {providerTab === 'listings' && myProviderListings.length > 0 && (
        <button
          onClick={() => {
            setEditingListing(null);
            setShowForm(true);
          }}
          type="button"
          className="absolute bottom-4 right-4 z-20 w-14 h-14 bg-rural-green-800 text-cream-50 rounded-full flex items-center justify-center shadow-xl hover:bg-rural-green-900 active:scale-90 transition-transform outline-none border-2 border-cream-950"
          aria-label="Add Listing FAB"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {showForm && (
        <ListingForm
          initialListing={editingListing}
          onSave={handleSaveListing}
          onClose={() => {
            setShowForm(false);
            setEditingListing(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;

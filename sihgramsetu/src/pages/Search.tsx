import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { ConsumerListingCard } from '../components/ConsumerListingCard';
import { ListingDetail } from '../components/ListingDetail';
import { FriendlyEmptyState } from '../components/FriendlyEmptyState';
import { MapPin, Search as SearchIcon, X } from 'lucide-react';
import type { Listing } from '../store/useStore';
import type { FilterCategory } from '../components/FilterChips';
import { useTranslation } from '../locales/useTranslation';

export const Search: React.FC = () => {
  const { listings, fetchListings } = useStore();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [locationInput, setLocationInput] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      fetchListings({
        q: query,
        type: activeFilter !== 'all' ? activeFilter : undefined,
        location: locationInput,
      }).finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilter, locationInput, fetchListings]);

  return (
    <div className="flex-1 flex flex-col py-4 select-none pb-20">
      
      {/* Page Header */}
      <div className="px-4 mb-3 text-left">
        <h1 className="text-xl font-black text-earth-950 flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-rural-green-800" />
          {t('searchPage.heading')}
        </h1>
        <p className="text-xs text-earth-600 font-medium">
          {t('searchPage.subheading')}
        </p>
      </div>

      {/* Main Search Bar with Voice */}
      <SearchBar value={query} onChange={setQuery} />

      {/* Category Filter Chips */}
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Location Filter Row */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 bg-cream-50 border border-cream-800 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-earth-500 shrink-0" />
          <input
            type="text"
            placeholder={t('searchPage.locationPlaceholder')}
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full bg-transparent text-xs font-medium text-earth-900 placeholder-earth-400 outline-none"
          />
          {locationInput && (
            <button
              onClick={() => setLocationInput('')}
              type="button"
              className="p-1 text-earth-400 hover:text-earth-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <span className="text-xs font-extrabold text-earth-500 uppercase tracking-wider">
          {isLoading ? t('searchPage.searching') : `${listings.length} ${t('searchPage.results')}`}
        </span>
        {(query || activeFilter !== 'all' || locationInput) && (
          <button
            onClick={() => {
              setQuery('');
              setActiveFilter('all');
              setLocationInput('');
            }}
            type="button"
            className="text-xs font-bold text-harvest-orange-dark hover:underline"
          >
            {t('searchPage.resetFilters')}
          </button>
        )}
      </div>

      {/* Results */}
      <div className="px-4 space-y-3">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <ConsumerListingCard
              key={listing.id}
              listing={listing}
              onTap={(l) => setSelectedListing(l)}
            />
          ))
        ) : (
          <FriendlyEmptyState
            iconName="Search"
            title={t('searchPage.noResults')}
            description={t('searchPage.noResultsDesc')}
            actionText={t('searchPage.showAll')}
            onAction={() => {
              setQuery('');
              setActiveFilter('all');
              setLocationInput('');
            }}
          />
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

    </div>
  );
};

export default Search;

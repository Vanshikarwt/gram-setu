import React from 'react';
import { useTranslation } from '../locales/useTranslation';

export type FilterCategory = 'all' | 'machinery' | 'labor' | 'crop_residue' | 'storage' | 'agri_product';

interface FilterChipsProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ activeFilter, onFilterChange }) => {
  const { t } = useTranslation();

  const FILTERS: { key: FilterCategory; translationKey: string; emoji: string }[] = [
    { key: 'all', translationKey: 'filters.all', emoji: '🌾' },
    { key: 'machinery', translationKey: 'filters.machinery', emoji: '🚜' },
    { key: 'labor', translationKey: 'filters.labor', emoji: '👷' },
    { key: 'crop_residue', translationKey: 'filters.cropResidue', emoji: '🌿' },
    { key: 'storage', translationKey: 'filters.storage', emoji: '🏪' },
    { key: 'agri_product', translationKey: 'filters.agriProduct', emoji: '🛒' },
  ];

  return (
    <div className="px-4 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all duration-150 border outline-none active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-rural-green-800 text-cream-50 border-rural-green-900 shadow-sm'
                  : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
              }`}
            >
              <span className="text-sm">{filter.emoji}</span>
              {t(filter.translationKey as any)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

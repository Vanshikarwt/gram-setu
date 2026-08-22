import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BazaarPostCard } from '../components/BazaarPostCard';
import { BazaarPostForm } from '../components/BazaarPostForm';
import { FriendlyEmptyState } from '../components/FriendlyEmptyState';
import { Plus } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

type BazaarFilter = 'all' | 'need' | 'offer';

const Bazaar: React.FC = () => {
  const { bazaarPosts, fetchBazaarPosts } = useStore();
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState<BazaarFilter>('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBazaarPosts();
  }, [fetchBazaarPosts]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return bazaarPosts;
    return bazaarPosts.filter((p) => p.type === activeFilter);
  }, [bazaarPosts, activeFilter]);

  const FILTER_CHIPS: { key: BazaarFilter; label: string; emoji: string }[] = [
    { key: 'all', label: t('bazaar.filterAll'), emoji: '📋' },
    { key: 'need', label: t('bazaar.filterNeed'), emoji: '🤲' },
    { key: 'offer', label: t('bazaar.filterOffer'), emoji: '🎁' },
  ];

  return (
    <div className="flex-1 flex flex-col py-3 relative">
      
      {/* Header */}
      <div className="px-4 mb-3">
        <h1 className="text-2xl font-extrabold text-earth-900 tracking-tight">
          {t('bazaar.heading')}
        </h1>
        <p className="text-xs text-earth-550 font-medium">
          {t('bazaar.subheading')}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all duration-150 border outline-none active:scale-95 shrink-0 ${
                  isActive
                    ? chip.key === 'need'
                      ? 'bg-harvest-orange text-cream-50 border-harvest-orange-dark shadow-sm'
                      : chip.key === 'offer'
                        ? 'bg-rural-green-800 text-cream-50 border-rural-green-900 shadow-sm'
                        : 'bg-earth-800 text-cream-50 border-earth-900 shadow-sm'
                    : 'bg-cream-50 text-earth-700 border-cream-800 hover:bg-cream-100'
                }`}
              >
                <span className="text-sm">{chip.emoji}</span>
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="px-5 mb-2">
        <span className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">
          {filteredPosts.length} {t('bazaar.posts')}
        </span>
      </div>

      {/* Feed or Empty State */}
      {filteredPosts.length > 0 ? (
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          {filteredPosts.map((post) => (
            <BazaarPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <FriendlyEmptyState
            iconName="Megaphone"
            title={t('bazaar.noPostsTitle')}
            description={t('bazaar.noPostsDesc')}
            actionText={t('bazaar.createFirst')}
            onAction={() => setShowForm(true)}
          />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        type="button"
        className="absolute bottom-4 right-4 z-20 w-14 h-14 bg-rural-green-800 text-cream-50 rounded-full flex items-center justify-center shadow-xl hover:bg-rural-green-900 active:scale-90 transition-transform outline-none border-2 border-cream-950"
        aria-label="Create new bazaar post"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Create Post Form */}
      {showForm && (
        <BazaarPostForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Bazaar;

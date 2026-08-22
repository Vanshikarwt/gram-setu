import React from 'react';
import { IndianRupee, Briefcase, ListChecks, TrendingUp, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getDemandForecasts } from '../utils/aiInsights';
import { useTranslation } from '../locales/useTranslation';

export const ProviderAnalytics: React.FC = () => {
  const { user, transactions, bookings, listings, fetchProviderAnalytics } = useStore();
  const { t } = useTranslation();
  const [apiMetrics, setApiMetrics] = React.useState<{ totalRevenue: number; jobsCompleted: number; activeListingsCount: number } | null>(null);

  React.useEffect(() => {
    fetchProviderAnalytics().then((data) => {
      if (data) setApiMetrics(data);
    });
  }, [fetchProviderAnalytics]);

  if (!user) return null;

  // ── Calculate metrics for this provider ──────────────────────────────────
  const myListingIds = listings
    .filter((l) => l.providerId === user.id)
    .map((l) => l.id);

  // Revenue = sum of all successful transactions for this provider
  const totalRevenue = apiMetrics?.totalRevenue ?? transactions
    .filter((t) => t.providerId === user.id && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  // Jobs completed
  const jobsCompleted = apiMetrics?.jobsCompleted ?? bookings.filter(
    (b) => myListingIds.includes(b.listingId) && b.status === 'completed'
  ).length;

  // Active listings count
  const activeListings = apiMetrics?.activeListingsCount ?? listings.filter(
    (l) => l.providerId === user.id && l.status === 'active'
  ).length;

  // Pending requests
  const pendingRequests = bookings.filter(
    (b) => myListingIds.includes(b.listingId) && b.status === 'pending'
  ).length;

  const isEmpty = totalRevenue === 0 && jobsCompleted === 0;
  const forecasts = getDemandForecasts();

  return (
    <div className="mx-4 mb-4 space-y-4">
      {/* Analytics header */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-rural-green-700" />
        <span className="text-xs font-extrabold uppercase tracking-widest text-earth-600">
          {t('analytics.heading')}
        </span>
      </div>

      {isEmpty ? (
        <div className="bg-cream-100 border border-cream-800 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-xs font-bold text-earth-600">
            {t('analytics.emptyTitle')}
          </p>
          <p className="text-[10px] text-earth-400 mt-0.5">
            {t('analytics.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Revenue — prominent */}
          <div className="col-span-2 bg-gradient-to-br from-rural-green-800 to-rural-green-700 rounded-2xl p-4 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 bg-cream-50/20 rounded-xl flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6 text-cream-50" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-cream-50/70 uppercase tracking-widest mb-0.5">
                {t('analytics.revenue')}
              </p>
              <p className="text-3xl font-extrabold text-cream-50 leading-none">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Jobs Completed */}
          <div className="bg-cream-50 border border-cream-800 rounded-2xl p-3.5 flex flex-col gap-1">
            <div className="w-9 h-9 bg-rural-green-100 rounded-xl flex items-center justify-center mb-1">
              <Briefcase className="w-5 h-5 text-rural-green-800" />
            </div>
            <p className="text-2xl font-extrabold text-earth-900">{jobsCompleted}</p>
            <p className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider leading-tight">
              {t('analytics.jobsCompleted')}
            </p>
          </div>

          {/* Active Listings */}
          <div className="bg-cream-50 border border-cream-800 rounded-2xl p-3.5 flex flex-col gap-1">
            <div className="w-9 h-9 bg-harvest-gold/20 rounded-xl flex items-center justify-center mb-1">
              <ListChecks className="w-5 h-5 text-harvest-gold-dark" />
            </div>
            <p className="text-2xl font-extrabold text-earth-900">{activeListings}</p>
            <p className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider leading-tight">
              {t('analytics.activeListings')}
            </p>
          </div>

          {/* Pending requests strip (only if any) */}
          {pendingRequests > 0 && (
            <div className="col-span-2 flex items-center justify-between bg-harvest-gold/10 border border-harvest-gold/30 rounded-xl px-4 py-2.5">
              <p className="text-xs font-bold text-harvest-gold-dark">
                ⏳ {pendingRequests} {t('analytics.pendingRequests')}
              </p>
              <p className="text-[10px] text-earth-500 font-semibold">{t('analytics.pendingTap')}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Upcoming Demand Forecasting Widget ───────────────────────────── */}
      <div className="bg-cream-50 border border-cream-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-harvest-gold-dark" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-earth-900">
              {t('analytics.forecastHeading')}
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-harvest-gold/15 text-harvest-gold-dark border border-harvest-gold/30">
            {t('analytics.forecastBadge')}
          </span>
        </div>

        <div className="space-y-3">
          {forecasts.map((item) => (
            <div key={item.id} className="bg-cream-100/70 border border-cream-800/60 rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-earth-900">{item.category}</span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                  {item.demandLevel} Demand
                </span>
              </div>
              <p className="text-[10px] text-earth-500 font-medium mb-2">{item.season} • {item.trendText}</p>
              
              {/* CSS Progress Bar */}
              <div className="w-full bg-cream-300/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rural-green-600 to-harvest-gold h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


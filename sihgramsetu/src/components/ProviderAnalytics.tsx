import React from 'react';
import { IndianRupee, Briefcase, ListChecks, TrendingUp, Sparkles, CalendarDays, Clock, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getDemandForecasts } from '../utils/aiInsights';
import { useTranslation } from '../locales/useTranslation';
import { api } from '../utils/api';

interface ListingIdleStat {
  listingId: string;
  listingTitle: string;
  listingType: string;
  availableDates: string[];
  bookedDates: string[];
  idleDates: string[];
  totalAvailable: number;
  totalBooked: number;
  totalIdle: number;
  utilizationPct: number;
}

interface ProviderAnalyticsProps {
  /** When false, the Demand Forecasting widget is hidden. Defaults to true. */
  showForecasting?: boolean;
  /** When true, the Machine Idle Stats section is shown. Defaults to false. */
  showIdleStats?: boolean;
}

export const ProviderAnalytics: React.FC<ProviderAnalyticsProps> = ({
  showForecasting = true,
  showIdleStats = false,
}) => {
  const { user, transactions, bookings, listings, fetchProviderAnalytics } = useStore();
  const { t } = useTranslation();
  const [apiMetrics, setApiMetrics] = React.useState<{ totalRevenue: number; jobsCompleted: number; activeListingsCount: number } | null>(null);
  const [idleStats, setIdleStats] = React.useState<ListingIdleStat[]>([]);
  const [idleLoading, setIdleLoading] = React.useState(false);

  React.useEffect(() => {
    fetchProviderAnalytics().then((data) => {
      if (data) setApiMetrics(data);
    });
  }, [fetchProviderAnalytics]);

  React.useEffect(() => {
    if (!showIdleStats) return;
    setIdleLoading(true);
    api.get('/analytics/provider/idle-stats')
      .then((res) => {
        if (res.listingStats) setIdleStats(res.listingStats);
      })
      .catch((err) => console.error('Failed to load idle stats:', err))
      .finally(() => setIdleLoading(false));
  }, [showIdleStats]);

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

  const isEmpty = totalRevenue === 0 && jobsCompleted === 0;
  const forecasts = getDemandForecasts();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

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
        </div>
      )}

      {/* ── Machine Utilization & Idle Stats ─────────────────────────────── */}
      {showIdleStats && (
        <div className="bg-cream-50 border border-cream-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-rural-green-700" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-earth-900">
                Machine Utilization & Idle Days
              </h3>
            </div>
          </div>

          {idleLoading ? (
            <div className="py-6 text-center">
              <p className="text-xs text-earth-400 font-semibold animate-pulse">Loading machine data…</p>
            </div>
          ) : idleStats.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-2xl mb-1">🚜</p>
              <p className="text-xs font-bold text-earth-600">No availability data yet.</p>
              <p className="text-[10px] text-earth-400 mt-0.5">
                Set availability dates on your listings to track utilization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {idleStats
                .filter((ls) => ls.totalAvailable > 0)
                .map((ls) => (
                  <div key={ls.listingId} className="bg-cream-100/70 border border-cream-800/60 rounded-2xl p-3.5 space-y-3">
                    {/* Listing title & type */}
                    <div>
                      <p className="text-xs font-extrabold text-earth-900 truncate">{ls.listingTitle}</p>
                      <p className="text-[10px] text-earth-500 font-semibold capitalize">{ls.listingType.replace('_', ' ')}</p>
                    </div>

                    {/* Summary Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-cream-50 rounded-xl p-2 border border-cream-800">
                        <CalendarDays className="w-3.5 h-3.5 mx-auto text-earth-500 mb-0.5" />
                        <p className="text-sm font-extrabold text-earth-900">{ls.totalAvailable}</p>
                        <p className="text-[9px] text-earth-400 font-semibold">Available</p>
                      </div>
                      <div className="bg-rural-green-50 rounded-xl p-2 border border-rural-green-200">
                        <Clock className="w-3.5 h-3.5 mx-auto text-rural-green-700 mb-0.5" />
                        <p className="text-sm font-extrabold text-rural-green-800">{ls.totalBooked}</p>
                        <p className="text-[9px] text-rural-green-700 font-semibold">Booked</p>
                      </div>
                      <div className="bg-harvest-gold/10 rounded-xl p-2 border border-harvest-gold/30">
                        <CalendarDays className="w-3.5 h-3.5 mx-auto text-harvest-gold-dark mb-0.5" />
                        <p className="text-sm font-extrabold text-harvest-gold-dark">{ls.totalIdle}</p>
                        <p className="text-[9px] text-harvest-gold-dark font-semibold">Idle</p>
                      </div>
                    </div>

                    {/* Utilization bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider">Utilization</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ls.utilizationPct >= 70
                            ? 'bg-rural-green-100 text-rural-green-800'
                            : ls.utilizationPct >= 40
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-harvest-gold/15 text-harvest-gold-dark'
                        }`}>
                          {ls.utilizationPct}%
                        </span>
                      </div>
                      <div className="w-full bg-cream-300/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            ls.utilizationPct >= 70
                              ? 'bg-gradient-to-r from-rural-green-600 to-rural-green-400'
                              : ls.utilizationPct >= 40
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                              : 'bg-gradient-to-r from-harvest-gold to-harvest-gold-dark'
                          }`}
                          style={{ width: `${ls.utilizationPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Idle dates list */}
                    {ls.idleDates.length > 0 && (
                      <div>
                        <p className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider mb-1.5">
                          Idle Dates ({ls.idleDates.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ls.idleDates.slice(0, 12).map((d) => (
                            <span
                              key={d}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-harvest-gold/15 text-harvest-gold-dark border border-harvest-gold/30"
                            >
                              {formatDate(d)}
                            </span>
                          ))}
                          {ls.idleDates.length > 12 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-200 text-earth-500 border border-cream-800">
                              +{ls.idleDates.length - 12} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* Listings with no availability set */}
              {idleStats.filter((ls) => ls.totalAvailable === 0).length > 0 && (
                <div className="bg-cream-100/60 border border-cream-800/40 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-semibold text-earth-400">
                    {idleStats.filter((ls) => ls.totalAvailable === 0).length} listing(s) have no availability dates set.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Upcoming Demand Forecasting Widget ───────────────────────────── */}
      {showForecasting && (
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
      )}
    </div>
  );
};

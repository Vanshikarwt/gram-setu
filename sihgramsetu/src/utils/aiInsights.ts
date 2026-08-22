import type { Booking } from '../store/useStore';

export interface DemandForecast {
  id: string;
  category: string;
  season: string;
  demandLevel: 'High' | 'Very High' | 'Moderate';
  percentage: number;
  badgeColor: string;
  trendText: string;
}

/**
 * Generate a smart AI price suggestion based on title, resource type, and billing unit
 */
export function generatePriceSuggestion(
  type: 'machinery' | 'labor',
  unit: 'per hour' | 'per day',
  title: string
): { price: number; reason: string } {
  const lowerTitle = title.toLowerCase();

  let basePrice = 500;

  if (type === 'machinery') {
    if (lowerTitle.includes('harvester') || lowerTitle.includes('कंबाइन')) {
      basePrice = unit === 'per hour' ? 1800 : 12000;
    } else if (lowerTitle.includes('tractor') || lowerTitle.includes('ट्रैक्टर')) {
      basePrice = unit === 'per hour' ? 650 : 4500;
    } else if (lowerTitle.includes('rotavator') || lowerTitle.includes('रोटावेटर')) {
      basePrice = unit === 'per hour' ? 450 : 3200;
    } else if (lowerTitle.includes('pump') || lowerTitle.includes('पंप')) {
      basePrice = unit === 'per hour' ? 250 : 1500;
    } else {
      basePrice = unit === 'per hour' ? 550 : 3800;
    }
  } else {
    // Labor
    if (lowerTitle.includes('harvest') || lowerTitle.includes('कटाई')) {
      basePrice = unit === 'per hour' ? 80 : 450;
    } else if (lowerTitle.includes('sow') || lowerTitle.includes('रोपाई')) {
      basePrice = unit === 'per hour' ? 70 : 400;
    } else {
      basePrice = unit === 'per hour' ? 60 : 350;
    }
  }

  // Slight realistic variation (+/- 10%)
  const variation = (Math.floor(Math.random() * 5) - 2) * 10;
  const suggestedPrice = Math.max(50, basePrice + variation);

  const reason = `✨ Suggested based on local ${type === 'machinery' ? 'equipment' : 'labor'} demand & seasonal trends in your region`;

  return { price: suggestedPrice, reason };
}

/**
 * Calculate Utilization Score & Idle Days for a specific listing
 */
export function calculateUtilization(listingId: string, bookings: Booking[]): {
  score: number;
  idleDays: number;
  label: string;
  statusColor: string;
  recommendation?: string;
} {
  const listingBookings = bookings.filter(
    (b) => b.listingId === listingId && (b.status === 'completed' || b.status === 'active' || b.status === 'paid')
  );

  const totalBookedCount = listingBookings.length;

  if (totalBookedCount >= 3) {
    return {
      score: 85,
      idleDays: 3,
      label: '⚡ High Utilization (85%)',
      statusColor: 'text-rural-green-800 bg-rural-green-100 border-rural-green-200',
    };
  } else if (totalBookedCount >= 1) {
    return {
      score: 55,
      idleDays: 8,
      label: '📊 Moderate Utilization (55%)',
      statusColor: 'text-blue-800 bg-blue-100 border-blue-200',
    };
  } else {
    return {
      score: 20,
      idleDays: 14,
      label: '⚠️ High Idle Time (14 Days Idle)',
      statusColor: 'text-harvest-orange-dark bg-harvest-orange/10 border-harvest-orange/20',
      recommendation: 'Consider lowering your rate by 10% to boost bookings.',
    };
  }
}

/**
 * Get seasonal demand forecasts for the Provider Dashboard
 */
export function getDemandForecasts(): DemandForecast[] {
  return [
    {
      id: '1',
      category: '🚜 Tractors & Tillers',
      season: 'Harvest Season (In 2 weeks)',
      demandLevel: 'Very High',
      percentage: 90,
      badgeColor: 'bg-rural-green-800 text-cream-50',
      trendText: 'High demand expected due to upcoming Rabi harvest',
    },
    {
      id: '2',
      category: '🌾 Combined Harvesters',
      season: 'Peak Demand (Next 10 Days)',
      demandLevel: 'High',
      percentage: 82,
      badgeColor: 'bg-harvest-gold-dark text-cream-50',
      trendText: 'Bookings spiking in nearby villages',
    },
    {
      id: '3',
      category: '👷 Skilled Labor (Harvesting)',
      season: 'Next 2 Weeks',
      demandLevel: 'Moderate',
      percentage: 65,
      badgeColor: 'bg-earth-200 text-earth-800',
      trendText: 'Steady demand across your block',
    },
  ];
}

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';

/**
 * GET /api/insights/suggest-price
 * Mock AI pricing engine for provider listings.
 * Query params: type ('machinery' | 'labor'), location, category/title
 */
export const suggestPrice = async (req: AuthRequest, res: Response) => {
  try {
    const { type, location, category } = req.query;

    const reqType = String(type || 'machinery').toLowerCase();
    const reqCategory = String(category || '').toLowerCase();

    let basePrice = 800;
    let unit = 'per hour';

    if (reqType === 'labor') {
      unit = 'per day';
      if (reqCategory.includes('harvest') || reqCategory.includes('cutting')) {
        basePrice = 450;
      } else if (reqCategory.includes('till') || reqCategory.includes('plow')) {
        basePrice = 500;
      } else {
        basePrice = 400;
      }
    } else {
      // Machinery
      if (reqCategory.includes('combine') || reqCategory.includes('harvester')) {
        basePrice = 1800;
        unit = 'per hour';
      } else if (reqCategory.includes('jcb') || reqCategory.includes('excavator')) {
        basePrice = 1200;
        unit = 'per hour';
      } else if (reqCategory.includes('rotavator') || reqCategory.includes('tiller')) {
        basePrice = 600;
        unit = 'per hour';
      } else {
        // Tractor default
        basePrice = 850;
        unit = 'per hour';
      }
    }

    // Slight location demand multiplier (mocked)
    const locStr = String(location || '').toLowerCase();
    let demandMultiplier = 1.0;
    let demandLevel: 'high' | 'moderate' | 'average' = 'moderate';

    if (locStr.includes('agra') || locStr.includes('punjab') || locStr.includes('haryana')) {
      demandMultiplier = 1.12;
      demandLevel = 'high';
    } else if (locStr.includes('kanpur') || locStr.includes('up')) {
      demandMultiplier = 1.05;
      demandLevel = 'high';
    }

    const suggestedPrice = Math.round(basePrice * demandMultiplier);

    return res.status(200).json({
      suggestedPrice,
      unit,
      currency: 'INR',
      confidence: 0.94,
      demandLevel,
      marketRange: {
        min: Math.round(suggestedPrice * 0.85),
        max: Math.round(suggestedPrice * 1.2),
      },
    });
  } catch (err: any) {
    console.error('Suggest Price Error:', err);
    return res.status(500).json({ error: 'Server error generating price suggestion' });
  }
};

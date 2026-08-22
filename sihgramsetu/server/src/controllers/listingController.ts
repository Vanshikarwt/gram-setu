import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

const formatListingOutput = (l: any, bookedDatesSet?: Set<string>) => {
  let parsedImages: string[] = [];
  if (l.images) {
    try {
      parsedImages = JSON.parse(l.images);
    } catch {
      parsedImages = [];
    }
  }
  if (!parsedImages.length && l.imageUrl) {
    parsedImages = [l.imageUrl];
  }

  let parsedDates: string[] = [];
  if (l.availabilityDates) {
    try {
      parsedDates = JSON.parse(l.availabilityDates);
    } catch {
      parsedDates = [];
    }
  }

  const bookedArr = bookedDatesSet ? Array.from(bookedDatesSet) : [];

  return {
    ...l,
    images: parsedImages,
    imageUrl: parsedImages[0] || l.imageUrl || null,
    availabilityDates: parsedDates,
    bookedDates: bookedArr,
  };
};

/**
 * Public / Consumer global search & feed endpoint.
 */
export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const { q, type, location } = req.query;

    const whereClause: any = {
      status: 'active',
    };

    // Category type filter
    const VALID_TYPES = ['machinery', 'labor', 'crop_residue', 'storage', 'agri_product'];
    if (type && VALID_TYPES.includes(String(type))) {
      whereClause.type = String(type);
    }

    // Location filter
    if (location && String(location).trim()) {
      whereClause.location = {
        contains: String(location).trim(),
      };
    }

    // Text search query matching title or description
    if (q && String(q).trim()) {
      const searchTerm = String(q).trim();
      whereClause.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        provider: {
          select: { id: true, name: true, phone: true, location: true },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch per-listing average ratings and non-rejected bookings in batch
    const [ratingAggregates, activeBookings] = await Promise.all([
      prisma.review.groupBy({
        by: ['listingId'],
        where: { listingId: { in: listings.map((l: any) => l.id) } },
        _avg: { rating: true },
      }),
      prisma.booking.findMany({
        where: {
          listingId: { in: listings.map((l: any) => l.id) },
          status: { in: ['pending', 'accepted', 'paid', 'active'] },
        },
      }),
    ]);

    const ratingMap = new Map(
      ratingAggregates.map((r: any) => [r.listingId, r._avg.rating])
    );

    const bookedDatesMap = new Map<string, Set<string>>();
    activeBookings.forEach((b: any) => {
      if (!bookedDatesMap.has(b.listingId)) {
        bookedDatesMap.set(b.listingId, new Set());
      }
      const set = bookedDatesMap.get(b.listingId)!;
      const start = new Date(b.startDate);
      const end = b.endDate ? new Date(b.endDate) : start;
      const cur = new Date(start);
      while (cur <= end) {
        set.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    const enrichedListings = listings.map((l: any) => formatListingOutput({
      ...l,
      reviewCount: l._count.reviews,
      averageRating: ratingMap.get(l.id) ?? null,
    }, bookedDatesMap.get(l.id)));

    return res.status(200).json({
      listings: enrichedListings,
    });
  } catch (err: any) {
    console.error('Get Listings Search Error:', err);
    return res.status(500).json({ error: 'Server error fetching listings' });
  }
};

/**
 * Get single listing by ID with provider details included.
 */
export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [listing, ratingAgg, activeBookings] = await Promise.all([
      prisma.listing.findUnique({
        where: { id },
        include: {
          provider: { select: { id: true, name: true, phone: true, location: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.review.aggregate({
        where: { listingId: id },
        _avg: { rating: true },
      }),
      prisma.booking.findMany({
        where: {
          listingId: id,
          status: { in: ['pending', 'accepted', 'paid', 'active'] },
        },
      }),
    ]);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const bookedSet = new Set<string>();
    activeBookings.forEach((b: any) => {
      const start = new Date(b.startDate);
      const end = b.endDate ? new Date(b.endDate) : start;
      const cur = new Date(start);
      while (cur <= end) {
        bookedSet.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    return res.status(200).json({
      listing: formatListingOutput({
        ...listing,
        reviewCount: listing._count.reviews,
        averageRating: ratingAgg._avg.rating ?? null,
      }, bookedSet),
    });
  } catch (err: any) {
    console.error('Get Listing By ID Error:', err);
    return res.status(500).json({ error: 'Server error fetching listing' });
  }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, title, description, price, hourlyPrice, dailyPrice, unit, location, status, imageUrl, images, availabilityDates, category, capacity, stock } = req.body;

    // Validations
    if (!title || !type || price === undefined || price === null || !unit || !location) {
      return res.status(400).json({ error: 'Required fields missing: title, type, price, unit, location' });
    }

    const VALID_TYPES = ['machinery', 'labor', 'crop_residue', 'storage', 'agri_product'];
    if (!VALID_TYPES.includes(String(type))) {
      return res.status(400).json({ error: 'Type must be one of: machinery, labor, crop_residue, storage, agri_product' });
    }

    // Process images
    let imagesArr: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      imagesArr = images.map((img: any) => String(img).trim()).filter(Boolean);
    } else if (imageUrl && String(imageUrl).trim()) {
      imagesArr = [String(imageUrl).trim()];
    }

    // Photo requirement validation: ALL CATEGORIES EXCEPT LABOR MUST HAVE AT LEAST 1 PHOTO
    if (String(type).trim() !== 'labor' && imagesArr.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one photo.' });
    }

    // Process availability dates
    let datesArr: string[] = [];
    if (Array.isArray(availabilityDates)) {
      datesArr = Array.from(new Set(availabilityDates.map((d: any) => String(d).trim()).filter(Boolean)));
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const numericHourlyPrice = hourlyPrice !== undefined && hourlyPrice !== null ? parseFloat(hourlyPrice) : numericPrice;
    const numericDailyPrice = dailyPrice !== undefined && dailyPrice !== null ? parseFloat(dailyPrice) : (numericHourlyPrice ? numericHourlyPrice * 6 : numericPrice * 6);

    // Parse optional numeric fields
    const numericCapacity = capacity !== undefined && capacity !== null ? parseFloat(capacity) : null;
    const numericStock = stock !== undefined && stock !== null ? parseFloat(stock) : null;

    const listing = await prisma.listing.create({
      data: {
        providerId,
        type: String(type).trim(),
        title: String(title).trim(),
        description: description ? String(description).trim() : '',
        price: numericPrice,
        hourlyPrice: isNaN(numericHourlyPrice) ? numericPrice : numericHourlyPrice,
        dailyPrice: isNaN(numericDailyPrice) ? numericPrice * 6 : numericDailyPrice,
        unit: String(unit).trim(),
        location: String(location).trim(),
        status: status ? String(status).trim() : 'active',
        imageUrl: imagesArr[0] || (imageUrl ? String(imageUrl).trim() : null),
        images: JSON.stringify(imagesArr),
        availabilityDates: JSON.stringify(datesArr),
        category: category ? String(category).trim() : null,
        capacity: numericCapacity,
        stock: numericStock,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Listing created successfully',
      listing: formatListingOutput(listing),
    });
  } catch (err: any) {
    console.error('Create Listing Error:', err);
    return res.status(500).json({ error: 'Server error creating listing' });
  }
};

export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const listings = await prisma.listing.findMany({
      where: { providerId },
      include: {
        provider: {
          select: { id: true, name: true, phone: true, location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      listings: listings.map((l: any) => formatListingOutput(l)),
    });
  } catch (err: any) {
    console.error('Get My Listings Error:', err);
    return res.status(500).json({ error: 'Server error fetching listings' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    const { id } = req.params;

    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ownership check
    if (existingListing.providerId !== providerId) {
      return res.status(401).json({ error: 'Unauthorized: You do not own this listing' });
    }

    const { type, title, description, price, hourlyPrice, dailyPrice, unit, location, status, imageUrl, images, availabilityDates, category, capacity, stock } = req.body;

    const updatedData: any = {};
    const finalType = type !== undefined ? String(type).trim() : existingListing.type;
    if (type !== undefined) updatedData.type = finalType;
    if (title !== undefined) updatedData.title = String(title).trim();
    if (description !== undefined) updatedData.description = String(description).trim();
    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      updatedData.price = numericPrice;
    }
    if (hourlyPrice !== undefined) {
      updatedData.hourlyPrice = hourlyPrice !== null ? parseFloat(hourlyPrice) : null;
    }
    if (dailyPrice !== undefined) {
      updatedData.dailyPrice = dailyPrice !== null ? parseFloat(dailyPrice) : null;
    }
    if (unit !== undefined) updatedData.unit = String(unit).trim();
    if (location !== undefined) updatedData.location = String(location).trim();
    if (status !== undefined) updatedData.status = String(status).trim();
    
    // Validate and update images if provided
    if (images !== undefined || imageUrl !== undefined) {
      let imagesArr: string[] = [];
      if (Array.isArray(images)) {
        imagesArr = images.map((img: any) => String(img).trim()).filter(Boolean);
      } else if (imageUrl) {
        imagesArr = [String(imageUrl).trim()];
      }
      
      if (finalType !== 'labor' && imagesArr.length === 0) {
        return res.status(400).json({ error: 'Please upload at least one photo.' });
      }

      updatedData.images = JSON.stringify(imagesArr);
      updatedData.imageUrl = imagesArr[0] || null;
    }

    if (availabilityDates !== undefined) {
      let datesArr: string[] = [];
      if (Array.isArray(availabilityDates)) {
        datesArr = Array.from(new Set(availabilityDates.map((d: any) => String(d).trim()).filter(Boolean)));
      }
      updatedData.availabilityDates = JSON.stringify(datesArr);
    }

    if (category !== undefined) updatedData.category = category ? String(category).trim() : null;
    if (capacity !== undefined) updatedData.capacity = capacity !== null ? parseFloat(capacity) : null;
    if (stock !== undefined) updatedData.stock = stock !== null ? parseFloat(stock) : null;

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updatedData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Listing updated successfully',
      listing: formatListingOutput(updatedListing),
    });
  } catch (err: any) {
    console.error('Update Listing Error:', err);
    return res.status(500).json({ error: 'Server error updating listing' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    const { id } = req.params;

    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ownership check
    if (existingListing.providerId !== providerId) {
      return res.status(401).json({ error: 'Unauthorized: You do not own this listing' });
    }

    await prisma.listing.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Listing deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete Listing Error:', err);
    return res.status(500).json({ error: 'Server error deleting listing' });
  }
};

/**
 * Decrement listing stock by a given amount (called by payment controller after checkout).
 * Used for 'agri_product' and 'crop_residue' listings to track remaining inventory.
 */
export const decrementListingStock = async (listingId: string, amount: number): Promise<void> => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.stock === null || listing.stock === undefined) return;

  const newStock = Math.max(0, (listing.stock as number) - amount);
  await prisma.listing.update({
    where: { id: listingId },
    data: { stock: newStock },
  });
};

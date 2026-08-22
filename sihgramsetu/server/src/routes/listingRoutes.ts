import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
} from '../controllers/listingController';
import { getListingReviews } from '../controllers/reviewController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Protect all listing endpoints with JWT auth
router.use(verifyToken);

// Public / Consumer feed & search routes
router.get('/', getListings);
router.get('/my-listings', getMyListings);
router.get('/:id/reviews', getListingReviews); // must be before /:id
router.get('/:id', getListingById);

// Provider listing CRUD routes
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

export default router;

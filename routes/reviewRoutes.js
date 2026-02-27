import express from 'express';
const router = express.Router();
import { addReview, getSellerReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, addReview);
router.get('/seller/:sellerId', getSellerReviews);

export default router;

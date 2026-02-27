import Review from '../models/Review.js';
import Order from '../models/Order.js';

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res, next) => {
    try {
        const { orderId, rating, comment } = req.body;

        const order = await Order.findById(orderId).populate('product');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.buyer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to review this order');
        }

        const review = new Review({
            reviewer: req.user._id,
            seller: order.product.seller,
            order: orderId,
            rating: Number(rating),
            comment,
        });

        const createdReview = await review.save();
        res.status(201).json(createdReview);
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller's reviews and average rating
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId }).populate('reviewer', 'name');

        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;

        res.json({ reviews, averageRating });
    } catch (error) {
        next(error);
    }
};

export { addReview, getSellerReviews };

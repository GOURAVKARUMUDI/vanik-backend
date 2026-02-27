import { db } from '../firebaseAdmin.js';

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res, next) => {
    try {
        const { orderId, rating, comment } = req.body;

        const orderSnapshot = await db.ref(`orders/${orderId}`).once('value');

        if (!orderSnapshot.exists()) {
            res.status(404);
            throw new Error('Order not found');
        }

        const order = orderSnapshot.val();

        // Check if current user is the buyer
        const currentUserId = req.user.uid || req.user._id;
        if (order.buyer !== currentUserId && (!order.buyer.uid || order.buyer.uid !== currentUserId)) {
            res.status(401);
            throw new Error('Not authorized to review this order');
        }

        // Fetch product to get seller
        const productSnapshot = await db.ref(`products/${order.product}`).once('value');
        const product = productSnapshot.exists() ? productSnapshot.val() : {};

        const sellerId = product.seller?.uid || product.seller || 'unknown';

        const newReviewRef = db.ref('reviews').push();
        const reviewData = {
            id: newReviewRef.key,
            reviewer: currentUserId,
            seller: sellerId,
            order: orderId,
            rating: Number(rating),
            comment,
            createdAt: Date.now()
        };

        await newReviewRef.set(reviewData);
        res.status(201).json(reviewData);
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller's reviews and average rating
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = async (req, res, next) => {
    try {
        const snapshot = await db.ref('reviews').once('value');
        if (!snapshot.exists()) {
            return res.json({ reviews: [], averageRating: 0 });
        }

        let reviews = [];
        let totalRating = 0;

        for (const [key, val] of Object.entries(snapshot.val())) {
            if (val.seller === req.params.sellerId) {
                // Populate reviewer name
                const userSnap = await db.ref(`users/${val.reviewer}`).once('value');
                if (userSnap.exists()) {
                    val.reviewer = { id: userSnap.key, name: userSnap.val().name };
                }

                reviews.push({ id: key, ...val });
                totalRating += val.rating;
            }
        }

        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        res.json({ reviews, averageRating });
    } catch (error) {
        next(error);
    }
};

export { addReview, getSellerReviews };

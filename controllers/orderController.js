import { db } from '../firebaseAdmin.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    try {
        const { product: productId, type, rentalStartDate, rentalEndDate, totalPrice } = req.body;

        const productRef = db.ref(`products/${productId}`);
        const productSnapshot = await productRef.once('value');

        if (!productSnapshot.exists()) {
            res.status(404);
            throw new Error('Product not found');
        }

        const product = productSnapshot.val();

        if (product.status !== 'Available') {
            res.status(400);
            throw new Error('Product is no longer available');
        }

        const newOrderRef = db.ref('orders').push();
        const orderData = {
            id: newOrderRef.key,
            buyer: req.user.uid || req.user._id,
            product: productId,
            type,
            rentalStartDate: rentalStartDate || null,
            rentalEndDate: rentalEndDate || null,
            totalPrice: Number(totalPrice),
            status: 'Pending',
            createdAt: Date.now()
        };

        await newOrderRef.set(orderData);

        // Update product status
        await productRef.update({
            status: type === 'buy' ? 'Sold' : 'Rented'
        });

        res.status(201).json(orderData);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const snapshot = await db.ref('orders').once('value');
        if (!snapshot.exists()) {
            return res.json([]);
        }

        const currentUserId = req.user.uid || req.user._id;
        let orders = [];

        // Loop through orders and manually populate the product
        for (const [key, val] of Object.entries(snapshot.val())) {
            if (val.buyer === currentUserId || (val.buyer && val.buyer.uid === currentUserId)) {
                // Populate product manually
                if (val.product) {
                    const prodSnap = await db.ref(`products/${val.product}`).once('value');
                    if (prodSnap.exists()) {
                        val.product = { id: prodSnap.key, ...prodSnap.val() };
                    }
                }
                orders.push({ id: key, ...val });
            }
        }

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
    try {
        const ref = db.ref(`orders/${req.params.id}`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            const updates = { status: req.body.status || snapshot.val().status };
            await ref.update(updates);

            const updatedSnap = await ref.once('value');
            res.json({ id: updatedSnap.key, ...updatedSnap.val() });
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

export { addOrderItems, getMyOrders, updateOrderStatus };

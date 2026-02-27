import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    try {
        const { product: productId, type, rentalStartDate, rentalEndDate, totalPrice } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        if (product.status !== 'Available') {
            res.status(400);
            throw new Error('Product is no longer available');
        }

        const order = new Order({
            buyer: req.user._id,
            product: productId,
            type,
            rentalStartDate,
            rentalEndDate,
            totalPrice,
            status: 'Pending',
        });

        const createdOrder = await order.save();

        // Update product status
        product.status = type === 'buy' ? 'Sold' : 'Rented';
        await product.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyer: req.user._id }).populate('product');
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
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

export { addOrderItems, getMyOrders, updateOrderStatus };

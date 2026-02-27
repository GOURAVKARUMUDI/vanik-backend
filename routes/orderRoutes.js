import express from 'express';
const router = express.Router();
import {
    addOrderItems,
    getMyOrders,
    updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems);
router.route('/my').get(protect, getMyOrders);
router.route('/:id/status').put(protect, updateOrderStatus);

export default router;

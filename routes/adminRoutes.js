import express from 'express';
const router = express.Router();
import {
    getUsers,
    deleteUser,
    updateProductStatus,
    getStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/products/:id/status', updateProductStatus);
router.get('/stats', getStats);

export default router;

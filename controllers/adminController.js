import { db } from '../firebaseAdmin.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const snapshot = await db.ref('users').once('value');
        if (!snapshot.exists()) return res.json([]);

        const users = [];
        snapshot.forEach(snap => {
            users.push({ id: snap.key, uid: snap.key, ...snap.val() });
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const ref = db.ref(`users/${req.params.id}`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            if (snapshot.val().role === 'admin') {
                res.status(400);
                throw new Error('Cannot delete admin user');
            }
            await ref.remove();
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject product
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res, next) => {
    try {
        const ref = db.ref(`products/${req.params.id}`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            await ref.update({ status: req.body.status || snapshot.val().status });
            const updated = await ref.once('value');
            res.json({ id: updated.key, ...updated.val() });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
    try {
        const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
            db.ref('users').once('value'),
            db.ref('products').once('value'),
            db.ref('orders').once('value')
        ]);

        const usersCount = usersSnap.exists() ? usersSnap.numChildren() : 0;
        const productsCount = productsSnap.exists() ? productsSnap.numChildren() : 0;
        const ordersCount = ordersSnap.exists() ? ordersSnap.numChildren() : 0;

        let totalRevenue = 0;
        if (ordersSnap.exists()) {
            ordersSnap.forEach(snap => {
                const order = snap.val();
                if (order.status === 'Completed' && order.totalPrice) {
                    totalRevenue += Number(order.totalPrice);
                }
            });
        }

        res.json({
            usersCount,
            productsCount,
            ordersCount,
            totalRevenue,
        });
    } catch (error) {
        next(error);
    }
};

export { getUsers, deleteUser, updateProductStatus, getStats };

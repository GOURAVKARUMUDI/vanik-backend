import { db } from '../firebaseAdmin.js';

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { category, type, minPrice, maxPrice, search } = req.query;

        const snapshot = await db.ref('products').once('value');
        if (!snapshot.exists()) {
            return res.json([]);
        }

        let products = [];
        snapshot.forEach(childSnapshot => {
            products.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Apply filters
        if (category) {
            products = products.filter(p => p.category === category);
        }
        if (type) {
            products = products.filter(p => p.type === type);
        }
        if (minPrice) {
            products = products.filter(p => Number(p.price) >= Number(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => Number(p.price) <= Number(maxPrice));
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            products = products.filter(p => regex.test(p.title) || regex.test(p.description));
        }

        // We don't have .populate() in RTDB, we would normally fetch the seller by ID. 
        // If the seller field already has the object (since we seeded it that way), we just return it.
        // If seller is just a string UID, we might need to fetch the seller info from users table if required.

        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const snapshot = await db.ref(`products/${req.params.id}`).once('value');
        if (snapshot.exists()) {
            res.json({ id: snapshot.key, ...snapshot.val() });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res, next) => {
    try {
        const { title, description, category, type, price } = req.body;

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image');
        }

        // Fetch seller details to embed in the product
        const sellerSnapshot = await db.ref(`users/${req.user.uid || req.user._id}`).once('value');
        let sellerInfo = { uid: req.user.uid || req.user._id };
        if (sellerSnapshot.exists()) {
            const s = sellerSnapshot.val();
            sellerInfo = { name: s.name, email: s.email, college: s.college, uid: s.uid };
        }

        const newProductRef = db.ref('products').push();
        const productData = {
            id: newProductRef.key,
            seller: sellerInfo,
            title,
            description,
            category,
            type,
            price: Number(price),
            image: `/uploads/${req.file.filename}`,
            status: 'Available',
            createdAt: Date.now()
        };

        await newProductRef.set(productData);
        res.status(201).json(productData);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Owner
const updateProduct = async (req, res, next) => {
    try {
        const { title, description, category, type, price, status } = req.body;
        const ref = db.ref(`products/${req.params.id}`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            const product = snapshot.val();

            const sellerId = product.seller.uid || product.seller;
            const currentUserId = req.user.uid || req.user._id;

            if (sellerId !== currentUserId && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to update this product');
            }

            const updates = {};
            if (title) updates.title = title;
            if (description) updates.description = description;
            if (category) updates.category = category;
            if (type) updates.type = type;
            if (price !== undefined) updates.price = Number(price);
            if (status) updates.status = status;

            if (req.file) {
                updates.image = `/uploads/${req.file.filename}`;
            }

            await ref.update(updates);

            // Return updated product
            const updatedSnapshot = await ref.once('value');
            res.json({ id: updatedSnapshot.key, ...updatedSnapshot.val() });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Owner/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const ref = db.ref(`products/${req.params.id}`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            const product = snapshot.val();
            const sellerId = product.seller.uid || product.seller;
            const currentUserId = req.user.uid || req.user._id;

            if (sellerId !== currentUserId && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to delete this product');
            }

            await ref.remove();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

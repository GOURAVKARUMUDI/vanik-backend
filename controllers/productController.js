import Product from '../models/Product.js';

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { category, type, minPrice, maxPrice, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (type) query.type = type;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).populate('seller', 'name email college');
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
        const product = await Product.findById(req.params.id).populate('seller', 'name email college');
        if (product) {
            res.json(product);
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
// @access  Private/Student
const createProduct = async (req, res, next) => {
    try {
        const { title, description, category, type, price } = req.body;

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image');
        }

        const product = new Product({
            seller: req.user._id,
            title,
            description,
            category,
            type,
            price,
            image: `/uploads/${req.file.filename}`,
            status: 'Available',
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
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

        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to update this product');
            }

            product.title = title || product.title;
            product.description = description || product.description;
            product.category = category || product.category;
            product.type = type || product.type;
            product.price = price !== undefined ? price : product.price;
            product.status = status || product.status;

            if (req.file) {
                product.image = `/uploads/${req.file.filename}`;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
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
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to delete this product');
            }

            await Product.findByIdAndDelete(req.params.id);
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

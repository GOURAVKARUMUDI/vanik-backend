import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://vanik-kappa.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

import { createServer } from 'http';
import socketIO from './socket.js';

const httpServer = createServer(app);
socketIO(httpServer);

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

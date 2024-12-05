const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require("dotenv").config();

const uploadImage = require("./../utils/uploadimage");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", "data:", "https:"],
        upgradeInsecureRequests: [],
    },
}));
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true })); // Body parser for URL-encoded data
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter); // Apply to all API routes

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('tiny'));
} else {
    app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./users/user.route');
const productRoutes = require('./products/products.route');
const reviewRoutes = require('./reviews/reviews.route');
const statsRoutes = require('./stats/stats.route');
const cartRoutes = require('./cart/cart.route');
const dealRoutes = require('./deals/deals.route');
const couponRoutes = require('./coupon/coupon.route');
const orderRoutes = require('./orders/order.route');

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupon', couponRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy!' });
});

// Database Connection
async function connectWithRetry() {
    try {
        await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Mongodb connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
}
connectWithRetry();

// Upload image route
app.post("/api/uploadImage", (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: "Image data is required" });
    }
    uploadImage(image)
        .then((response) => res.status(200).json(response))
        .catch((err) => res.status(500).json({ error: "Image upload failed", details: err }));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

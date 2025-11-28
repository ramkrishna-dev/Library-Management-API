const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
require('dotenv').config();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Library Management API!',
  });
});

// TODO: Add routes for auth, users, books, etc.
const authRouter = require('./routes/authRoutes');
const bookRouter = require('./routes/bookRoutes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', bookRouter);

const borrowRouter = require('./routes/borrowRoutes');
app.use('/api/v1/borrow', borrowRouter);

const waitlistRouter = require('./routes/waitlistRoutes');
app.use('/api/v1/waitlist', waitlistRouter);

const recommendationRouter = require('./routes/recommendationRoutes');
app.use('/api/v1/recommendations', recommendationRouter);

const adminRouter = require('./routes/adminRoutes');
app.use('/api/v1/admin', adminRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong!',
    });
});

module.exports = app;

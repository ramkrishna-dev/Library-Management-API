const Review = require('../models/Review');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.setBookUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.bookId) req.body.bookId = req.params.bookId;
  if (!req.body.userId) req.body.userId = req.user.id;
  next();
};

exports.addReview = catchAsync(async (req, res, next) => {
  Review.create(req.body, (err, review) => {
    if (err) {
      return next(new AppError('Could not create review!', 500));
    }
    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  });
});

exports.getBookReviews = catchAsync(async (req, res, next) => {
  Review.findByBook(req.params.bookId, (err, reviews) => {
    if (err) {
      return next(new AppError('Could not retrieve reviews!', 500));
    }
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  Review.findById(req.params.id, (err, review) => {
    if (err) return next(new AppError('Error finding review!', 500));
    if (!review) return next(new AppError('No review found with that ID', 404));

    if (review.userId !== req.user.id) {
      return next(new AppError('You can only update your own reviews!', 403));
    }

    Review.update(req.params.id, req.body, (err, result) => {
      if (err) return next(new AppError('Could not update review!', 500));
      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully!',
      });
    });
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  Review.findById(req.params.id, (err, review) => {
    if (err) return next(new AppError('Error finding review!', 500));
    if (!review) return next(new AppError('No review found with that ID', 404));

    if (review.userId !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
      return next(new AppError('You do not have permission to delete this review!', 403));
    }

    Review.delete(req.params.id, (err, result) => {
      if (err) return next(new AppError('Could not delete review!', 500));
      res.status(204).json({
        status: 'success',
        data: null,
      });
    });
  });
});

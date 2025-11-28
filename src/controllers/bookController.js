const Book = require('../models/Book');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { uploadBookCover, resizeBookCover } = require('../utils/multer');

exports.uploadBookCover = uploadBookCover;
exports.resizeBookCover = resizeBookCover;

exports.addBook = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.coverImage = req.file.filename;
  }
  
  Book.create(req.body, (err, book) => {
    if (err) {
      return next(new AppError('Could not add book!', 500));
    }
    res.status(201).json({
      status: 'success',
      data: {
        book,
      },
    });
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const options = { ...req.query };
  Book.findAll(options, (err, books) => {
    if (err) {
      return next(new AppError('Could not retrieve books!', 500));
    }
    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books,
      },
    });
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  Book.findById(req.params.id, (err, book) => {
    if (err) {
      return next(new AppError('Error finding book!', 500));
    }
    if (!book) {
      return next(new AppError('No book found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.coverImage = req.file.filename;
  }

  Book.update(req.params.id, req.body, (err, result) => {
    if (err) {
      return next(new AppError('Could not update book!', 500));
    }
    if (result.changes === 0) {
      return next(new AppError('No book found with that ID or no changes made!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Book updated successfully!',
    });
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  Book.delete(req.params.id, (err, result) => {
    if (err) {
      return next(new AppError('Could not delete book!', 500));
    }
    if (result.changes === 0) {
      return next(new AppError('No book found with that ID!', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
});

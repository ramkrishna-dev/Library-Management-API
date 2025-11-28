const Waitlist = require('../models/Waitlist');
const Book = require('../models/Book');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.joinWaitlist = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const userId = req.user.id;

    Book.findById(bookId, (err, book) => {
        if (err) return next(new AppError('Error finding book!', 500));
        if (!book) return next(new AppError('Book not found!', 404));

        if (book.copies > 0) {
            return next(new AppError('This book is available. You cannot join the waitlist.', 400));
        }

        Waitlist.find(userId, bookId, (err, existing) => {
            if (err) return next(new AppError('Error checking waitlist!', 500));
            if (existing) {
                return next(new AppError('You are already on the waitlist for this book.', 400));
            }

            Waitlist.join(userId, bookId, (err, waitlistEntry) => {
                if (err) return next(new AppError('Could not join waitlist!', 500));
                res.status(201).json({
                    status: 'success',
                    message: 'Successfully joined the waitlist.',
                    data: {
                        waitlistEntry,
                    },
                });
            });
        });
    });
});

exports.leaveWaitlist = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const userId = req.user.id;

    Waitlist.leave(userId, bookId, (err, result) => {
        if (err) return next(new AppError('Could not leave waitlist!', 500));
        if (result.changes === 0) {
            return next(new AppError('You were not on the waitlist for this book.', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Successfully left the waitlist.',
        });
    });
});

exports.getWaitlistForBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;

    Waitlist.findByBook(bookId, (err, waitlist) => {
        if (err) return next(new AppError('Could not retrieve waitlist!', 500));
        res.status(200).json({
            status: 'success',
            results: waitlist.length,
            data: {
                waitlist,
            },
        });
    });
});

const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const Waitlist = require('../models/Waitlist');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../services/emailService');
require('dotenv').config();

const BORROW_LIMIT = 5;
const FINE_PER_DAY = 1; // Or get from a config file

exports.borrowBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.body;
    const userId = req.user.id;

    Book.findById(bookId, (err, book) => {
        if (err) return next(new AppError('Error finding book!', 500));
        if (!book) return next(new AppError('Book not found!', 404));

        if (book.copies <= 0) {
            return next(new AppError('This book is currently unavailable.', 400));
        }

        Borrow.countActiveBorrows(userId, (err, result) => {
            if (err) return next(new AppError('Error checking borrow limit!', 500));
            
            if (result.count >= BORROW_LIMIT) {
                return next(new AppError(`You have reached your borrow limit of ${BORROW_LIMIT} books.`, 400));
            }
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // 2-week borrow period

            Borrow.create({ userId, bookId, dueDate: dueDate.toISOString().split('T')[0] }, (err, borrowRecord) => {
                if (err) return next(new AppError('Could not borrow book!', 500));

                Book.update(bookId, { copies: book.copies - 1 }, async (err, updateResult) => {
                    if (err) return next(new AppError('Failed to update book copies!', 500));
                    
                    try {
                        await sendEmail({
                            email: req.user.email,
                            subject: 'Book Borrow Confirmation',
                            message: `You have successfully borrowed "${book.title}". The due date is ${borrowRecord.dueDate}.`,
                        });
                    } catch (emailErr) {
                        console.error('Email sending failed:', emailErr);
                        // Don't block the response for an email error
                    }

                    res.status(201).json({
                        status: 'success',
                        data: {
                            borrowRecord,
                        },
                    });
                });
            });
        });
    });
});

exports.returnBook = catchAsync(async (req, res, next) => {
    const { borrowId } = req.params;
    const userId = req.user.id;

    Borrow.findById(borrowId, (err, borrowRecord) => {
        if (err) return next(new AppError('Error finding borrow record!', 500));
        if (!borrowRecord) return next(new AppError('Borrow record not found!', 404));
        if (borrowRecord.userId !== userId) return next(new AppError('This is not your borrow record!', 403));
        if (borrowRecord.status === 'returned') return next(new AppError('This book has already been returned!', 400));

        let fineAmount = 0;
        const dueDate = new Date(borrowRecord.dueDate);
        const returnDate = new Date();

        if (returnDate > dueDate) {
            const diffTime = Math.abs(returnDate - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fineAmount = diffDays * FINE_PER_DAY;
        }

        Borrow.returnBook(borrowId, fineAmount, (err, result) => {
            if (err) return next(new AppError('Could not return book!', 500));

            Book.findById(borrowRecord.bookId, (err, book) => {
                if (err) return next(new AppError('Error finding book!', 500));
                
                Book.update(borrowRecord.bookId, { copies: book.copies + 1 }, (err, updateResult) => {
                    if (err) return next(new AppError('Failed to update book copies!', 500));

                    // Notify waitlist
                    Waitlist.findNext(book.id, (err, nextUserOnWaitlist) => {
                        if (err) return console.error("Error finding next on waitlist:", err);
                        if (nextUserOnWaitlist) {
                            User.findById(nextUserOnWaitlist.userId, async (err, user) => {
                                try {
                                    await sendEmail({
                                        email: user.email,
                                        subject: `Book Available: "${book.title}"`,
                                        message: `The book "${book.title}" you were waiting for is now available. Please borrow it within 48 hours.`,
                                    });
                                    // Remove user from waitlist after notification
                                    Waitlist.leave(user.id, book.id, (err) => {
                                        if (err) console.error("Failed to remove user from waitlist:", err);
                                    });
                                } catch (emailErr) {
                                    console.error('Waitlist email sending failed:', emailErr);
                                }
                            });
                        }
                    });

                    res.status(200).json({
                        status: 'success',
                        message: 'Book returned successfully!',
                        fineAmount,
                    });
                });
            });
        });
    });
});

exports.getBorrowHistory = catchAsync(async (req, res, next) => {
    Borrow.findByUser(req.user.id, (err, history) => {
        if (err) return next(new AppError('Could not retrieve borrow history!', 500));
        res.status(200).json({
            status: 'success',
            results: history.length,
            data: {
                history,
            },
        });
    });
});

exports.getAllBorrowedBooks = catchAsync(async (req, res, next) => {
    Borrow.findAllBorrowed((err, books) => {
        if (err) return next(new AppError('Could not retrieve borrowed books!', 500));
        res.status(200).json({
            status: 'success',
            results: books.length,
            data: {
                books,
            },
        });
    });
});

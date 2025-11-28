const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const csv = require('csv-parser');
const fs = require('fs');
const fastcsv = require('fast-csv');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const promises = [
        new Promise((resolve, reject) => User.countAllUsers((err, result) => err ? reject(err) : resolve({ users: result.count }))),
        new Promise((resolve, reject) => Book.countAllBooks((err, result) => err ? reject(err) : resolve({ books: result.count }))),
        new Promise((resolve, reject) => Borrow.countOverdueBooks((err, result) => err ? reject(err) : resolve({ overdue: result.count }))),
        new Promise((resolve, reject) => Borrow.getTotalFines((err, result) => err ? reject(err) : resolve({ fines: result.totalFines || 0 })))
    ];

    Promise.all(promises).then(results => {
        const stats = results.reduce((acc, current) => ({ ...acc, ...current }), {});
        res.status(200).json({
            status: 'success',
            data: {
                stats,
            },
        });
    }).catch(err => {
        next(new AppError('Could not retrieve dashboard stats!', 500));
    });
});

exports.listOverdueBooks = catchAsync(async (req, res, next) => {
    Borrow.findAllBorrowed((err, books) => {
        if (err) return next(new AppError('Could not retrieve overdue books!', 500));
        const overdue = books.filter(b => b.status === 'overdue');
        res.status(200).json({
            status: 'success',
            results: overdue.length,
            data: {
                overdueBooks: overdue,
            },
        });
    });
});

exports.listTopBorrowedBooks = catchAsync(async (req, res, next) => {
    Book.getTopBorrowedBooks(10, (err, books) => {
        if (err) return next(new AppError('Could not retrieve top borrowed books!', 500));
        res.status(200).json({
            status: 'success',
            results: books.length,
            data: {
                topBooks: books,
            },
        });
    });
});

exports.bulkImportBooks = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload a CSV file!', 400));
    }

    const books = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => books.push(data))
        .on('end', () => {
            const promises = books.map(book => {
                return new Promise((resolve, reject) => {
                    Book.create(book, (err, createdBook) => {
                        if (err) {
                            console.warn(`Skipping book due to error: ${err.message}`, book);
                        }
                        resolve();
                    });
                });
            });

            Promise.all(promises).then(() => {
                fs.unlinkSync(req.file.path); // Clean up uploaded file
                res.status(201).json({
                    status: 'success',
                    message: 'Bulk import process finished. Check logs for any skipped books.',
                });
            });
        });
});

exports.exportBooks = catchAsync(async (req, res, next) => {
    Book.findAll({}, (err, books) => {
        if (err) {
            return next(new AppError('Could not fetch books for export!', 500));
        }
        
        const filename = 'export_books.csv';
        const ws = fs.createWriteStream(filename);
        fastcsv
            .write(books, { headers: true })
            .on('finish', function() {
                res.status(200).download(filename, (err) => {
                    if (err) console.error("Error sending file:", err);
                    fs.unlinkSync(filename); // Clean up file after sending
                });
            })
            .pipe(ws);
    });
});

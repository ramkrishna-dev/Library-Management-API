const Borrow = require('../models/Borrow');
const Review = require('../models/Review');
const Book = require('../models/Book');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getRecommendations = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    let recommendations = [];
    const recommendationSet = new Set();

    // 1. Get top genres for the user
    Borrow.getTopGenresForUser(userId, (err, topGenres) => {
        if (err) return next(new AppError('Could not get top genres!', 500));

        // 2. Get top rated books
        Review.getTopRatedBooks(10, (err, topRatedBooks) => {
            if (err) return next(new AppError('Could not get top rated books!', 500));

            // Add top rated books to recommendations, avoiding duplicates
            topRatedBooks.forEach(book => {
                if (!recommendationSet.has(book.id)) {
                    recommendations.push(book);
                    recommendationSet.add(book.id);
                }
            });
            
            // 3. Get books from top genres if more recommendations are needed
            if (recommendations.length < 10 && topGenres.length > 0) {
                const genrePromises = topGenres.map(g => {
                    return new Promise((resolve, reject) => {
                        Book.findAll({ genre: g.genre, limit: 5 }, (err, books) => {
                            if (err) reject(err);
                            resolve(books);
                        });
                    });
                });

                Promise.all(genrePromises).then(genreBooksArrays => {
                    genreBooksArrays.forEach(books => {
                        books.forEach(book => {
                            if (!recommendationSet.has(book.id)) {
                                recommendations.push(book);
                                recommendationSet.add(book.id);
                            }
                        });
                    });

                    res.status(200).json({
                        status: 'success',
                        results: recommendations.length,
                        data: {
                            recommendations: recommendations.slice(0, 10),
                        },
                    });

                }).catch(err => {
                    return next(new AppError('Could not get books by genre!', 500));
                });

            } else {
                 res.status(200).json({
                    status: 'success',
                    results: recommendations.length,
                    data: {
                        recommendations: recommendations.slice(0, 10),
                    },
                });
            }
        });
    });
});

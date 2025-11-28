const db = require('../config/database');

class Review {
  static create(reviewData, callback) {
    const { userId, bookId, rating, reviewText } = reviewData;
    db.run(
      'INSERT INTO Review (userId, bookId, rating, reviewText) VALUES (?, ?, ?, ?)',
      [userId, bookId, rating, reviewText],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...reviewData });
      }
    );
  }

  static findById(id, callback) {
    db.get('SELECT * FROM Review WHERE id = ?', [id], callback);
  }

  static findByBook(bookId, callback) {
    db.all('SELECT * FROM Review WHERE bookId = ?', [bookId], callback);
  }

  static update(id, reviewData, callback) {
    const { rating, reviewText } = reviewData;
    db.run(
      'UPDATE Review SET rating = ?, reviewText = ? WHERE id = ?',
      [rating, reviewText, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { id, changes: this.changes });
      }
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM Review WHERE id = ?', [id], function (err) {
      if (err) return callback(err);
      callback(null, { changes: this.changes });
    });
  }

  static getAverageRating(bookId, callback) {
    db.get('SELECT AVG(rating) as averageRating FROM Review WHERE bookId = ?', [bookId], callback);
  }

  static getTopRatedBooks(limit = 5, callback) {
    db.all(`
        SELECT b.*, AVG(r.rating) as averageRating
        FROM Review r
        JOIN Book b ON r.bookId = b.id
        GROUP BY r.bookId
        ORDER BY averageRating DESC
        LIMIT ?
    `, [limit], callback);
  }
}

module.exports = Review;

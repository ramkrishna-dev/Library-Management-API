const db = require('../config/database');

class Borrow {
  static create(borrowData, callback) {
    const { userId, bookId, dueDate } = borrowData;
    db.run(
      'INSERT INTO Borrow (userId, bookId, dueDate) VALUES (?, ?, ?)',
      [userId, bookId, dueDate],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...borrowData });
      }
    );
  }

  static findActiveBorrow(userId, bookId, callback) {
    db.get(
      "SELECT * FROM Borrow WHERE userId = ? AND bookId = ? AND status = 'borrowed'",
      [userId, bookId],
      callback
    );
  }

  static findById(id, callback) {
    db.get('SELECT * FROM Borrow WHERE id = ?', [id], callback);
  }

  static findByUser(userId, callback) {
    db.all('SELECT * FROM Borrow WHERE userId = ? ORDER BY borrowDate DESC', [userId], callback);
  }

  static countActiveBorrows(userId, callback) {
    db.get('SELECT COUNT(*) as count FROM Borrow WHERE userId = ? AND status = "borrowed"', [userId], callback);
  }

  static returnBook(id, fineAmount, callback) {
    db.run(
      "UPDATE Borrow SET returnDate = CURRENT_TIMESTAMP, status = 'returned', fineAmount = ? WHERE id = ?",
      [fineAmount, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { changes: this.changes });
      }
    );
  }

  static findOverdueWithUserDetails(callback) {
    db.all(`
      SELECT b.*, u.email, bk.title as bookTitle
      FROM Borrow b
      JOIN User u ON b.userId = u.id
      JOIN Book bk ON b.bookId = bk.id
      WHERE b.dueDate < date('now') AND b.status = 'borrowed'
    `, callback);
  }

  static markAsOverdue(id, callback) {
    db.run("UPDATE Borrow SET status = 'overdue' WHERE id = ?", [id], function(err) {
      if (err) return callback(err);
      callback(null, { changes: this.changes });
    });
  }

  static findAllBorrowed(callback) {
    db.all("SELECT b.*, u.name as userName, bk.title as bookTitle FROM Borrow b JOIN User u ON b.userId = u.id JOIN Book bk ON b.bookId = bk.id WHERE b.status IN ('borrowed', 'overdue')", callback);
  }

  static getTopGenresForUser(userId, callback) {
    db.all(`
      SELECT b.genre, COUNT(b.genre) as genreCount
      FROM Borrow br
      JOIN Book b ON br.bookId = b.id
      WHERE br.userId = ?
      GROUP BY b.genre
      ORDER BY genreCount DESC
      LIMIT 3
    `, [userId], callback);
  }

  static countOverdueBooks(callback) {
    db.get("SELECT COUNT(*) as count FROM Borrow WHERE status = 'overdue'", callback);
  }

  static getTotalFines(callback) {
    db.get("SELECT SUM(fineAmount) as totalFines FROM Borrow", callback);
  }
}

module.exports = Borrow;

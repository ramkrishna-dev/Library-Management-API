const db = require('../config/database');

class Waitlist {
  static join(userId, bookId, callback) {
    db.get('SELECT MAX(position) as maxPos FROM Waitlist WHERE bookId = ?', [bookId], (err, row) => {
        if (err) return callback(err);
        const newPosition = (row && row.maxPos !== null) ? row.maxPos + 1 : 1;
        db.run(
            'INSERT INTO Waitlist (userId, bookId, position) VALUES (?, ?, ?)',
            [userId, bookId, newPosition],
            function (err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, userId, bookId, position: newPosition });
            }
        );
    });
  }

  static find(userId, bookId, callback) {
    db.get('SELECT * FROM Waitlist WHERE userId = ? AND bookId = ?', [userId, bookId], callback);
  }

  static leave(userId, bookId, callback) {
    db.run(
      'DELETE FROM Waitlist WHERE userId = ? AND bookId = ?',
      [userId, bookId],
      function (err) {
        if (err) return callback(err);
        callback(null, { changes: this.changes });
      }
    );
  }

  static findNext(bookId, callback) {
    db.get('SELECT * FROM Waitlist WHERE bookId = ? ORDER BY position ASC LIMIT 1', [bookId], callback);
  }
  
  static findByBook(bookId, callback) {
    db.all('SELECT w.*, u.name as userName, u.email as userEmail FROM Waitlist w JOIN User u ON w.userId = u.id WHERE w.bookId = ? ORDER BY w.position ASC', [bookId], callback);
  }
}

module.exports = Waitlist;

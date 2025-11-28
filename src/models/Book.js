const db = require('../config/database');

class Book {
  static create(bookData, callback) {
    const { title, author, description, genre, copies, coverImage } = bookData;
    db.run(
      'INSERT INTO Book (title, author, description, genre, copies, coverImage) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, description, genre, copies, coverImage],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...bookData });
      }
    );
  }

  static findById(id, callback) {
    db.get('SELECT * FROM Book WHERE id = ?', [id], callback);
  }

  static findAll(options, callback) {
    const {
      limit = 10,
      offset = 0,
      genre,
      search,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    let query = 'SELECT * FROM Book';
    const params = [];
    const conditions = [];

    if (genre) {
      conditions.push('genre = ?');
      params.push(genre);
    }

    if (search) {
      conditions.push('(title LIKE ? OR author LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(query, params, callback);
  }

  static update(id, bookData, callback) {
    const fields = [];
    const values = [];
    if (bookData.title) {
      fields.push('title = ?');
      values.push(bookData.title);
    }
    if (bookData.author) {
      fields.push('author = ?');
      values.push(bookData.author);
    }
    if (bookData.description) {
      fields.push('description = ?');
      values.push(bookData.description);
    }
    if (bookData.genre) {
      fields.push('genre = ?');
      values.push(bookData.genre);
    }
    if (bookData.copies !== undefined) {
      fields.push('copies = ?');
      values.push(bookData.copies);
    }
    if (bookData.coverImage) {
      fields.push('coverImage = ?');
      values.push(bookData.coverImage);
    }

    if (fields.length === 0) return callback(null, { message: 'No fields to update' });

    db.run(
      `UPDATE Book SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { id, changes: this.changes });
      }
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM Book WHERE id = ?', [id], function (err) {
      if (err) return callback(err);
      callback(null, { changes: this.changes });
    });
  }

  static countAllBooks(callback) {
    db.get('SELECT COUNT(*) as count FROM Book', callback);
  }

  static getTopBorrowedBooks(limit = 10, callback) {
    db.all(`
      SELECT b.*, COUNT(br.bookId) as borrowCount
      FROM Borrow br
      JOIN Book b ON br.bookId = b.id
      GROUP BY br.bookId
      ORDER BY borrowCount DESC
      LIMIT ?
    `, [limit], callback);
  }
}

module.exports = Book;

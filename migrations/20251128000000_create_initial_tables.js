'use strict';

exports.up = function() {
  return `
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role TEXT CHECK(role IN ('admin', 'librarian', 'member')) NOT NULL DEFAULT 'member',
      profilePhoto VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      description TEXT,
      genre VARCHAR(255),
      copies INTEGER NOT NULL DEFAULT 0,
      coverImage VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Review (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      reviewText TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES Book (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS BookCategories (
      bookId INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      PRIMARY KEY (bookId, categoryId),
      FOREIGN KEY (bookId) REFERENCES Book (id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES Category (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Borrow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      borrowDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      dueDate DATETIME NOT NULL,
      returnDate DATETIME,
      status TEXT CHECK(status IN ('borrowed', 'returned', 'overdue')) NOT NULL DEFAULT 'borrowed',
      fineAmount REAL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES Book (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      position INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES Book (id) ON DELETE CASCADE,

      UNIQUE(userId, bookId)
    );

    CREATE TABLE IF NOT EXISTS ActivityLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action VARCHAR(255) NOT NULL,
      metadata TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User (id) ON DELETE SET NULL
    );
  `;
};

exports.down = function() {
  return `
    DROP TABLE IF EXISTS ActivityLog;
    DROP TABLE IF EXISTS Waitlist;
    DROP TABLE IF EXISTS Borrow;
    DROP TABLE IF EXISTS BookCategories;
    DROP TABLE IF EXISTS Category;
    DROP TABLE IF EXISTS Review;
    DROP TABLE IF EXISTS Book;
    DROP TABLE IF EXISTS User;
  `;
};

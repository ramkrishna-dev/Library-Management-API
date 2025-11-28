const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static findByEmail(email, callback) {
    db.get('SELECT * FROM User WHERE email = ?', [email], callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM User WHERE id = ?', [id], callback);
  }

  static create(userData, callback) {
    bcrypt.hash(userData.password, 12, (err, hash) => {
      if (err) return callback(err);
      userData.password = hash;
      const { name, email, password, role, profilePhoto } = userData;
      db.run(
        'INSERT INTO User (name, email, password, role, profilePhoto) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, role, profilePhoto],
        function (err) {
          if (err) return callback(err);
          callback(null, { id: this.lastID, ...userData });
        }
      );
    });
  }

  static comparePasswords(candidatePassword, hashedPassword, callback) {
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  }

  static update(id, userData, callback) {
    const fields = [];
    const values = [];
    if (userData.name) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.profilePhoto) {
      fields.push('profilePhoto = ?');
      values.push(userData.profilePhoto);
    }
    if (userData.role) {
      fields.push('role = ?');
      values.push(userData.role);
    }

    if (fields.length === 0) return callback(null, { message: 'No fields to update' });

    db.run(
      `UPDATE User SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { id, changes: this.changes });
      }
    );
  }

  static updatePassword(id, newPassword, callback) {
    bcrypt.hash(newPassword, 12, (err, hash) => {
      if (err) return callback(err);
      db.run(
        'UPDATE User SET password = ? WHERE id = ?',
        [hash, id],
        function (err) {
          if (err) return callback(err);
          callback(null, { id, changes: this.changes });
        }
      );
    });
  }

  static updateRole(id, role, callback) {
    db.run(
      'UPDATE User SET role = ? WHERE id = ?',
      [role, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { id, changes: this.changes });
      }
    );
  }

  static countAllUsers(callback) {
    db.get('SELECT COUNT(*) as count FROM User', callback);
  }
}

module.exports = User;

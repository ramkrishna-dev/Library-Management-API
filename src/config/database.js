const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../library.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    runMigrations();
  }
});

function runMigrations() {
    const migrationsDir = path.join(__dirname, '../../migrations');
    fs.readdir(migrationsDir, (err, files) => {
        if (err) {
            return console.error('Could not list the directory.', err);
        }

        files.sort().forEach(file => {
            if (path.extname(file) === '.js') {
                const migration = require(path.join(migrationsDir, file));
                if (typeof migration.up === 'function') {
                    console.log(`Running migration: ${file}`);
                    db.exec(migration.up(), (err) => {
                        if (err) {
                            console.error(`Error running migration ${file}:`, err);
                        }
                    });
                }
            }
        });
    });
}


module.exports = db;

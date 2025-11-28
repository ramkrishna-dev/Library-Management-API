const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Use /tmp directory for the database in a Vercel environment
const isVercel = process.env.VERCEL;
const dbPath = isVercel ? path.join('/tmp', 'library.db') : (process.env.DB_PATH || path.join(__dirname, '../../library.db'));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
    runMigrations();
  }
});

function runMigrations() {
    const migrationsDir = path.join(__dirname, '../../migrations');
    // In a serverless environment, migrations should be run as part of the build/deployment process.
    // For simplicity here, we run them on startup.
    // Check if the User table exists as a proxy for whether migrations have run.
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='User'", (err, table) => {
        if (err) {
            return console.error("Error checking for migrations:", err);
        }
        if (!table) {
            console.log("No tables found, running migrations...");
            fs.readdir(migrationsDir, (err, files) => {
                if (err) {
                    return console.error('Could not list the migrations directory.', err);
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
        } else {
            console.log("Database tables already exist. Skipping migrations.");
        }
    });
}


module.exports = db;

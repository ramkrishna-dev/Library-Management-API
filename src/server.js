const app = require('./app');
const db = require('./config/database');
const overdueJob = require('./jobs/overdueJob');
require('dotenv').config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
  overdueJob.start();
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  overdueJob.stop();
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    server.close(() => {
        console.log('Process terminated!');
    });
  });
});

const cron = require('node-cron');
const Borrow = require('../models/Borrow');
const sendEmail = require('../services/emailService');

// Schedule a job to run every day at midnight
const overdueJob = cron.schedule('0 0 * * *', () => {
  console.log('Running daily check for overdue books...');
  Borrow.findOverdueWithUserDetails(async (err, overdueBorrows) => {
    if (err) {
      console.error('Error finding overdue books:', err);
      return;
    }

    if (overdueBorrows.length === 0) {
      console.log('No overdue books found.');
      return;
    }

    for (const borrow of overdueBorrows) {
      try {
        await sendEmail({
          email: borrow.email,
          subject: 'Overdue Book Reminder',
          message: `Your borrowed book, "${borrow.bookTitle}", is overdue. Please return it as soon as possible to avoid further fines.`,
        });

        Borrow.markAsOverdue(borrow.id, (err, result) => {
          if (err) {
            console.error(`Error marking borrow ID ${borrow.id} as overdue:`, err);
          } else {
            console.log(`Borrow ID ${borrow.id} marked as overdue and reminder sent.`);
          }
        });
      } catch (emailErr) {
        console.error(`Failed to send overdue reminder for borrow ID ${borrow.id}:`, emailErr);
      }
    }
  });
});

module.exports = overdueJob;


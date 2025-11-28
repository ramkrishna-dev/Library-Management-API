const express = require('express');
const waitlistController = require('../controllers/waitlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Waitlist
 *   description: The book waitlist system API
 */

router.use(authMiddleware.protect);

/**
 * @swagger
 * /waitlist/book/{bookId}:
 *   post:
 *     summary: Join the waitlist for a book
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       201:
 *         description: Successfully joined waitlist
 *       400:
 *         description: Book is available or already on waitlist
 *       404:
 *         description: Book not found
 */
router.route('/book/:bookId')
    .post(authMiddleware.restrictTo('member'), waitlistController.joinWaitlist)
/**
 * @swagger
 * /waitlist/book/{bookId}:
 *   delete:
 *     summary: Leave the waitlist for a book
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Successfully left waitlist
 *       404:
 *         description: Not on waitlist for this book
 */
    .delete(authMiddleware.restrictTo('member'), waitlistController.leaveWaitlist)
/**
 * @swagger
 * /waitlist/book/{bookId}:
 *   get:
 *     summary: Get the waitlist for a book (Admin/Librarian)
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: A list of users on the waitlist
 */
    .get(authMiddleware.restrictTo('admin', 'librarian'), waitlistController.getWaitlistForBook);

module.exports = router;

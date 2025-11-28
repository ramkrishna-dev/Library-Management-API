const express = require('express');
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Borrow
 *   description: The book borrowing system API
 */

router.use(authMiddleware.protect);

/**
 * @swagger
 * /borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *       400:
 *         description: Book unavailable or borrow limit reached
 *       404:
 *         description: Book not found
 */
router.post('/', authMiddleware.restrictTo('member'), borrowController.borrowBook);

/**
 * @swagger
 * /borrow/return/{borrowId}:
 *   patch:
 *     summary: Return a borrowed book
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The borrow record ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Book already returned
 *       404:
 *         description: Borrow record not found
 */
router.patch('/return/:borrowId', authMiddleware.restrictTo('member'), borrowController.returnBook);

/**
 * @swagger
 * /borrow/history:
 *   get:
 *     summary: Get personal borrow history
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of borrow records
 */
router.get('/history', authMiddleware.restrictTo('member'), borrowController.getBorrowHistory);

/**
 * @swagger
 * /borrow/all:
 *   get:
 *     summary: Get all currently borrowed books (Admin/Librarian)
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all active borrow records
 */
router.get(
    '/all',
    authMiddleware.restrictTo('admin', 'librarian'),
    borrowController.getAllBorrowedBooks
);

module.exports = router;

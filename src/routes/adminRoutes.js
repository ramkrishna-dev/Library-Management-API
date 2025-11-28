const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCsv } = require('../utils/multerFile');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: The admin tools and management API
 */

router.use(authMiddleware.protect, authMiddleware.restrictTo('admin', 'librarian'));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin/Librarian)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /admin/overdue-books:
 *   get:
 *     summary: List all overdue books (Admin/Librarian)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of overdue books
 */
router.get('/overdue-books', adminController.listOverdueBooks);

/**
 * @swagger
 * /admin/top-books:
 *   get:
 *     summary: List top 10 most borrowed books (Admin/Librarian)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of top borrowed books
 */
router.get('/top-books', adminController.listTopBorrowedBooks);

/**
 * @swagger
 * /admin/export-books:
 *   get:
 *     summary: Export all books to a CSV file (Admin/Librarian)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A CSV file of all books
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export-books', adminController.exportBooks);

/**
 * @swagger
 * /admin/import-books:
 *   post:
 *     summary: Bulk import books from a CSV file (Admin/Librarian)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Bulk import process finished
 */
router.post('/import-books', uploadCsv, adminController.bulkImportBooks);

module.exports = router;

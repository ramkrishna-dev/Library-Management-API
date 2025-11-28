const express = require('express');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - copies
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         description:
 *           type: string
 *           description: A short description of the book
 *         genre:
 *           type: string
 *           description: The book genre
 *         copies:
 *           type: integer
 *           description: Number of available copies
 *         coverImage:
 *           type: string
 *           description: URL to the book's cover image
 *       example:
 *         id: 1
 *         title: "The Hitchhiker's Guide to the Galaxy"
 *         author: "Douglas Adams"
 *         copies: 5
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

// Nested route for reviews
router.use('/:bookId/reviews', reviewRouter);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: The offset for pagination
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, author, or description
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.route('/')
  .get(bookController.getAllBooks)
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               copies:
 *                 type: integer
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       403:
 *         description: Forbidden
 */
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'librarian'),
    bookController.uploadBookCover,
    bookController.resizeBookCover,
    bookController.addBook
  );

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 */
router.route('/:id')
  .get(bookController.getBook)
/**
 * @swagger
 * /books/{id}:
 *  patch:
 *    summary: Update the book by the id
 *    tags: [Books]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: The book id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    responses:
 *      200:
 *        description: The book was updated
 *      404:
 *        description: The book was not found
 *      403:
 *        description: Forbidden
 */
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'librarian'),
    bookController.uploadBookCover,
    bookController.resizeBookCover,
    bookController.updateBook
  )
/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *
 *     responses:
 *       204:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 *       403:
 *         description: Forbidden
 */
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'librarian'),
    bookController.deleteBook
  );

module.exports = router;

const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - rating
 *         - reviewText
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the review
 *         userId:
 *           type: integer
 *           description: The id of the user who wrote the review
 *         bookId:
 *           type: integer
 *           description: The id of the book being reviewed
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: The star rating (1-5)
 *         reviewText:
 *           type: string
 *           description: The text content of the review
 *       example:
 *         id: 1
 *         userId: 1
 *         bookId: 1
 *         rating: 5
 *         reviewText: "Absolutely fantastic read!"
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: The reviews managing API
 */

router.use(authMiddleware.protect);

/**
 * @swagger
 * /books/{bookId}/reviews:
 *   get:
 *     summary: Get all reviews for a specific book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: A list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router
  .route('/')
  .get(reviewController.getBookReviews)
/**
 * @swagger
 * /books/{bookId}/reviews:
 *   post:
 *     summary: Add a review for a book
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               reviewText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
  .post(
    authMiddleware.restrictTo('member'),
    reviewController.setBookUserIds,
    reviewController.addReview
  );

/**
 * @swagger
 * /books/{bookId}/reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               reviewText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
router
  .route('/:id')
  .patch(
    authMiddleware.restrictTo('member'),
    reviewController.updateReview
  )
/**
 * @swagger
 * /books/{bookId}/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review id
 *     responses:
 *       204:
 *         description: Review deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
  .delete(
    authMiddleware.restrictTo('member', 'admin', 'librarian'),
    reviewController.deleteReview
  );

module.exports = router;

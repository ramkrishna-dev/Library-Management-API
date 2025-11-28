const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: The book recommendation system API
 */

router.use(authMiddleware.protect);

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get book recommendations for the current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of recommended books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/', recommendationController.getRecommendations);

module.exports = router;

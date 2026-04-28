const express    = require('express');
const router     = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories (public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a single category by ID (public)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string, example: Electronics }
 *               description: { type: string, example: Gadgets and devices }
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticate, requireAdmin, ctrl.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticate, requireAdmin, ctrl.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;

const express = require('express');
const router  = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/productController');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with optional filtering & pagination (public)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: integer }
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:  { type: integer }
 *                     page:   { type: integer }
 *                     limit:  { type: integer }
 *                     pages:  { type: integer }
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID (public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:        { type: string,  example: Wireless Headphones }
 *               description: { type: string,  example: Noise-cancelling headphones }
 *               price:       { type: number,  example: 89.99 }
 *               stock:       { type: integer, example: 50 }
 *               category_id: { type: integer, example: 1 }
 *               image_url:   { type: string,  example: "https://example.com/img.jpg" }
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 */
router.post('/', authenticate, requireAdmin, ctrl.create);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
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
 *               price:       { type: number }
 *               stock:       { type: integer }
 *               category_id: { type: integer }
 *               image_url:   { type: string }
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticate, requireAdmin, ctrl.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;

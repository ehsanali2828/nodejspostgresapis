const express = require('express');
const router  = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/stats:
 *   get:
 *     summary: Get order statistics (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_orders:    { type: integer }
 *                 total_revenue:   { type: number }
 *                 avg_order_value: { type: number }
 *                 pending:         { type: integer }
 *                 confirmed:       { type: integer }
 *                 shipped:         { type: integer }
 *                 delivered:       { type: integer }
 *                 cancelled:       { type: integer }
 */
router.get('/stats', authenticate, requireAdmin, ctrl.getStats);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders (admin sees all; customers see their own)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 */
router.get('/', authenticate, ctrl.getAll);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order with line items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order with items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - { $ref: '#/components/schemas/Order' }
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:   { type: integer }
 *                           product_name: { type: string }
 *                           quantity:     { type: integer }
 *                           unit_price:   { type: number }
 *                           subtotal:     { type: number }
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, ctrl.getOne);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order (authenticated customers)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id: { type: integer, example: 1 }
 *                     quantity:   { type: integer, example: 2 }
 *               notes: { type: string, example: "Leave at door" }
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order:   { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Validation error or insufficient stock
 */
router.post('/', authenticate, ctrl.create);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404:
 *         description: Not found
 */
router.patch('/:id/status', authenticate, requireAdmin, ctrl.updateStatus);

module.exports = router;

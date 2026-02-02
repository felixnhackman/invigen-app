/**
 * PHASE 8.5: Subscription routes with authentication
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMySubscription, updateSubscription, verifyPayment } from '../controllers/subscription.controller.js';

const router = express.Router();

// PHASE 8.5: All subscription routes require authentication
router.use(authMiddleware);

// GET /api/subscriptions/me - Get current user's subscription
router.get('/me', getMySubscription);

// POST /api/subscriptions/update - Update subscription (admin/webhook)
router.post('/update', updateSubscription);

// POST /api/subscriptions/verify - Verify Paystack payment and activate PRO
router.post('/verify', verifyPayment);

export default router;

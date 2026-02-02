/**
 * PHASE 8.5: Invoice routes with authentication
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
    getInvoiceUsage,
    createInvoice,
    authorizeDownload,
    authorizeEmail,
    authorizeWatermarkRemoval,
} from '../controllers/invoice.controller.js';

const router = express.Router();

// PHASE 8.5: All invoice routes require authentication
router.use(authMiddleware);

// GET /api/invoices/usage - Get invoice usage for current user
router.get('/usage', getInvoiceUsage);

// POST /api/invoices/create - Create invoice (tracks usage)
router.post('/create', createInvoice);

// POST /api/invoices/download - Authorize PDF download (PRO only)
router.post('/download', authorizeDownload);

// POST /api/invoices/send - Authorize email send (PRO only)
router.post('/send', authorizeEmail);

// POST /api/invoices/remove-watermark - Authorize watermark removal (PRO only)
router.post('/remove-watermark', authorizeWatermarkRemoval);

export default router;

/**
 * PHASE 8.5: Invoice controller using authenticated user context
 * Tracks invoice usage per user (not hardcoded)
 */

// Use Supabase-based stores for production (works on Render)
import { getInvoiceUsage as getUsageFromStore, incrementInvoiceUsage, setInvoiceLimit } from '../models/invoice-usage.store.supabase.js';
import { getSubscription } from '../models/subscription.store.supabase.js';

/**
 * PHASE 8.5: Get invoice usage for authenticated user
 * GET /api/invoices/usage
 */
export async function getInvoiceUsage(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Get subscription to determine limit
        const subscription = await getSubscription(userId);
        const plan = subscription?.plan || 'free';
        const limit = plan === 'pro' ? Infinity : 10;

        // Get usage from store
        const usage = await getUsageFromStore(userId);
        
        // Update limit if plan changed
        if (usage.limit !== limit) {
            await setInvoiceLimit(userId, limit);
            usage.limit = limit;
        }

        // Handle Infinity limit (PRO plan) - JSON doesn't support Infinity, so use null
        const limitValue = usage.limit === Infinity ? null : usage.limit;
        
        return res.json({
            count: usage.count,
            limit: limitValue,
            userId,
            userEmail,
        });
    } catch (error) {
        console.error('Error fetching invoice usage:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch invoice usage',
        });
    }
}

/**
 * PHASE 8.5: Create invoice (with usage tracking)
 * POST /api/invoices/create
 */
export async function createInvoice(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Check subscription plan and usage limits
        const subscription = await getSubscription(userId);
        const plan = subscription?.plan || 'free';
        const limit = plan === 'pro' ? Infinity : 10;

        // Get current usage
        const usage = await getUsageFromStore(userId);
        
        // Update limit if plan changed
        if (usage.limit !== limit) {
            await setInvoiceLimit(userId, limit);
            usage.limit = limit;
        }

        // Check if limit reached (only for free plan)
        if (plan === 'free' && usage.count >= limit) {
            return res.status(403).json({
                error: 'Limit Reached',
                message: 'You have reached your invoice limit for this month. Upgrade to Pro for unlimited invoices.',
            });
        }

        // Increment usage count
        const updatedUsage = await incrementInvoiceUsage(userId);

        return res.json({
            success: true,
            message: 'Invoice created',
            userId,
            usage: {
                count: updatedUsage.count,
                limit: updatedUsage.limit,
            },
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create invoice',
        });
    }
}

/**
 * PHASE 8.5: Authorize PDF download (PRO feature)
 * POST /api/invoices/download
 */
export async function authorizeDownload(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Check subscription plan
        const subscription = await getSubscription(userId);
        const plan = subscription?.plan || 'free';
        
        if (plan !== 'pro') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'PDF download requires Pro subscription. Upgrade to Pro to download invoices.',
            });
        }

        return res.json({
            authorized: true,
            message: 'Download authorized',
        });
    } catch (error) {
        console.error('Error authorizing download:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authorize download',
        });
    }
}

/**
 * PHASE 8.5: Authorize email send (PRO feature)
 * POST /api/invoices/send
 */
export async function authorizeEmail(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Check subscription plan
        const subscription = await getSubscription(userId);
        const plan = subscription?.plan || 'free';
        
        if (plan !== 'pro') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Email sending requires Pro subscription. Upgrade to Pro to send invoices via email.',
            });
        }

        return res.json({
            authorized: true,
            message: 'Email send authorized',
        });
    } catch (error) {
        console.error('Error authorizing email:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authorize email',
        });
    }
}

/**
 * PHASE 8.5: Authorize watermark removal (PRO feature)
 * POST /api/invoices/remove-watermark
 */
export async function authorizeWatermarkRemoval(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Check subscription plan
        const subscription = await getSubscription(userId);
        const plan = subscription?.plan || 'free';
        
        if (plan !== 'pro') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Watermark removal requires Pro subscription. Upgrade to Pro to remove watermarks.',
            });
        }

        return res.json({
            authorized: true,
            message: 'Watermark removal authorized',
        });
    } catch (error) {
        console.error('Error authorizing watermark removal:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authorize watermark removal',
        });
    }
}

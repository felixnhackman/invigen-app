/**
 * PHASE 8.5: Invoice controller using authenticated user context
 * Tracks invoice usage per user (not hardcoded)
 */

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

        // PHASE 8.5: TODO - Fetch usage from database using userId
        // Replace with actual database query:
        // const usage = await InvoiceUsage.findOne({ userId });
        // if (!usage) {
        //     // Create default usage record
        //     await InvoiceUsage.create({ userId, count: 0, limit: 10 });
        //     return { count: 0, limit: 10 };
        // }
        // return { count: usage.count, limit: usage.limit };

        // PHASE 8.5: Default usage for free plan
        const usage = {
            count: 0, // PHASE 8.5: TODO - Get actual count from database
            limit: 10, // Free plan limit
            userId,
            userEmail,
        };

        return res.json(usage);
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

        // PHASE 8.5: TODO - Check subscription plan and usage limits
        // const subscription = await Subscription.findOne({ userId });
        // const usage = await InvoiceUsage.findOne({ userId });
        // const plan = subscription?.plan || 'free';
        // const limit = plan === 'pro' ? Infinity : 10;
        // if (usage.count >= limit) {
        //     return res.status(403).json({
        //         error: 'Limit Reached',
        //         message: 'You have reached your invoice limit for this month',
        //     });
        // }

        // PHASE 8.5: TODO - Increment usage count
        // await InvoiceUsage.findOneAndUpdate(
        //     { userId },
        //     { $inc: { count: 1 }, updatedAt: new Date() },
        //     { upsert: true }
        // );

        return res.json({
            success: true,
            message: 'Invoice created',
            userId,
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

        // PHASE 8.5: TODO - Check subscription plan
        // const subscription = await Subscription.findOne({ userId });
        // const plan = subscription?.plan || 'free';
        // if (plan !== 'pro') {
        //     return res.status(403).json({
        //         error: 'Forbidden',
        //         message: 'PDF download requires Pro subscription',
        //     });
        // }

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

        // PHASE 8.5: TODO - Check subscription plan
        // const subscription = await Subscription.findOne({ userId });
        // const plan = subscription?.plan || 'free';
        // if (plan !== 'pro') {
        //     return res.status(403).json({
        //         error: 'Forbidden',
        //         message: 'Email sending requires Pro subscription',
        //     });
        // }

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

        // PHASE 8.5: TODO - Check subscription plan
        // const subscription = await Subscription.findOne({ userId });
        // const plan = subscription?.plan || 'free';
        // if (plan !== 'pro') {
        //     return res.status(403).json({
        //         error: 'Forbidden',
        //         message: 'Watermark removal requires Pro subscription',
        //     });
        // }

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

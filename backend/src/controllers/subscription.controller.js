/**
 * PHASE 8.5: Subscription controller using authenticated user context
 * Uses req.user.email (or id) instead of hardcoded user data
 */

// PHASE 8.5: TODO - Replace with actual database queries
// This is a placeholder implementation that should be replaced with real DB access

/**
 * PHASE 8.5: Get subscription for authenticated user
 * GET /api/subscriptions/me
 */
export async function getMySubscription(req, res) {
    try {
        // PHASE 8.5: Use authenticated user from middleware
        const userEmail = req.user?.email;
        const userId = req.user?.id;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // PHASE 8.5: TODO - Fetch subscription from database using userId or userEmail
        // For now, return default FREE plan
        // Replace this with actual database query:
        // const subscription = await Subscription.findOne({ userId });
        // if (!subscription) return { plan: 'free' };

        const subscription = {
            plan: 'free', // PHASE 8.5: Default to free if no subscription found
            userId,
            userEmail,
            createdAt: new Date().toISOString(),
        };

        return res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch subscription',
        });
    }
}

/**
 * PHASE 8.5: Update subscription (for webhook or admin use)
 * POST /api/subscriptions/update
 */
export async function updateSubscription(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;
        const { plan } = req.body;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        if (!plan || !['free', 'pro'].includes(plan)) {
            return res.status(400).json({
                error: 'Invalid Request',
                message: 'Plan must be "free" or "pro"',
            });
        }

        // PHASE 8.5: TODO - Update subscription in database
        // Replace with actual database update:
        // await Subscription.findOneAndUpdate(
        //     { userId },
        //     { plan, updatedAt: new Date() },
        //     { upsert: true }
        // );

        return res.json({
            plan,
            userId,
            userEmail,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update subscription',
        });
    }
}

/**
 * PHASE 8.5: Subscription controller using authenticated user context
 * Uses req.user.email (or id) instead of hardcoded user data
 */

// Use Supabase-based stores for production (works on Render)
import { getSubscription, setPlan, updateSubscription as updateSubscriptionInStore } from '../models/subscription.store.supabase.js';
import { setInvoiceLimit } from '../models/invoice-usage.store.supabase.js';

// PHASE 8.5: TODO - Replace with actual database queries
// Currently using in-memory storage - replace with Supabase/PostgreSQL in production

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

        // PHASE 8.5: Get subscription from Supabase database
        const subscriptionData = await getSubscription(userId);
        
        const subscription = {
            plan: subscriptionData.plan || 'free',
            userId,
            userEmail,
            ...subscriptionData,
            // Ensure createdAt exists
            createdAt: subscriptionData.createdAt || new Date().toISOString(),
            // Calculate days until expiration for PRO users
            daysUntilExpiration: subscriptionData.expiresAt 
                ? Math.ceil((new Date(subscriptionData.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                : null,
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

/**
 * CRITICAL FIX: Verify Paystack payment and activate PRO subscription
 * POST /api/subscriptions/verify
 */
export async function verifyPayment(req, res) {
    try {
        const userEmail = req.user?.email;
        const userId = req.user?.id;
        const { reference } = req.body;

        if (!userEmail || !userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        if (!reference) {
            return res.status(400).json({
                error: 'Invalid Request',
                message: 'Payment reference is required',
            });
        }

        // CRITICAL: Verify payment with Paystack
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            console.error('Paystack secret key not configured');
            return res.status(500).json({
                error: 'Configuration Error',
                message: 'Payment verification service not configured',
            });
        }

        // Verify transaction with Paystack API
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json().catch(() => ({}));
            console.error('Paystack verification failed:', errorData);
            return res.status(400).json({
                error: 'Payment Verification Failed',
                message: 'Could not verify payment. Please contact support.',
            });
        }

        const paystackData = await verifyResponse.json();

        // Check if payment was successful
        if (paystackData.status !== true || paystackData.data.status !== 'success') {
            return res.status(400).json({
                error: 'Payment Not Successful',
                message: 'Payment was not completed successfully.',
            });
        }

        // Verify amount matches expected (₵2 = 200 kobo)
        const expectedAmount = 200; // ₵2 in kobo
        const paidAmount = paystackData.data.amount;
        if (paidAmount !== expectedAmount) {
            console.error(`Amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
            return res.status(400).json({
                error: 'Payment Amount Mismatch',
                message: 'Payment amount does not match expected value.',
            });
        }

        // Verify customer email matches
        if (paystackData.data.customer.email !== userEmail) {
            console.error(`Email mismatch: expected ${userEmail}, got ${paystackData.data.customer.email}`);
            return res.status(400).json({
                error: 'Payment Verification Failed',
                message: 'Payment email does not match your account.',
            });
        }

        // CRITICAL: Update subscription to PRO in Supabase database
        const activatedAt = new Date();
        const expiresAt = new Date(activatedAt);
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from activation
        
        // Store subscription with payment details
        const subscriptionWithPayment = {
            plan: 'pro',
            userId,
            userEmail,
            paystackReference: reference,
            paystackCustomerCode: paystackData.data.customer.customer_code,
            activatedAt: activatedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            createdAt: activatedAt.toISOString(),
        };
        
        // Update database
        console.log(`📝 Attempting to save subscription to Supabase for user ${userId}...`);
        try {
            await updateSubscriptionInStore(userId, subscriptionWithPayment);
            console.log(`✅ Subscription saved to Supabase successfully`);
        } catch (updateError) {
            console.error('❌ Failed to save subscription to Supabase:', updateError);
            throw updateError;
        }
        
        // Set invoice limit to unlimited for PRO users
        console.log(`📝 Setting invoice limit to unlimited for user ${userId}...`);
        try {
            await setInvoiceLimit(userId, Infinity);
            console.log(`✅ Invoice limit set successfully`);
        } catch (limitError) {
            console.error('❌ Failed to set invoice limit:', limitError);
            // Don't throw - subscription is more important than limit
        }

        // Verify the subscription was saved by fetching it back
        console.log(`🔍 Verifying subscription was saved...`);
        const verifySub = await getSubscription(userId);
        console.log(`📊 Retrieved subscription:`, verifySub);

        console.log(`✅ Subscription updated to PRO for user ${userId} (${userEmail})`);

        // Return updated subscription
        return res.json({
            plan: 'pro',
            userId,
            userEmail,
            paystackReference: reference,
            activatedAt: subscriptionWithPayment.activatedAt,
            expiresAt: subscriptionWithPayment.expiresAt,
            message: 'Subscription activated successfully',
            verified: verifySub.plan === 'pro',
        });
    } catch (error) {
        console.error('❌ Error verifying payment:', error);
        console.error('   Error stack:', error.stack);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify payment',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}

/**
 * Paystack Webhook Handler
 * Handles Paystack payment webhook events
 * POST /api/webhooks/paystack
 */

import crypto from 'crypto';
import { updateSubscription as updateSubscriptionInStore } from '../models/subscription.store.supabase.js';
import { setInvoiceLimit } from '../models/invoice-usage.store.supabase.js';

/**
 * Verify Paystack webhook signature
 */
function verifyPaystackSignature(rawBody, signature, secret) {
    if (!secret) {
        console.warn('⚠️  Paystack secret key not configured - skipping signature verification');
        return true; // Allow in development if secret not set
    }

    if (!signature) {
        console.error('❌ No signature provided in webhook');
        return false;
    }

    const hash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

    const isValid = hash === signature;
    
    if (!isValid) {
        console.error('❌ Signature mismatch');
        console.error('   Expected:', hash);
        console.error('   Received:', signature);
    }

    return isValid;
}

/**
 * Get user ID from email using Supabase
 */
async function getUserIdFromEmail(email) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase not configured');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // Get user by email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
        console.error('Error fetching users:', error);
        throw error;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error(`User not found for email: ${email}`);
    }

    return user.id;
}

/**
 * Handle Paystack webhook events
 */
export async function handlePaystackWebhook(req, res) {
    try {
        const signature = req.headers['x-paystack-signature'];
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        const rawBody = req.rawBody || JSON.stringify(req.body);

        // Verify webhook signature using raw body
        if (!verifyPaystackSignature(rawBody, signature, paystackSecretKey)) {
            console.error('❌ Invalid webhook signature');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid webhook signature',
            });
        }

        const event = req.body;

        console.log('📨 Paystack webhook received:', event.event);

        // Handle charge.success event
        if (event.event === 'charge.success') {
            const transaction = event.data;
            
            console.log('💰 Processing successful payment:');
            console.log('   - Reference:', transaction.reference);
            console.log('   - Amount:', transaction.amount);
            console.log('   - Currency:', transaction.currency);
            console.log('   - Customer email:', transaction.customer?.email);

            // Verify transaction was successful
            if (transaction.status !== 'success') {
                console.warn('⚠️  Transaction status is not success:', transaction.status);
                return res.status(200).json({ received: true, message: 'Transaction not successful, skipping' });
            }

            // Get user ID from email
            const customerEmail = transaction.customer?.email;
            if (!customerEmail) {
                console.error('❌ No customer email in transaction');
                return res.status(400).json({
                    error: 'Invalid Request',
                    message: 'Customer email not found in transaction',
                });
            }

            let userId;
            try {
                userId = await getUserIdFromEmail(customerEmail);
                console.log('✅ Found user ID:', userId, 'for email:', customerEmail);
            } catch (error) {
                console.error('❌ Failed to get user ID from email:', error);
                return res.status(404).json({
                    error: 'User Not Found',
                    message: `No user found with email: ${customerEmail}`,
                });
            }

            // Activate PRO subscription
            const activatedAt = new Date();
            const expiresAt = new Date(activatedAt);
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from activation

            const subscriptionData = {
                plan: 'pro',
                userId,
                userEmail: customerEmail,
                paystackReference: transaction.reference,
                paystackCustomerCode: transaction.customer?.customer_code || null,
                activatedAt: activatedAt.toISOString(),
                expiresAt: expiresAt.toISOString(),
                createdAt: activatedAt.toISOString(),
            };

            console.log('📝 Activating PRO subscription via webhook...');
            await updateSubscriptionInStore(userId, subscriptionData);

            // Set invoice limit to unlimited for PRO users
            try {
                await setInvoiceLimit(userId, Infinity);
                console.log('✅ Invoice limit set to unlimited');
            } catch (limitError) {
                console.error('⚠️  Failed to set invoice limit:', limitError);
                // Don't fail the webhook if limit setting fails
            }

            console.log('✅ Webhook processed successfully - PRO subscription activated');
            return res.status(200).json({
                received: true,
                message: 'Subscription activated successfully',
            });
        }

        // Handle other events (just acknowledge)
        console.log('ℹ️  Webhook event acknowledged:', event.event);
        return res.status(200).json({
            received: true,
            message: 'Webhook received',
        });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        console.error('   Error stack:', error.stack);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process webhook',
        });
    }
}


/**
 * Subscription store using Supabase database
 * Replaces file-based storage for production use
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase admin client
const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

/**
 * Get subscription for a user
 */
export async function getSubscription(userId) {
    if (!supabaseAdmin) {
        console.error('❌ Supabase not configured! Check environment variables:');
        console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
        console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
        console.warn('⚠️  Returning default free plan - subscriptions will not persist!');
        return { plan: 'free' };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Error fetching subscription from Supabase:', error);
            console.error('   Error code:', error.code);
            console.error('   Error message:', error.message);
            console.error('   User ID:', userId);
            return { plan: 'free' };
        }

        if (!data) {
            console.log(`ℹ️  No subscription found for user ${userId}, returning free plan`);
            return { plan: 'free' };
        }
        
        console.log(`✅ Found subscription for user ${userId}:`, data.plan);

        return {
            plan: data.plan || 'free',
            userId: data.user_id,
            paystackReference: data.paystack_reference,
            paystackCustomerCode: data.paystack_customer_code,
            activatedAt: data.activated_at,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return { plan: 'free' };
    }
}

/**
 * Update subscription for a user
 */
export async function updateSubscription(userId, subscriptionData) {
    if (!supabaseAdmin) {
        console.error('❌ Cannot update subscription: Supabase not configured!');
        console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
        console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
        throw new Error('Supabase not configured - check environment variables');
    }

    try {
        console.log(`📝 Updating subscription for user ${userId}:`, subscriptionData.plan);
        
        // BEFORE INSERT: Log the payload being sent
        const updateData = {
            plan: subscriptionData.plan || 'free',
            paystack_reference: subscriptionData.paystackReference || null,
            paystack_customer_code: subscriptionData.paystackCustomerCode || null,
            activated_at: subscriptionData.activatedAt || null,
            expires_at: subscriptionData.expiresAt || null,
            updated_at: new Date().toISOString(),
        };

        const payload = {
            user_id: userId,
            ...updateData,
        };

        console.log('🔍 BEFORE INSERT - Payload being sent to Supabase:');
        console.log('INSERT PAYLOAD:', JSON.stringify(payload, null, 2));
        console.log('   - user_id (UUID):', userId);
        console.log('   - plan:', payload.plan);
        console.log('   - paystack_reference:', payload.paystack_reference);
        console.log('   - paystack_customer_code:', payload.paystack_customer_code);
        console.log('   - activated_at:', payload.activated_at);
        console.log('   - expires_at:', payload.expires_at);

        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .upsert(payload, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        // AFTER INSERT: Log the result
        if (error) {
            console.error('❌ AFTER INSERT - Error occurred:');
            console.error('INSERT RESULT:', { data: null, error });
            console.error('   Error code:', error.code);
            console.error('   Error message:', error.message);
            console.error('   Error details:', error.details);
            console.error('   Error hint:', error.hint);
            console.error('   User ID:', userId);
            throw error;
        }

        console.log('✅ AFTER INSERT - Success:');
        console.log('INSERT RESULT:', { data, error: null });
        console.log('   - Inserted/Updated subscription ID:', data.id);
        console.log('   - User ID:', data.user_id);
        console.log('   - Plan:', data.plan);
        console.log('   - Created at:', data.created_at);
        console.log('   - Updated at:', data.updated_at);
        console.log(`✅ Successfully updated subscription for user ${userId}`);

        return {
            plan: data.plan || 'free',
            userId: data.user_id,
            paystackReference: data.paystack_reference,
            paystackCustomerCode: data.paystack_customer_code,
            activatedAt: data.activated_at,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('❌ ON ERROR - Exception caught:');
        console.error('INSERT RESULT:', { data: null, error: error.message });
        console.error('   Error stack:', error.stack);
        throw error;
    }
}

/**
 * Set subscription plan
 */
export async function setPlan(userId, plan) {
    return updateSubscription(userId, { plan });
}

/**
 * Get all subscriptions (for debugging/admin)
 */
export async function getAllSubscriptions() {
    if (!supabaseAdmin) {
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*');

        if (error) {
            console.error('Error fetching all subscriptions:', error);
            return [];
        }

        return (data || []).map(sub => ({
            userId: sub.user_id,
            plan: sub.plan,
            paystackReference: sub.paystack_reference,
            paystackCustomerCode: sub.paystack_customer_code,
            activatedAt: sub.activated_at,
            expiresAt: sub.expires_at,
            createdAt: sub.created_at,
            updatedAt: sub.updated_at,
        }));
    } catch (error) {
        console.error('Error fetching all subscriptions:', error);
        return [];
    }
}

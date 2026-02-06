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
        console.warn('Supabase not configured, returning default free plan');
        return { plan: 'free' };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching subscription:', error);
            return { plan: 'free' };
        }

        if (!data) {
            return { plan: 'free' };
        }

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
        throw new Error('Supabase not configured');
    }

    try {
        const updateData = {
            plan: subscriptionData.plan || 'free',
            paystack_reference: subscriptionData.paystackReference || null,
            paystack_customer_code: subscriptionData.paystackCustomerCode || null,
            activated_at: subscriptionData.activatedAt || null,
            expires_at: subscriptionData.expiresAt || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
                user_id: userId,
                ...updateData,
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }

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
        console.error('Error updating subscription:', error);
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

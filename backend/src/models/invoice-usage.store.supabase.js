/**
 * Invoice usage store using Supabase database
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
 * Get current month and year
 */
function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1, // 1-12
        year: now.getFullYear()
    };
}

/**
 * Get invoice usage for a user
 */
export async function getInvoiceUsage(userId) {
    if (!supabaseAdmin) {
        console.warn('Supabase not configured, returning default usage');
        return { count: 0, limit: 10 };
    }

    try {
        const { month, year } = getCurrentMonthYear();

        const { data, error } = await supabaseAdmin
            .from('invoice_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('month', month)
            .eq('year', year)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching invoice usage:', error);
            return { count: 0, limit: 10 };
        }

        if (!data) {
            // Initialize with default free plan limit
            const defaultUsage = {
                userId,
                count: 0,
                limit: 10, // Free plan limit
                month,
                year,
            };
            
            // Create new record
            const { data: newData, error: insertError } = await supabaseAdmin
                .from('invoice_usage')
                .insert({
                    user_id: userId,
                    count: 0,
                    limit_value: 10,
                    month,
                    year,
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating invoice usage:', insertError);
                return defaultUsage;
            }

            return {
                userId: newData.user_id,
                count: newData.count || 0,
                limit: newData.limit_value === null ? Infinity : (newData.limit_value || 10),
                month: newData.month,
                year: newData.year,
                createdAt: newData.created_at,
                updatedAt: newData.updated_at,
            };
        }

        return {
            userId: data.user_id,
            count: data.count || 0,
            limit: data.limit_value === null ? Infinity : (data.limit_value || 10),
            month: data.month,
            year: data.year,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('Error fetching invoice usage:', error);
        return { count: 0, limit: 10 };
    }
}

/**
 * Increment invoice usage count
 */
export async function incrementInvoiceUsage(userId) {
    if (!supabaseAdmin) {
        throw new Error('Supabase not configured');
    }

    try {
        const { month, year } = getCurrentMonthYear();

        // Get current usage
        const currentUsage = await getInvoiceUsage(userId);

        const { data, error } = await supabaseAdmin
            .from('invoice_usage')
            .upsert({
                user_id: userId,
                count: (currentUsage.count || 0) + 1,
                limit_value: currentUsage.limit === Infinity ? null : currentUsage.limit,
                month,
                year,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,month,year'
            })
            .select()
            .single();

        if (error) {
            console.error('Error incrementing invoice usage:', error);
            throw error;
        }

        return {
            userId: data.user_id,
            count: data.count || 0,
            limit: data.limit_value === null ? Infinity : (data.limit_value || 10),
            month: data.month,
            year: data.year,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('Error incrementing invoice usage:', error);
        throw error;
    }
}

/**
 * Set invoice limit for a user (based on plan)
 */
export async function setInvoiceLimit(userId, limit) {
    if (!supabaseAdmin) {
        throw new Error('Supabase not configured');
    }

    try {
        const { month, year } = getCurrentMonthYear();

        // Get current usage
        const currentUsage = await getInvoiceUsage(userId);

        const { data, error } = await supabaseAdmin
            .from('invoice_usage')
            .upsert({
                user_id: userId,
                count: currentUsage.count || 0,
                limit_value: limit === Infinity ? null : limit,
                month,
                year,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,month,year'
            })
            .select()
            .single();

        if (error) {
            console.error('Error setting invoice limit:', error);
            throw error;
        }

        return {
            userId: data.user_id,
            count: data.count || 0,
            limit: data.limit_value === null ? Infinity : (data.limit_value || 10),
            month: data.month,
            year: data.year,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('Error setting invoice limit:', error);
        throw error;
    }
}

/**
 * Get all usage records (for debugging/admin)
 */
export async function getAllUsage() {
    if (!supabaseAdmin) {
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('invoice_usage')
            .select('*');

        if (error) {
            console.error('Error fetching all invoice usage:', error);
            return [];
        }

        return (data || []).map(usage => ({
            userId: usage.user_id,
            count: usage.count || 0,
            limit: usage.limit_value === null ? Infinity : (usage.limit_value || 10),
            month: usage.month,
            year: usage.year,
            createdAt: usage.created_at,
            updatedAt: usage.updated_at,
        }));
    } catch (error) {
        console.error('Error fetching all invoice usage:', error);
        return [];
    }
}

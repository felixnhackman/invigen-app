/**
 * In-memory subscription store
 * TODO: Replace with actual database (Supabase/PostgreSQL) in production
 */

// In-memory storage: userId -> subscription data
const subscriptions = new Map();

/**
 * Get subscription for a user
 */
export function getSubscription(userId) {
    return subscriptions.get(userId) || { plan: 'free' };
}

/**
 * Update subscription for a user
 */
export function updateSubscription(userId, subscriptionData) {
    const existing = subscriptions.get(userId) || {};
    const updated = {
        ...existing,
        ...subscriptionData,
        updatedAt: new Date().toISOString(),
    };
    subscriptions.set(userId, updated);
    return updated;
}

/**
 * Set subscription plan
 */
export function setPlan(userId, plan) {
    const existing = subscriptions.get(userId) || {};
    const updated = {
        plan,
        userId,
        ...existing,
        updatedAt: new Date().toISOString(),
    };
    subscriptions.set(userId, updated);
    return updated;
}

/**
 * Get all subscriptions (for debugging/admin)
 */
export function getAllSubscriptions() {
    return Array.from(subscriptions.entries()).map(([userId, data]) => ({
        userId,
        ...data,
    }));
}

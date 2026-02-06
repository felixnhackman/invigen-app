/**
 * Subscription store with file-based persistence
 * TODO: Replace with actual database (Supabase/PostgreSQL) in production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_FILE = path.join(__dirname, '..', '..', 'data', 'subscriptions.json');

// Ensure data directory exists
const dataDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Load subscriptions from file
 */
function loadSubscriptions() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading subscriptions from file:', error);
    }
    return {};
}

/**
 * Save subscriptions to file
 */
function saveSubscriptions(subscriptions) {
    try {
        const data = JSON.stringify(subscriptions, null, 2);
        fs.writeFileSync(STORAGE_FILE, data, 'utf8');
        console.log(`✅ Saved ${Object.keys(subscriptions).length} subscription(s) to ${STORAGE_FILE}`);
    } catch (error) {
        console.error('❌ Error saving subscriptions to file:', error);
        console.error('   File path:', STORAGE_FILE);
    }
}

// Initialize from file
const loadedSubscriptions = loadSubscriptions();
let subscriptions = new Map(Object.entries(loadedSubscriptions));
console.log(`📦 Loaded ${Object.keys(loadedSubscriptions).length} subscription(s) from ${STORAGE_FILE}`);

/**
 * Get subscription for a user
 */
export function getSubscription(userId) {
    const sub = subscriptions.get(userId);
    return sub || { plan: 'free' };
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
    
    // Persist to file
    const subscriptionsObj = Object.fromEntries(subscriptions);
    saveSubscriptions(subscriptionsObj);
    
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
    
    // Persist to file
    const subscriptionsObj = Object.fromEntries(subscriptions);
    saveSubscriptions(subscriptionsObj);
    
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

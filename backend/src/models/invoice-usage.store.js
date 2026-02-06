/**
 * Invoice usage store with file-based persistence
 * TODO: Replace with actual database (Supabase/PostgreSQL) in production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_FILE = path.join(__dirname, '..', '..', 'data', 'invoice-usage.json');

// Ensure data directory exists
const dataDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Load usage from file
 */
function loadUsage() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading invoice usage from file:', error);
    }
    return {};
}

/**
 * Save usage to file
 */
function saveUsage(usage) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving invoice usage to file:', error);
    }
}

// Initialize from file
let usageStore = new Map(Object.entries(loadUsage()));

/**
 * Get invoice usage for a user
 */
export function getInvoiceUsage(userId) {
    const usage = usageStore.get(userId);
    if (!usage) {
        // Initialize with default free plan limit
        const defaultUsage = {
            userId,
            count: 0,
            limit: 10, // Free plan limit
            lastReset: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        usageStore.set(userId, defaultUsage);
        
        // Persist to file
        const usageObj = Object.fromEntries(usageStore);
        saveUsage(usageObj);
        
        return defaultUsage;
    }
    
    // Convert null limit (from JSON) back to Infinity for PRO users
    const usageWithLimit = {
        ...usage,
        limit: usage.limit === null ? Infinity : usage.limit,
    };
    
    // Check if we need to reset monthly (simple check - reset if lastReset is more than 30 days ago)
    const lastResetDate = new Date(usageWithLimit.lastReset);
    const now = new Date();
    const daysSinceReset = (now - lastResetDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReset >= 30) {
        // Reset monthly usage
        const resetUsage = {
            ...usageWithLimit,
            count: 0,
            lastReset: now.toISOString(),
            updatedAt: now.toISOString(),
        };
        usageStore.set(userId, resetUsage);
        
        // Persist to file
        const usageObj = Object.fromEntries(usageStore);
        saveUsage(usageObj);
        
        return resetUsage;
    }
    
    return usageWithLimit;
}

/**
 * Increment invoice usage count
 */
export function incrementInvoiceUsage(userId) {
    const usage = getInvoiceUsage(userId);
    const updated = {
        ...usage,
        count: usage.count + 1,
        updatedAt: new Date().toISOString(),
    };
    usageStore.set(userId, updated);
    
    // Persist to file
    const usageObj = Object.fromEntries(usageStore);
    saveUsage(usageObj);
    
    return updated;
}

/**
 * Set invoice limit for a user (based on plan)
 */
export function setInvoiceLimit(userId, limit) {
    const usage = getInvoiceUsage(userId);
    const updated = {
        ...usage,
        limit: limit === Infinity ? null : limit, // Store null for Infinity
        updatedAt: new Date().toISOString(),
    };
    usageStore.set(userId, updated);
    
    // Persist to file
    const usageObj = Object.fromEntries(usageStore);
    saveUsage(usageObj);
    
    return updated;
}

/**
 * Get all usage records (for debugging/admin)
 */
export function getAllUsage() {
    return Array.from(usageStore.entries()).map(([userId, data]) => ({
        userId,
        ...data,
    }));
}

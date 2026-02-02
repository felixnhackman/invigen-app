/**
 * PHASE 8.5: API utility for authenticated requests
 * Handles Authorization headers and session management
 */

import { getAuthToken, supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make an authenticated API request
 * Automatically includes Authorization header with Supabase JWT
 */
export async function authenticatedFetch(endpoint, options = {}) {
    // Get current session token
    const token = await getAuthToken();
    
    // If no token and endpoint requires auth, redirect to login
    if (!token && options.requireAuth !== false) {
        // PHASE 8.5: Handle unauthenticated requests
        // Return error that can be handled by caller
        throw new Error('UNAUTHENTICATED');
    }

    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // PHASE 8.5: Handle 401 Unauthorized (expired token)
    if (response.status === 401) {
        // Try to refresh session
        if (supabase) {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (session && !error) {
                // Retry request with new token
                const newToken = session.access_token;
                headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
            }
        }
        // If refresh failed, throw error
        throw new Error('SESSION_EXPIRED');
    }

    return response;
}

/**
 * Fetch subscription for current user
 */
export async function fetchSubscription() {
    try {
        const response = await authenticatedFetch('/api/subscriptions/me');
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            throw new Error(`Failed to fetch subscription: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        console.error('Error fetching subscription:', error);
        throw error;
    }
}

/**
 * Fetch invoice usage for current user
 */
export async function fetchInvoiceUsage() {
    try {
        const response = await authenticatedFetch('/api/invoices/usage');
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            throw new Error(`Failed to fetch invoice usage: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        console.error('Error fetching invoice usage:', error);
        throw error;
    }
}

/**
 * Create invoice (with usage tracking)
 */
export async function createInvoice(invoiceData) {
    try {
        const response = await authenticatedFetch('/api/invoices/create', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            if (response.status === 403) {
                throw new Error('LIMIT_REACHED');
            }
            throw new Error(`Failed to create invoice: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        throw error;
    }
}

/**
 * Request PDF download authorization
 */
export async function requestDownloadAuth() {
    try {
        const response = await authenticatedFetch('/api/invoices/download', {
            method: 'POST',
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            if (response.status === 403) {
                throw new Error('FORBIDDEN');
            }
            throw new Error(`Failed to authorize download: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        throw error;
    }
}

/**
 * Request email send authorization
 */
export async function requestEmailAuth() {
    try {
        const response = await authenticatedFetch('/api/invoices/send', {
            method: 'POST',
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            if (response.status === 403) {
                throw new Error('FORBIDDEN');
            }
            throw new Error(`Failed to authorize email: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        throw error;
    }
}

/**
 * Request watermark removal authorization
 */
export async function requestWatermarkAuth() {
    try {
        const response = await authenticatedFetch('/api/invoices/remove-watermark', {
            method: 'POST',
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            if (response.status === 403) {
                throw new Error('FORBIDDEN');
            }
            throw new Error(`Failed to authorize watermark removal: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
            throw error;
        }
        throw error;
    }
}

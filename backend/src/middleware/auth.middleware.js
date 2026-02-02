/**
 * PHASE 8.5: Authentication middleware for Supabase JWT
 * Verifies Authorization header and attaches user info to req.user
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// PHASE 8.5: Initialize Supabase admin client for JWT verification
const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
              autoRefreshToken: false,
              persistSession: false,
          },
      })
    : null;

/**
 * PHASE 8.5: Verify Supabase JWT and extract user info
 */
async function verifySupabaseToken(token) {
    if (!supabaseAdmin) {
        throw new Error('Supabase not configured');
    }

    try {
        // Verify token using Supabase admin client
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            throw new Error('Invalid token');
        }

        return {
            id: user.id,
            email: user.email || '',
        };
    } catch (err) {
        throw new Error('Token verification failed');
    }
}

/**
 * PHASE 8.5: Express middleware to authenticate requests
 * Reads Authorization header, verifies JWT, attaches user to req.user
 */
export function authMiddleware(req, res, next) {
    // Skip auth for public endpoints
    if (req.path === '/health' || req.path === '/api/webhooks/paystack') {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    verifySupabaseToken(token)
        .then((user) => {
            // PHASE 8.5: Attach user info to request
            req.user = user;
            next();
        })
        .catch((err) => {
            console.error('Auth middleware error:', err);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
            });
        });
}

/**
 * PHASE 8.5: Optional auth middleware (doesn't fail if no token)
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.substring(7);

    verifySupabaseToken(token)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch(() => {
            // Optional auth - don't fail, just set user to null
            req.user = null;
            next();
        });
}

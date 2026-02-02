/**
 * PHASE 8.5: Subscription hook with authenticated API calls
 * Fetches subscription data from backend using authenticated requests
 */

import { useState, useEffect } from 'react';
import { fetchSubscription, fetchInvoiceUsage } from '../utils/api';
import { getAuthUser } from '../lib/supabase';

export function useSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [invoiceUsage, setInvoiceUsage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        let mounted = true;

        async function loadSubscription() {
            try {
                setIsLoading(true);
                setError(null);

                // PHASE 8.5: Get authenticated user
                const authUser = await getAuthUser();
                if (!authUser) {
                    // No user logged in - default to free
                    if (mounted) {
                        setUser(null);
                        setSubscription({ plan: 'free' });
                        setInvoiceUsage({ count: 0, limit: 10 });
                        setIsLoading(false);
                    }
                    return;
                }

                setUser(authUser);

                // PHASE 8.5: Fetch subscription and usage with authenticated requests
                const [subData, usageData] = await Promise.all([
                    fetchSubscription().catch(() => ({ plan: 'free' })), // Default to free on error
                    fetchInvoiceUsage().catch(() => ({ count: 0, limit: 10 })), // Default usage on error
                ]);

                if (mounted) {
                    setSubscription(subData);
                    setInvoiceUsage(usageData);
                    setIsLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    // PHASE 8.5: Handle auth errors gracefully
                    if (err.message === 'UNAUTHENTICATED' || err.message === 'SESSION_EXPIRED') {
                        setUser(null);
                        setSubscription({ plan: 'free' });
                        setInvoiceUsage({ count: 0, limit: 10 });
                    } else {
                        setError(err.message);
                        // Default to free plan on error
                        setSubscription({ plan: 'free' });
                        setInvoiceUsage({ count: 0, limit: 10 });
                    }
                    setIsLoading(false);
                }
            }
        }

        loadSubscription();

        // PHASE 8.5: Refresh subscription periodically (every 30 seconds)
        const interval = setInterval(loadSubscription, 30000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [refreshTrigger]);

    // CRITICAL FIX: Manual refresh function - subscription state comes ONLY from backend
    const refreshSubscription = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const plan = subscription?.plan || 'free';
    const isPro = plan === 'pro';
    const isFree = plan === 'free';
    const hasPremiumAccess = isPro;

    const invoiceCount = invoiceUsage?.count || 0;
    const invoiceLimit = invoiceUsage?.limit || 10;
    const canCreateInvoice = isPro || invoiceCount < invoiceLimit;

    return {
        plan,
        isPro,
        isFree,
        hasPremiumAccess,
        isLoading,
        error,
        user,
        invoiceCount,
        invoiceLimit,
        canCreateInvoice,
        subscription,
        invoiceUsage,
        refreshSubscription, // CRITICAL: Use this to refresh after payment verification
    };
}

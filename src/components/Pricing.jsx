import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap, Crown, Info } from 'lucide-react';
import { useNotification } from './NotificationDialog';
import { useSubscription } from '../hooks/useSubscription';
import { initializePaystackCheckout, generatePaymentReference } from '../utils/paystack';
import { verifyPayment } from '../utils/api';
import { getAuthUser } from '../lib/supabase';
import hero from '../assets/hero.png';

const Pricing = ({ setCurrentPage, user }) => {
    const { showNotification, showToast } = useNotification();
    const { plan: currentPlan, isLoading: subscriptionLoading, isPro, refreshSubscription } = useSubscription();
    const [isProcessing, setIsProcessing] = useState(false);
    const [userEmail, setUserEmail] = useState(user?.email || '');
    const [billingPeriod, setBillingPeriod] = useState('monthly'); // PHASE 7.2: Yearly anchor (visual only)

    // PHASE 7.2: Yearly anchor tooltip state
    const [showYearlyTooltip, setShowYearlyTooltip] = useState(false);

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            priceDisplay: '₵0',
            period: 'Forever',
            description: 'Perfect for trying out Invigen',
            icon: <Zap className="w-6 h-6" />,
            features: [
                'Preview invoices',
                'Up to 10 invoices/month',
                'Download with Invigen watermark',
                'Community support'
            ],
            cta: 'Current Plan',
            highlight: false,
            disabled: currentPlan === 'free',
            badge: 'Best for trying Invigen' // PHASE 7.2: Value framing
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 2,
            priceDisplay: '₵2',
            period: 'per month',
            yearlyPrice: 20, // PHASE 7.2: Yearly anchor (updated for ₵2)
            yearlySavings: 4, // PHASE 7.2: Yearly anchor (updated for ₵2)
            description: 'For professionals and small businesses',
            icon: <Crown className="w-6 h-6" />,
            features: [
                'Everything in Free',
                'Unlimited invoices',
                'Download PDF invoices',
                'Email invoices directly',
                'Remove watermark',
                'Custom branding',
                'Priority support'
            ],
            cta: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
            highlight: true,
            disabled: currentPlan === 'pro',
            badge: 'Best value for freelancers & small businesses' // PHASE 7.2: Value framing
        }
    ];

    const handlePlanSelect = async (selectedPlan) => {
        // PHASE 8: Auth guardrail - require login for upgrades
        if (!user) {
            showNotification({
                type: 'info',
                title: 'Sign In Required',
                message: 'Please sign in to upgrade to Pro.',
                autoClose: true,
                autoCloseDelay: 4000
            });
            if (setCurrentPage) {
                setTimeout(() => setCurrentPage('login'), 1500);
            }
            return;
        }

        // Don't allow selecting current active plan
        if (selectedPlan.id === currentPlan) {
            return;
        }

        // Free plan - no action needed (user is already on free)
        if (selectedPlan.id === 'free') {
            return;
        }

        // PHASE 7.2: Yearly billing not available yet
        if (billingPeriod === 'yearly') {
            showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Yearly billing will be available soon. Please select monthly billing for now.',
                autoClose: true,
                autoCloseDelay: 4000
            });
            return;
        }

        // Premium plans require payment
        if (!userEmail || !userEmail.includes('@')) {
            showNotification({
                type: 'warning',
                title: 'Email Required',
                message: 'Please enter your email address to proceed with payment.',
                autoClose: true,
                autoCloseDelay: 4000
            });
            return;
        }

        // CRITICAL FIX: Remove direct plan mutation - PRO must come from backend after payment verification
        // Initialize Paystack checkout
        setIsProcessing(true);
        
        try {
            // Get authenticated user for payment reference
            const authUser = await getAuthUser();
            if (!authUser) {
                throw new Error('User not authenticated');
            }

            // Generate unique payment reference
            const reference = generatePaymentReference(authUser.id);
            
            // Show payment popup notification
            showNotification({
                type: 'info',
                title: 'Opening Payment',
                message: 'Paystack checkout will open in a popup...',
                autoClose: true,
                autoCloseDelay: 2000
            });

            // Initialize Paystack checkout
            console.log('Starting Paystack checkout for:', { email: userEmail, amount: selectedPlan.price, reference });
            await initializePaystackCheckout({
                email: userEmail,
                amount: selectedPlan.price, // Amount in GHS (₵2)
                reference,
                metadata: {
                    userId: authUser.id,
                    userEmail: authUser.email,
                    plan: selectedPlan.id,
                    custom_fields: [
                        {
                            display_name: 'Plan',
                            variable_name: 'plan',
                            value: selectedPlan.id
                        }
                    ]
                },
                callback: async (response) => {
                    console.log('Paystack callback received:', response);
                    // Payment successful - verify with backend
                    try {
                        setIsProcessing(true);
                        showNotification({
                            type: 'info',
                            title: 'Verifying Payment',
                            message: 'Please wait while we verify your payment...',
                            autoClose: false
                        });

                        // Verify payment with backend
                        const verificationResult = await verifyPayment(response.reference);
                        
                        // Backend verified payment and updated subscription
                        setIsProcessing(false);
                        showNotification({
                            type: 'success',
                            title: 'Payment Successful! 🎉',
                            message: `Welcome to ${selectedPlan.name} plan! Your subscription is now active.`,
                            autoClose: true,
                            autoCloseDelay: 5000
                        });

                        // CRITICAL: Do NOT set plan locally - subscription state comes from backend
                        // Refresh subscription state from backend
                        refreshSubscription();
                        
                        // Small delay to allow backend to process, then refresh
                        setTimeout(() => {
                            refreshSubscription();
                        }, 1000);
                    } catch (verifyError) {
                        setIsProcessing(false);
                        showNotification({
                            type: 'error',
                            title: 'Verification Failed',
                            message: verifyError.message || 'Failed to verify payment. Please contact support if payment was deducted.',
                            autoClose: true,
                            autoCloseDelay: 8000
                        });
                    }
                },
                onClose: () => {
                    // User cancelled payment
                    setIsProcessing(false);
                    showNotification({
                        type: 'info',
                        title: 'Payment Cancelled',
                        message: 'Payment was cancelled. You can try again anytime.',
                        autoClose: true,
                        autoCloseDelay: 3000
                    });
                }
            });
        } catch (error) {
            console.error('Payment initialization error:', error);
            setIsProcessing(false);
            const errorMessage = error.message || 'Failed to initialize payment. Please try again.';
            
            // Provide helpful error messages
            let userMessage = errorMessage;
            if (errorMessage.includes('public key not configured')) {
                userMessage = 'Payment system not configured. Please contact support.';
            } else if (errorMessage.includes('Failed to load Paystack')) {
                userMessage = 'Unable to load payment system. Please check your internet connection and try again.';
            }
            
            showNotification({
                type: 'error',
                title: 'Payment Error',
                message: userMessage,
                autoClose: true,
                autoCloseDelay: 8000
            });
        }
    };

    // PHASE 7.2: Handle yearly toggle (visual only)
    const handleBillingToggle = (period) => {
        if (period === 'yearly') {
            setShowYearlyTooltip(true);
            setTimeout(() => setShowYearlyTooltip(false), 3000);
            return;
        }
        setBillingPeriod(period);
    };

    return (
        <div className="relative min-h-screen bg-gray-950 pt-20 bg-cover bg-center tracking-tighter" style={{
            backgroundImage: `url(${hero})`
        }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                        <Crown className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-400">SUBSCRIPTION PLANS</span>
                    </div>
                    
                    {/* PHASE 7.2: Updated headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Simple pricing. Upgrade only when you need more.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                        Start free. Upgrade to Pro when you're ready to send, download, and scale.
                    </p>

                    {/* PHASE 7.2: Yearly/Monthly Toggle (Visual Anchor) */}
                    <div className="flex items-center justify-center gap-4 mb-8 relative">
                        <button
                            onClick={() => handleBillingToggle('monthly')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                billingPeriod === 'monthly'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => handleBillingToggle('yearly')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 relative ${
                                billingPeriod === 'yearly'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            Yearly (Save 20%)
                            {showYearlyTooltip && (
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap z-10">
                                    Yearly billing coming soon
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Email Input - PHASE 8: Pre-fill if logged in, show sign-in prompt if not */}
                    <div className="max-w-md mx-auto mb-8">
                        {!user ? (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                                <p className="text-sm text-blue-300 mb-2">
                                    Sign in to upgrade to Pro
                                </p>
                                <button
                                    onClick={() => setCurrentPage && setCurrentPage('login')}
                                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                                >
                                    Sign in or create account
                                </button>
                            </div>
                        ) : (
                            <>
                                <label className="block text-sm font-semibold text-gray-300 mb-2 text-left">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-left">
                                    Required for payment processing
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 max-w-4xl mx-auto">
                    {plans.map((planItem) => {
                        // PHASE 7.2: Calculate yearly pricing display
                        const displayPrice = billingPeriod === 'yearly' && planItem.yearlyPrice
                            ? `₵${planItem.yearlyPrice}`
                            : planItem.priceDisplay;
                        const displayPeriod = billingPeriod === 'yearly' && planItem.yearlyPrice
                            ? '/ year'
                            : planItem.period;

                        return (
                            <div
                                key={planItem.id}
                                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                                    planItem.highlight
                                        ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105'
                                        : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                {/* Most Popular Badge */}
                                {planItem.highlight && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}

                                {/* PHASE 7.2: Value Framing Badge */}
                                {planItem.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-xs text-gray-400 rounded-full">
                                            {planItem.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Plan Icon */}
                                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${
                                    planItem.highlight
                                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                                        : 'bg-gray-800'
                                }`}>
                                    <div className="text-white">
                                        {planItem.icon}
                                    </div>
                                </div>

                                {/* Plan Name */}
                                <h3 className="text-2xl font-bold text-white mb-2">{planItem.name}</h3>
                                <p className="text-gray-400 mb-6 text-sm">{planItem.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white">{displayPrice}</span>
                                        {planItem.price > 0 && (
                                            <span className="text-gray-400 text-sm">/{displayPeriod}</span>
                                        )}
                                    </div>
                                    
                                    {/* PHASE 7.2: Pricing Anchor Copy */}
                                    {planItem.price > 0 && (
                                        <div className="mt-2">
                                            {billingPeriod === 'yearly' && planItem.yearlyPrice ? (
                                                <p className="text-sm text-yellow-400 font-semibold">
                                                    ₵{planItem.yearlyPrice} / year (save ₵{planItem.yearlySavings}) — coming soon
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                    Billed monthly • Upgrade anytime
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-4 mb-8">
                                    {planItem.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-green-400" />
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handlePlanSelect(planItem)}
                                    disabled={planItem.disabled || isProcessing || !userEmail || (billingPeriod === 'yearly' && planItem.id === 'pro') || (!user && planItem.id === 'pro')}
                                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                        planItem.disabled || (billingPeriod === 'yearly' && planItem.id === 'pro') || (!user && planItem.id === 'pro')
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : planItem.highlight
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105'
                                                : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                    }`}
                                >
                                    {isProcessing && planItem.id !== 'free' ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : !user && planItem.id === 'pro' ? (
                                        'Sign in to upgrade'
                                    ) : (
                                        <>
                                            {planItem.cta}
                                            {!planItem.disabled && planItem.id !== 'free' && billingPeriod !== 'yearly' && user && (
                                                <ArrowRight className="w-4 h-4" />
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* PHASE 7.2: Trust Signals */}
                <div className="text-center mb-8">
                    <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>No credit card required to start</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Secure payments via Paystack</span>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm">
                        All plans include our core invoice generation features. 
                        <span className="text-blue-400"> Cancel anytime.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;

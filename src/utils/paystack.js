/**
 * Paystack payment integration utility
 * Handles Paystack inline checkout and payment verification
 */

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

/**
 * Initialize Paystack inline checkout
 * Opens Paystack payment popup
 */
export function initializePaystackCheckout({
    email,
    amount, // Amount in GHS
    reference,
    metadata = {},
    callback,
    onClose,
}) {
    // Check if Paystack public key is configured
    if (!PAYSTACK_PUBLIC_KEY) {
        console.error('Paystack public key not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in .env');
        throw new Error('Paystack public key not configured. Please contact support.');
    }

    // Validate required parameters
    if (!email || !amount || !reference) {
        console.error('Missing required Paystack parameters:', { email, amount, reference });
        throw new Error('Missing required payment information');
    }

    console.log('Initializing Paystack checkout:', { email, amount, reference });

    // Load Paystack inline script if not already loaded
    return new Promise((resolve, reject) => {
        // Check if Paystack script is already loaded
        if (window.PaystackPop) {
            console.log('Paystack script already loaded');
            handleCheckout();
        } else {
            console.log('Loading Paystack script...');
            // Load Paystack inline script
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.onload = () => {
                console.log('Paystack script loaded successfully');
                handleCheckout();
            };
            script.onerror = () => {
                console.error('Failed to load Paystack script');
                reject(new Error('Failed to load Paystack payment script. Please check your internet connection.'));
            };
            document.head.appendChild(script);
        }

        function handleCheckout() {
            try {
                const amountInKobo = Math.round(amount * 100); // Convert GHS to pesewas (kobo)
                console.log('Opening Paystack checkout:', { 
                    key: PAYSTACK_PUBLIC_KEY.substring(0, 10) + '...', 
                    email, 
                    amount: amountInKobo, 
                    reference 
                });

                const handler = window.PaystackPop.setup({
                    key: PAYSTACK_PUBLIC_KEY,
                    email,
                    amount: amountInKobo, // Convert to pesewas (Paystack expects amount in smallest currency unit)
                    currency: 'GHS', // CRITICAL: Explicitly set currency to Ghana Cedis
                    ref: reference,
                    metadata,
                    callback: (response) => {
                        console.log('Paystack payment successful:', response);
                        // Payment successful
                        if (callback) {
                            callback(response);
                        }
                        resolve(response);
                    },
                    onClose: () => {
                        console.log('Paystack payment popup closed by user');
                        // User closed payment popup
                        if (onClose) {
                            onClose();
                        }
                        reject(new Error('Payment cancelled by user'));
                    },
                });

                console.log('Opening Paystack iframe...');
                handler.openIframe();
            } catch (error) {
                console.error('Error setting up Paystack checkout:', error);
                reject(error);
            }
        }
    });
}

/**
 * Generate unique payment reference
 */
export function generatePaymentReference(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `invigen_${userId}_${timestamp}_${random}`;
}

/**
 * Convert GHS amount to kobo (Paystack smallest unit)
 */
export function convertToKobo(amount) {
    return Math.round(amount * 100); // GHS to pesewas (kobo equivalent)
}

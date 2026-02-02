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
    amount, // Amount in kobo (smallest currency unit)
    reference,
    metadata = {},
    callback,
    onClose,
}) {
    if (!PAYSTACK_PUBLIC_KEY) {
        throw new Error('Paystack public key not configured');
    }

    // Load Paystack inline script if not already loaded
    return new Promise((resolve, reject) => {
        // Check if Paystack script is already loaded
        if (window.PaystackPop) {
            handleCheckout();
        } else {
            // Load Paystack inline script
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.onload = () => handleCheckout();
            script.onerror = () => reject(new Error('Failed to load Paystack script'));
            document.head.appendChild(script);
        }

        function handleCheckout() {
            try {
                const handler = window.PaystackPop.setup({
                    key: PAYSTACK_PUBLIC_KEY,
                    email,
                    amount: amount * 100, // Convert to kobo (Paystack expects amount in kobo)
                    ref: reference,
                    metadata,
                    callback: (response) => {
                        // Payment successful
                        if (callback) {
                            callback(response);
                        }
                        resolve(response);
                    },
                    onClose: () => {
                        // User closed payment popup
                        if (onClose) {
                            onClose();
                        }
                        reject(new Error('Payment cancelled by user'));
                    },
                });

                handler.openIframe();
            } catch (error) {
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

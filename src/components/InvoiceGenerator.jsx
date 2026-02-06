import React, { useState, useEffect, useRef } from "react";
import {
    Document,
    Page,
    Text,
    Image,
    View,
    StyleSheet,
    PDFDownloadLink,
    PDFViewer,
    pdf,
    Font
} from "@react-pdf/renderer";
import { Plus, Trash2, Download, ArrowLeft, ArrowRight, User, Building2, CheckCircle, Palette, Eye, EyeOff, Crown, MessageCircle, Upload, X } from 'lucide-react';
import hero from '../assets/hero.png';
import logo2 from '../assets/logo2.png';
import PoppinsBold from "../fonts/Poppins-Bold.ttf";
import PoppinsRegular from "../fonts/Poppins-Regular.ttf";
import NotoSansBold from "../fonts/NotoSans-Bold.ttf";
import InvoiceCustomizer, { CustomInvoiceDocument } from './InvoiceCustomize.jsx';
import { NotificationDialog, Toast, useNotification } from './NotificationDialog.jsx';
import { useSubscription } from '../hooks/useSubscription';
import UpgradeModal from './UpgradeModal';
import { requestDownloadAuth, requestEmailAuth, createInvoice } from '../utils/api';
import { getBusinessInfo, saveBusinessInfo } from '../lib/supabase';
import emailjs from '@emailjs/browser';



// EmailJS Configuration
const SERVICE_ID = 'service_wri4gvf'; // Your EmailJS service ID
const INVOICE_TEMPLATE_ID = 'template_wijvouc'; // Your invoice template ID
const FEEDBACK_TEMPLATE_ID = 'feedback_invigen'; // Optional: for feedback emails
const PUBLIC_KEY = 'IP5q2YStka3oDD-zQ'; // Your EmailJS public key (update if different)



/**
 * Compress and resize image to reduce base64 size for EmailJS
 * This prevents the 50KB variable limit error
 */
const compressImageForEmail = async (base64Image, maxWidth = 150, maxHeight = 150, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // Create an image element (use window.Image in React artifacts)
        const img = new window.Image();

        img.onload = () => {
            // Create a canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw the resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to compressed base64
            // Use 'image/jpeg' for better compression (even for PNGs)
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

            // PHASE 8: Removed debug log for production
            resolve(compressedBase64);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for compression'));
        };

        // Load the base64 image
        img.src = base64Image;
    });
};

/**
 * Prepare logo for email - compress it if it exists
 */
const prepareLogoForEmail = async (customization) => {
    if (!customization || !customization.logoUrl) {
        return null;
    }

    try {
        // Compress the logo to reduce size
        const compressedLogo = await compressImageForEmail(
            customization.logoUrl,
            100,  // Max width: 100px (logos don't need to be huge in emails)
            100,  // Max height: 100px
            0.6   // Quality: 60% (good balance between size and quality)
        );

        return compressedLogo;
    } catch (error) {
        console.error('Error compressing logo for email:', error);
        // If compression fails, return null (email will be sent without logo)
        return null;
    }
};






const getBase64Image = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error fetching image for PDF:", error);
        return url;
    }
};

// Register fonts
Font.register({
    family: "Poppins",
    fonts: [
        { src: PoppinsRegular, fontWeight: "normal" },
        { src: PoppinsBold, fontWeight: "bold" },
    ],
});

Font.register({
    family: "Noto Sans",
    src: NotoSansBold,
});

// Modern PDF Styles - Compact version
const styles = StyleSheet.create({
    page: {
        padding: 54,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins",
    },
    header: {
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    invoiceLabel: {
        fontSize: 8,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    invoiceNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0f172a",
    },
    businessCard: {
        backgroundColor: "#1e293b",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    businessLeft: {
        flex: 1,
    },
    businessName: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 3,
    },
    businessEmail: {
        fontSize: 8,
        color: "rgba(255, 255, 255, 0.7)",
    },
    dateSection: {
        alignItems: "flex-end",
    },
    dateLabel: {
        fontSize: 7,
        color: "rgba(255, 255, 255, 0.6)",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 9,
        color: "#ffffff",
        marginBottom: 6,
    },
    columns: {
        flexDirection: "row",
        marginBottom: 20,
        gap: 16,
    },
    column: {
        flex: 1,
    },
    columnTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: "#e2e8f0",
    },
    clientName: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 4,
    },
    infoText: {
        fontSize: 8,
        color: "#64748b",
        marginBottom: 3,
    },
    itemsHeader: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 8,
    },
    table: {
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        padding: 7,
        borderRadius: 5,
        marginBottom: 3,
    },
    tableHeaderText: {
        fontSize: 7,
        fontWeight: "bold",
        color: "#475569",
        textTransform: "uppercase",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 3,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    col1: { width: "45%", paddingRight: 6 },
    col2: { width: "15%", textAlign: "center" },
    col3: { width: "18%", textAlign: "right", paddingRight: 6 },
    col4: { width: "22%", textAlign: "right" },
    itemName: {
        fontSize: 9,
        color: "#0f172a",
        fontWeight: "600",
    },
    itemQty: {
        fontSize: 8,
        color: "#64748b",
        fontFamily: "Noto Sans",
    },
    itemPrice: {
        fontSize: 8,
        color: "#64748b",
        fontFamily: "Noto Sans",
    },
    itemTotal: {
        fontSize: 9,
        color: "#0f172a",
        fontWeight: "bold",
        fontFamily: "Noto Sans",
    },
    summary: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        alignItems: "flex-end",
    },
    summaryRow: {
        flexDirection: "row",
        width: 200,
        paddingVertical: 4,
        justifyContent: "space-between",
    },
    summaryLabel: {
        fontSize: 8,
        color: "#64748b",
    },
    summaryValue: {
        fontSize: 9,
        color: "#0f172a",
        fontFamily: "Noto Sans",
    },
    totalRow: {
        flexDirection: "row",
        width: 200,
        padding: 10,
        backgroundColor: "#0f172a",
        borderRadius: 6,
        marginTop: 6,
        justifyContent: "space-between",
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#ffffff",
    },
    totalValue: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Noto Sans",
    },
    notes: {
        marginTop: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },
    notesTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: 6,
    },
    notesText: {
        fontSize: 8,
        color: "#64748b",
        lineHeight: 1.5,
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 32,
        right: 32,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#263548ff",
        marginRight: 3,
    },
    footerLogo: {
        width: 140,
        height: 100,
    },
});

const formatCurrency = (amount, currencyCode = "USD") => {
    const currencies = {
        USD: "$", EUR: "€", GBP: "£", GHS: "₵", NGN: "₦",
        ZAR: "R", JPY: "¥", CNY: "¥", CAD: "C$", AUD: "A$"
    };
    const symbol = currencies[currencyCode] || "$";
    return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
};

const InvoiceGenerator = ({ onFinalDownload, user, setCurrentPage }) => {
    // PHASE 8.5: Subscription hook with authenticated API calls
    const { isPro, isFree, hasPremiumAccess, canCreateInvoice, invoiceCount, invoiceLimit, isLoading: subscriptionLoading } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');

    const [formData, setFormData] = useState({
        businessName: "",
        invoiceNumber: "",
        date: new Date().toISOString().split("T")[0],
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        items: [{ name: "", quantity: 1, price: 0 }],
        amountPaid: 0,
        note: "",
        currency: "GHS",
    });

    const [customization, setCustomization] = useState(null);
    const [showCustomizer, setShowCustomizer] = useState(false);
    
    // PRO Feature: Logo upload state (for main form)
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const logoInputRef = useRef(null);

    const [feedback, setFeedback] = useState({
        rating: 0,
        comments: "",
        submitted: false
    });

    const [hoveredStar, setHoveredStar] = useState(0);

    const currencies = [
        { code: "USD", symbol: "$", name: "US Dollar" },
        { code: "EUR", symbol: "€", name: "Euro" },
        { code: "GBP", symbol: "£", name: "British Pound" },
        { code: "GHS", symbol: "₵", name: "Ghana Cedi" },
        { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
        { code: "ZAR", symbol: "R", name: "South African Rand" },
        { code: "JPY", symbol: "¥", name: "Japanese Yen" },
        { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
        { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
        { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    ];

    const [showInvoice, setShowInvoice] = useState(false);
    
    // WhatsApp input state
    const [sendToPhone, setSendToPhone] = useState('');
    const [logoBase64, setLogoBase64] = useState(logo2);
    const [showPreview, setShowPreview] = useState(false); // PRO feature: Live preview

    // Notification hooks
    const { notification, toast, showNotification, showToast, closeNotification, closeToast } = useNotification();

    useEffect(() => {
        const loadLogo = async () => {
            const base64 = await getBase64Image(logo2);
            if (base64) {
                setLogoBase64(base64);
            }
        };
        loadLogo();
    }, []);

    // Auto-generate invoice number based on user email/name (only once when user loads)
    useEffect(() => {
        if (user && !formData.invoiceNumber) {
            // Generate invoice number from user email or name
            const userIdentifier = user.email || user.user_metadata?.full_name || user.id || 'USER';
            const prefix = userIdentifier.split('@')[0].toUpperCase().substring(0, 3) || 'INV';
            const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
            const generatedNumber = `${prefix}-${timestamp}`;
            
            setFormData(prev => {
                // Only set if invoice number is still empty
                if (!prev.invoiceNumber) {
                    return {
                        ...prev,
                        invoiceNumber: generatedNumber
                    };
                }
                return prev;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.email]);

    // PRO Feature: Load saved business info for PRO users
    useEffect(() => {
        const loadBusinessInfo = async () => {
            if (!user?.id || !isPro) return;
            
            try {
                const savedBusinessInfo = await getBusinessInfo(user.id);
                if (savedBusinessInfo) {
                    // Auto-fill business info for PRO users
                    setFormData(prev => ({
                        ...prev,
                        businessName: savedBusinessInfo.businessName || prev.businessName,
                        clientEmail: savedBusinessInfo.businessEmail || prev.clientEmail,
                        // Add more fields as needed
                    }));
                }
            } catch (error) {
                console.error('Failed to load business info:', error);
                // Non-critical error - continue without saved info
            }
        };
        
        loadBusinessInfo();
    }, [user?.id, isPro]);

    // EmailJS initialization removed - using WhatsApp only

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const calculateBalance = () => calculateTotal() - parseFloat(formData.amountPaid || 0);

    // PHASE 8.5: Handle invoice generation with usage tracking
    const handleGenerate = async () => {
        if (!formData.businessName || !formData.invoiceNumber) {
            showNotification({
                type: 'warning',
                title: 'Missing Information',
                message: 'Please fill in the required fields to generate your invoice.',
                details: 'Business Name and Invoice Number are required fields.'
            });
            return;
        }

        // PHASE 8.5: Check if user can create invoice
        if (!canCreateInvoice && !subscriptionLoading) {
            setUpgradeFeatureName(`You've reached your limit of ${invoiceLimit} invoices this month. Create more with Pro.`);
            setShowUpgradeModal(true);
            return;
        }

        // PRO Feature: Save business info for PRO users
        if (user?.id && isPro && formData.businessName) {
            try {
                await saveBusinessInfo(user.id, {
                    businessName: formData.businessName,
                    businessEmail: formData.clientEmail,
                    // Add more fields as needed
                });
            } catch (error) {
                console.error('Failed to save business info:', error);
                // Non-critical error - continue with invoice generation
            }
        }

        // PRO Feature: Ensure logo from main form is included in customization
        if (isPro && logoPreview && !customization?.logoUrl) {
            setCustomization(prev => ({
                ...prev,
                logoUrl: logoPreview,
                logoFile: logoFile,
            }));
        }

        // PHASE 8.5: Track invoice creation via API
        // This is non-critical - invoice generation should continue even if tracking fails
        if (user) {
            try {
                await createInvoice(formData);
            } catch (error) {
                if (error.message === 'LIMIT_REACHED') {
                    setUpgradeFeatureName(`You've reached your limit of ${invoiceLimit} invoices this month. Create more with Pro.`);
                    setShowUpgradeModal(true);
                    return;
                } else if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
                    showNotification({
                        type: 'error',
                        title: 'Session Expired',
                        message: 'Please sign in again to continue.',
                        autoClose: true,
                        autoCloseDelay: 3000
                    });
                    if (setCurrentPage) {
                        setCurrentPage('login');
                    }
                    return;
                } else if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION_RESET')) {
                    // Backend server is not running - show warning but allow invoice generation
                    console.warn('Backend server not available. Invoice tracking skipped, but invoice generation will continue.');
                    showNotification({
                        type: 'warning',
                        title: 'Backend Unavailable',
                        message: 'Invoice generated successfully, but usage tracking is unavailable.',
                        details: 'The backend server appears to be offline. Your invoice is still generated and can be downloaded.',
                        autoClose: true,
                        autoCloseDelay: 4000
                    });
                } else {
                    // Other errors - log but don't block invoice generation
                    console.error('Failed to track invoice creation:', error);
                }
                // Continue with invoice generation even if tracking fails
            }
        }

        setShowInvoice(true);

        showToast({
            type: 'success',
            message: 'Invoice generated successfully!'
        });
    };

    const handleCustomize = () => {
        if (!formData.businessName || !formData.invoiceNumber) {
            showNotification({
                type: 'warning',
                title: 'Cannot Customize Yet',
                message: 'Please fill in basic invoice information before customizing.',
                details: 'Business Name and Invoice Number are required to proceed.'
            });
            return;
        }
        setShowCustomizer(true);
    };

    const handleSaveCustomization = (newCustomization) => {
        // Merge logo from main form if it exists
        const mergedCustomization = {
            ...newCustomization,
            logoUrl: newCustomization.logoUrl || (logoPreview ? logoPreview : null),
        };
        setCustomization(mergedCustomization);
        setShowCustomizer(false);
        // Don't show invoice yet - only show when "Generate Invoice" is pressed
        // setShowInvoice(true); // Removed - invoice should only generate on "Generate Invoice" button

        showToast({
            type: 'success',
            message: 'Customization saved successfully! You can continue editing or generate the invoice when ready.'
        });
    };

    const handleCancelCustomization = () => {
        setShowCustomizer(false);
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => {
            const items = [...prev.items];
            if (field === "quantity" || field === "price") {
                // Remove any value limits - allow any number
                items[index][field] = value === "" ? "" : Number(value);
            } else {
                items[index][field] = value;
            }
            return { ...prev, items };
        });
    };

    const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: "", quantity: 1, price: 0 }] }));

    const removeItem = (index) => {
        if (formData.items.length === 1) {
            showNotification({
                type: 'info',
                title: 'Cannot Remove',
                message: 'You must have at least one item in your invoice.'
            });
            return;
        }
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // PRO Feature: Handle logo upload (for main form)
    const handleLogoUpload = (e) => {
        if (!isPro) {
            setUpgradeFeatureName('Upload custom logo');
            setShowUpgradeModal(true);
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showNotification({
                type: 'warning',
                title: 'Invalid File Type',
                message: 'Please upload a PNG, JPG, or SVG file.',
                autoClose: true,
                autoCloseDelay: 3000
            });
            if (logoInputRef.current) logoInputRef.current.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showNotification({
                type: 'warning',
                title: 'File Too Large',
                message: 'File size must be less than 2MB.',
                autoClose: true,
                autoCloseDelay: 3000
            });
            if (logoInputRef.current) logoInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (result && typeof result === 'string') {
                setLogoPreview(result);
                setLogoFile(file);
                // Update customization state with logo
                setCustomization(prev => ({
                    ...prev,
                    logoUrl: result,
                    logoFile: file,
                }));
                showToast({
                    type: 'success',
                    message: 'Logo uploaded successfully!'
                });
            }
        };
        reader.onerror = () => {
            showNotification({
                type: 'error',
                title: 'Upload Failed',
                message: 'Failed to read file. Please try again.',
                autoClose: true,
                autoCloseDelay: 3000
            });
            if (logoInputRef.current) logoInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        if (!isPro) return;
        setLogoPreview(null);
        setLogoFile(null);
        setCustomization(prev => ({
            ...prev,
            logoUrl: '',
            logoFile: null,
        }));
        if (logoInputRef.current) logoInputRef.current.value = '';
        showToast({
            type: 'success',
            message: 'Logo removed'
        });
    };
    // PHASE 8.5: Updated handleSendEmail with PRO check
    const handleSendEmail = async () => {
        // Use input email if provided, otherwise fall back to formData.clientEmail
        const emailToSend = sendToEmail.trim() || formData.clientEmail;
        
        if (!emailToSend) {
            showNotification({
                type: 'warning',
                title: 'Email Required',
                message: 'Please enter a client email address to send the invoice.'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToSend)) {
            showNotification({
                type: 'error',
                title: 'Invalid Email',
                message: 'Please enter a valid email address.',
                details: `The email "${emailToSend}" is not in a valid format.`
            });
            return;
        }

        // PHASE 8.5: Check PRO subscription before sending email
        if (!isPro && !subscriptionLoading) {
            try {
                await requestEmailAuth();
                setUpgradeFeatureName('Send invoices via email');
                setShowUpgradeModal(true);
                return;
            } catch (error) {
                if (error.message === 'FORBIDDEN') {
                    setUpgradeFeatureName('Send invoices via email');
                    setShowUpgradeModal(true);
                    return;
                } else if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
                    showNotification({
                        type: 'error',
                        title: 'Session Expired',
                        message: 'Please sign in again to continue.',
                        autoClose: true,
                        autoCloseDelay: 3000
                    });
                    if (setCurrentPage) {
                        setCurrentPage('login');
                    }
                    return;
                }
            }
        }

        setIsSending(true);

        try {
            // PHASE 8: Removed debug logs for production

            // Step 1: Prepare compressed logo if it exists
            let compressedLogo = null;
            if (customization && customization.logoUrl) {
                try {
                    compressedLogo = await compressImageForEmail(
                        customization.logoUrl,
                        100,  // Small size for email
                        100,
                        0.6   // 60% quality
                    );
                } catch (error) {
                    // PHASE 8: Error logging kept for debugging, but silent failure for user
                    showNotification({
                        type: 'warning',
                        title: 'Logo Compression Failed',
                        message: 'Your logo is too large to include in the email. The invoice will be sent without the logo.',
                        autoClose: true,
                        autoCloseDelay: 4000
                    });
                }
            }

            // Step 2: Generate PDF with compressed logo
            const InvoiceDoc = () => customization ? (
                <CustomInvoiceDocument
                    formData={formData}
                    customization={{
                        ...customization,
                        logoUrl: compressedLogo || customization.logoUrl  // Use compressed version
                    }}
                    calculateTotal={calculateTotal}
                    calculateBalance={calculateBalance}
                    invigenLogoSrc={logoBase64}
                />
            ) : (
                <Document>
                    <Page size="A4" style={styles.page}>
                        <View style={styles.header}>
                            <Text style={styles.invoiceLabel}>New Invoice</Text>
                            <Text style={styles.invoiceNumber}>{formData.invoiceNumber}</Text>
                        </View>

                        <View style={styles.businessCard}>
                            <View style={styles.businessLeft}>
                                <Text style={styles.businessName}>{formData.businessName}</Text>
                                <Text style={styles.businessEmail}>{formData.clientEmail || "info@company.com"}</Text>
                            </View>
                            <View style={styles.dateSection}>
                                <Text style={styles.dateLabel}>Issue Date</Text>
                                <Text style={styles.dateValue}>
                                    {new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.columns}>
                            <View style={styles.column}>
                                <Text style={styles.columnTitle}>Invoice Details</Text>
                                <Text style={styles.infoText}>Invoice #: {formData.invoiceNumber}</Text>
                                <Text style={styles.infoText}>Currency: {formData.currency}</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.columnTitle}>Bill To</Text>
                                {formData.clientName && <Text style={styles.clientName}>{formData.clientName}</Text>}
                                {formData.clientEmail && <Text style={styles.infoText}>{formData.clientEmail}</Text>}
                                {formData.clientPhone && <Text style={styles.infoText}>{formData.clientPhone}</Text>}
                            </View>
                        </View>

                        <View style={styles.table}>
                            <Text style={styles.itemsHeader}>Invoice Items</Text>

                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
                                <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
                                <Text style={[styles.tableHeaderText, styles.col3]}>Rate</Text>
                                <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
                            </View>

                            {formData.items.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.itemName, styles.col1]}>{item.name}</Text>
                                    <Text style={[styles.itemQty, styles.col2]}>{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</Text>
                                    <Text style={[styles.itemPrice, styles.col3]}>{formatCurrency(item.price, formData.currency)}</Text>
                                    <Text style={[styles.itemTotal, styles.col4]}>{formatCurrency(item.quantity * item.price, formData.currency)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.summary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(calculateTotal(), formData.currency)}</Text>
                            </View>
                            {formData.amountPaid > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Paid</Text>
                                    <Text style={styles.summaryValue}>-{formatCurrency(formData.amountPaid, formData.currency)}</Text>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Due</Text>
                                <Text style={styles.totalValue}>{formatCurrency(calculateBalance(), formData.currency)}</Text>
                            </View>
                        </View>

                        {formData.note && (
                            <View style={styles.notes}>
                                <Text style={styles.notesTitle}>Notes</Text>
                                <Text style={styles.notesText}>{formData.note}</Text>
                            </View>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Generated with</Text>
                            <Image src={logoBase64} style={styles.footerLogo} />
                        </View>
                    </Page>
                </Document>
            );

            // PHASE 8: Removed debug logs for production
            const blob = await pdf(<InvoiceDoc />).toBlob();
            const pdfSize = blob.size;

            // Step 3: Convert blob to base64
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result;
                    // PHASE 8: Removed debug logs for production
                    resolve(result);
                };
                reader.onerror = (error) => {
                    console.error('Base64 conversion error:', error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });

            // Check if we're still over the limit
            const estimatedSize = base64Data.length + JSON.stringify({
                to_email: formData.clientEmail,
                client_name: formData.clientName || 'Valued Client',
                invoice_number: formData.invoiceNumber,
                business_name: formData.businessName,
            }).length;

            if (estimatedSize > 50000) {
                console.warn('Data size still too large:', `${(estimatedSize / 1024).toFixed(2)}KB`);

                showNotification({
                    type: 'warning',
                    title: 'Email Size Too Large',
                    message: 'Your invoice with the logo is too large to send via email.',
                    details: `Size: ${(estimatedSize / 1024).toFixed(2)}KB (limit: 50KB). Please download the PDF and send it manually, or try a simpler logo.`,
                    actions: (
                        <>
                            <button
                                onClick={closeNotification}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                OK
                            </button>
                        </>
                    )
                });
                setIsSending(false);
                return;
            }

            // Step 4: Prepare template parameters
            const emailToSend = sendToEmail.trim() || formData.clientEmail;
            const templateParams = {
                to_email: emailToSend,
                client_name: formData.clientName || 'Valued Client',
                client_email: emailToSend,
                client_phone: formData.clientPhone || 'N/A',
                invoice_number: formData.invoiceNumber,
                business_name: formData.businessName,
                subtotal: formatCurrency(calculateTotal(), formData.currency),
                amount_paid: formatCurrency(parseFloat(formData.amountPaid || 0), formData.currency),
                balance_due: formatCurrency(calculateBalance(), formData.currency),
                date: new Date(formData.date).toLocaleDateString(),
                note: formData.note || 'N/A',
                year: new Date().getFullYear(),
                currency: formData.currency,
                pdf_attachment: base64Data
            };

            // PHASE 8: Removed debug logs for production

            // Step 5: Send email using EmailJS
            const response = await emailjs.send(
                SERVICE_ID,
                INVOICE_TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            // PHASE 8: Removed debug log for production
            setEmailSent(true);

            showNotification({
                type: 'success',
                title: 'Email Sent Successfully! 📧',
                message: `Your invoice has been sent to ${emailToSend}`,
                details: compressedLogo
                    ? 'Invoice sent with compressed logo to stay under email size limits.'
                    : 'Invoice sent successfully.',
                autoClose: true,
                autoCloseDelay: 4000
            });

        } catch (error) {
            console.error("Detailed error:", error);

            let errorMessage = 'We encountered an issue while sending your invoice. ';
            let errorDetails = '';

            if (error.text) {
                if (error.text.includes('size limit') || error.text.includes('50Kb')) {
                    errorMessage = 'The invoice is too large to send via email.';
                    errorDetails = 'Try using a smaller logo or simpler design. Alternatively, download the PDF and send it manually.';
                } else if (error.text.includes('Invalid grant') || error.text.includes('Gmail_API')) {
                    errorMessage = 'Email service authentication issue.';
                    errorDetails = 'Your Gmail account needs to be reconnected in EmailJS. Please check your EmailJS dashboard settings or contact support for assistance.';
                } else {
                    errorMessage += 'Please check your EmailJS configuration.';
                    errorDetails = `Error: ${error.text}`;
                }
            } else if (error.message) {
                if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION')) {
                    errorMessage = 'Cannot connect to email service.';
                    errorDetails = 'Please check your internet connection and try again.';
                } else {
                    errorMessage += 'Please try again or contact support if the problem persists.';
                    errorDetails = `Error: ${error.message}`;
                }
            } else {
                errorMessage += 'Please check your network connection and EmailJS configuration.';
                errorDetails = 'Unknown error occurred';
            }

            showNotification({
                type: 'error',
                title: 'Failed to Send Email',
                message: errorMessage,
                details: errorDetails,
                autoClose: false
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedback.rating) {
            showNotification({
                type: 'warning',
                title: 'Rating Required',
                message: 'Please rate your overall experience before submitting feedback.'
            });
            return;
        }

        if (feedback.submitted) return;

        try {
            // PHASE 8: Removed debug logs for production

            const templateParams = {
                rating: feedback.rating,
                user_comments: feedback.comments || 'No additional comments',
                invoice_number: formData.invoiceNumber || 'N/A',
                business_name: formData.businessName || 'N/A',
                year: new Date().getFullYear(),
                subject: `[Invigen Feedback] Rating: ${feedback.rating}/5 Stars`,
            };

            const response = await emailjs.send(
                SERVICE_ID,
                FEEDBACK_TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            // PHASE 8: Removed debug log for production
            setFeedback(prev => ({ ...prev, submitted: true }));

            showNotification({
                type: 'success',
                title: 'Thank You!',
                message: 'Your feedback has been submitted successfully. We appreciate your input!',
                autoClose: true,
                autoCloseDelay: 4000
            });

        } catch (error) {
            console.error("Detailed feedback error:", error);

            let errorMessage = 'Failed to submit your feedback. ';
            let errorDetails = '';

            if (error.text) {
                errorDetails = `Error: ${error.text}`;
            } else if (error.message) {
                errorDetails = `Error: ${error.message}`;
            }

            showNotification({
                type: 'error',
                title: 'Submission Failed',
                message: errorMessage + 'Please try again later.',
                details: errorDetails
            });
        }
    };

    // PDF Document Component for PDFViewer - memoized JSX directly
    const InvoiceDocumentForViewer = React.useMemo(() => {
        if (customization) {
            return (
                <CustomInvoiceDocument
                    formData={formData}
                    customization={customization}
                    calculateTotal={calculateTotal}
                    calculateBalance={calculateBalance}
                    invigenLogoSrc={logoBase64}
                />
            );
        }
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.invoiceLabel}>New Invoice</Text>
                        <Text style={styles.invoiceNumber}>{formData.invoiceNumber}</Text>
                    </View>

                    <View style={styles.businessCard}>
                        <View style={styles.businessLeft}>
                            <Text style={styles.businessName}>{formData.businessName}</Text>
                            <Text style={styles.businessEmail}>{formData.clientEmail || "info@company.com"}</Text>
                        </View>
                        <View style={styles.dateSection}>
                            <Text style={styles.dateLabel}>Issue Date</Text>
                            <Text style={styles.dateValue}>
                                {new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.columns}>
                        <View style={styles.column}>
                            <Text style={styles.columnTitle}>Invoice Details</Text>
                            <Text style={styles.infoText}>Invoice #: {formData.invoiceNumber}</Text>
                            <Text style={styles.infoText}>Currency: {formData.currency}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnTitle}>Bill To</Text>
                            {formData.clientName && <Text style={styles.clientName}>{formData.clientName}</Text>}
                            {formData.clientEmail && <Text style={styles.infoText}>{formData.clientEmail}</Text>}
                            {formData.clientPhone && <Text style={styles.infoText}>{formData.clientPhone}</Text>}
                        </View>
                    </View>

                    <View style={styles.table}>
                        <Text style={styles.itemsHeader}>Invoice Items</Text>

                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
                            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
                            <Text style={[styles.tableHeaderText, styles.col3]}>Rate</Text>
                            <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
                        </View>

                        {formData.items.map((item, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.itemName, styles.col1]}>{item.name}</Text>
                                <Text style={[styles.itemQty, styles.col2]}>{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</Text>
                                <Text style={[styles.itemPrice, styles.col3]}>{formatCurrency(item.price, formData.currency)}</Text>
                                <Text style={[styles.itemTotal, styles.col4]}>{formatCurrency(item.quantity * item.price, formData.currency)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(calculateTotal(), formData.currency)}</Text>
                        </View>
                        {formData.amountPaid > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Paid</Text>
                                <Text style={styles.summaryValue}>-{formatCurrency(formData.amountPaid, formData.currency)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Due</Text>
                            <Text style={styles.totalValue}>{formatCurrency(calculateBalance(), formData.currency)}</Text>
                        </View>
                    </View>

                    {formData.note && (
                        <View style={styles.notes}>
                            <Text style={styles.notesTitle}>Notes</Text>
                            <Text style={styles.notesText}>{formData.note}</Text>
                        </View>
                    )}

                    {/* Watermark - Only show if not PRO or if watermark removal is not enabled */}
                    {(!isPro || (customization && !customization.removeWatermark)) && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Generated with</Text>
                            <Image src={logoBase64} style={styles.footerLogo} />
                        </View>
                    )}
                </Page>
            </Document>
        );
    }, [formData, customization, logoBase64, isPro, calculateTotal, calculateBalance]);

    // PDF Document Component for PDFDownloadLink - needs to be a React component, not a function
    const InvoiceDocumentForDownload = React.useMemo(() => {
        if (customization) {
            return (
                <CustomInvoiceDocument
                    formData={formData}
                    customization={customization}
                    calculateTotal={calculateTotal}
                    calculateBalance={calculateBalance}
                    invigenLogoSrc={logoBase64}
                />
            );
        }
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.invoiceLabel}>New Invoice</Text>
                        <Text style={styles.invoiceNumber}>{formData.invoiceNumber}</Text>
                    </View>

                    <View style={styles.businessCard}>
                        <View style={styles.businessLeft}>
                            <Text style={styles.businessName}>{formData.businessName}</Text>
                            <Text style={styles.businessEmail}>{formData.clientEmail || "info@company.com"}</Text>
                        </View>
                        <View style={styles.dateSection}>
                            <Text style={styles.dateLabel}>Issue Date</Text>
                            <Text style={styles.dateValue}>
                                {new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.columns}>
                        <View style={styles.column}>
                            <Text style={styles.columnTitle}>Invoice Details</Text>
                            <Text style={styles.infoText}>Invoice #: {formData.invoiceNumber}</Text>
                            <Text style={styles.infoText}>Currency: {formData.currency}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnTitle}>Bill To</Text>
                            {formData.clientName && <Text style={styles.clientName}>{formData.clientName}</Text>}
                            {formData.clientEmail && <Text style={styles.infoText}>{formData.clientEmail}</Text>}
                            {formData.clientPhone && <Text style={styles.infoText}>{formData.clientPhone}</Text>}
                        </View>
                    </View>

                    <View style={styles.table}>
                        <Text style={styles.itemsHeader}>Invoice Items</Text>

                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
                            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
                            <Text style={[styles.tableHeaderText, styles.col3]}>Rate</Text>
                            <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
                        </View>

                        {formData.items.map((item, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.itemName, styles.col1]}>{item.name}</Text>
                                <Text style={[styles.itemQty, styles.col2]}>{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</Text>
                                <Text style={[styles.itemPrice, styles.col3]}>{formatCurrency(item.price, formData.currency)}</Text>
                                <Text style={[styles.itemTotal, styles.col4]}>{formatCurrency(item.quantity * item.price, formData.currency)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(calculateTotal(), formData.currency)}</Text>
                        </View>
                        {formData.amountPaid > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Paid</Text>
                                <Text style={styles.summaryValue}>-{formatCurrency(formData.amountPaid, formData.currency)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Due</Text>
                            <Text style={styles.totalValue}>{formatCurrency(calculateBalance(), formData.currency)}</Text>
                        </View>
                    </View>

                    {formData.note && (
                        <View style={styles.notes}>
                            <Text style={styles.notesTitle}>Notes</Text>
                            <Text style={styles.notesText}>{formData.note}</Text>
                        </View>
                    )}

                    {/* Watermark - Only show if not PRO or if watermark removal is not enabled */}
                    {(!isPro || (customization && !customization.removeWatermark)) && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Generated with</Text>
                            <Image src={logoBase64} style={styles.footerLogo} />
                        </View>
                    )}
                </Page>
            </Document>
        );
    }, [formData, customization, logoBase64, isPro, calculateTotal, calculateBalance]);

    // Show customizer if active
    if (showCustomizer) {
        return (
            <InvoiceCustomizer
                formData={formData}
                onSave={handleSaveCustomization}
                onCancel={handleCancelCustomization}
            />
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-950 pt-20 bg-cover bg-center tracking-tighter" style={{
            backgroundImage: `url(${hero})`
        }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Notification Components */}
            <NotificationDialog
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                details={notification.details}
                autoClose={notification.autoClose}
                autoCloseDelay={notification.autoCloseDelay}
                showCloseButton={notification.showCloseButton}
                actions={notification.actions}
            />

            <Toast
                isOpen={toast.isOpen}
                onClose={closeToast}
                type={toast.type}
                message={toast.message}
                position={toast.position}
                duration={toast.duration}
            />

            <div className="relative max-w-5xl mx-auto px-4 py-12 md:max-w-6xl">
                {!showInvoice ? (
                    <>
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1"></div>
                                <div className="flex-1 text-center">
                                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tighter">
                                        Generate Invoice
                                    </h1>
                                    <p className="text-xl text-gray-400">
                                        Create professional invoices in seconds
                                    </p>
                                </div>
                                <div className="flex-1 flex justify-end">
                                    {/* PRO Feature: Live Preview Toggle */}
                                    {isPro && formData.businessName && formData.invoiceNumber ? (
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-200"
                                        >
                                            {showPreview ? (
                                                <>
                                                    <EyeOff className="w-4 h-4" />
                                                    Hide Preview
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    Show Preview
                                                </>
                                            )}
                                        </button>
                                    ) : isPro ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-500 rounded-xl text-sm">
                                            <Crown className="w-4 h-4" />
                                            <span>Fill business info to preview</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className={`${showPreview && isPro ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    Business Information
                                    {isPro && (
                                        <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Auto-saved
                                        </span>
                                    )}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Business Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Your Business Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Invoice Number <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="invoiceNumber"
                                            value={formData.invoiceNumber}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Auto-generated"
                                        />
                                        {user && formData.invoiceNumber && (
                                            <p className="text-xs text-gray-500 mt-1">Auto-generated from your account. You can change it.</p>
                                        )}
                                    </div>
                                </div>

                                {/* PRO Feature: Logo Upload */}
                                {isPro && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                            <Crown className="w-4 h-4 text-yellow-400" />
                                            Company Logo (PRO)
                                        </label>
                                        {!logoPreview ? (
                                            <label className="block">
                                                <input
                                                    ref={logoInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                                <div className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer bg-gray-800/30 hover:bg-gray-800/60 transition-all duration-300">
                                                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                                    <p className="text-gray-300 text-sm font-medium">Click to upload logo</p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG • Max 2MB</p>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="h-12 w-auto object-contain"
                                                        />
                                                        <div>
                                                            <p className="text-white text-sm font-medium">Logo uploaded</p>
                                                            <p className="text-gray-400 text-xs">{logoFile?.name}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveLogo}
                                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Remove logo"
                                                    >
                                                        <X className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                                    </button>
                                                </div>
                                                <label className="block">
                                                    <input
                                                        ref={logoInputRef}
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                                        onChange={handleLogoUpload}
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => logoInputRef.current?.click()}
                                                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Change Logo
                                                    </button>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Currency</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr.code} value={curr.code}>
                                                {curr.symbol} - {curr.name} ({curr.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-cyan-400" />
                                    Client/Customer Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Client Name
                                        </label>
                                        <input
                                            type="text"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Client or Company Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Client Email
                                        </label>
                                        <input
                                            type="email"
                                            name="clientEmail"
                                            value={formData.clientEmail}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="client@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Client Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="clientPhone"
                                            value={formData.clientPhone}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="+233(555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        Invoice Items
                                    </h2>
                                    <button
                                        onClick={addItem}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                            <div className="grid grid-cols-12 gap-3 items-end">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2">Item Name</label>
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(index, "name", e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="Product or service"
                                                    />
                                                </div>
                                                <div className="col-span-4 sm:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2">Qty</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        min="0"
                                                        step="1"
                                                    />
                                                </div>
                                                <div className="col-span-4 sm:col-span-3">
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2">Price</label>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, "price", e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div className="col-span-4 sm:col-span-2 flex items-center justify-between">
                                                    <div className="text-gray-400 text-sm font-semibold">
                                                        {formatCurrency(item.quantity * item.price, formData.currency)}
                                                    </div>
                                                    {formData.items.length > 1 && (
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    Payment Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                        <label className="block text-xs font-semibold text-gray-400 mb-2">Subtotal</label>
                                        <div className="text-2xl font-bold text-white">
                                            {formatCurrency(calculateTotal(), formData.currency)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Amount Paid</label>
                                        <input
                                            type="number"
                                            name="amountPaid"
                                            value={formData.amountPaid}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl p-4">
                                        <label className="block text-xs font-semibold text-blue-100 mb-2">Balance Due</label>
                                        <div className="text-2xl font-bold text-white">
                                            {formatCurrency(calculateBalance(), formData.currency)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Additional Notes (Optional)</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    rows="4"
                                    placeholder="Add payment terms, thank you message, or other notes..."
                                ></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleCustomize}
                                    className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-lg font-semibold border-2 border-gray-700 hover:border-gray-600 transition-all duration-300 relative"
                                >
                                    <Palette className="w-5 h-5" />
                                    Customize Invoice
                                    {isPro && (
                                        <span className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full">
                                            PRO
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={handleGenerate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    Generate Invoice
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PRO Feature: Live Preview Panel */}
                        {showPreview && isPro && formData.businessName && formData.invoiceNumber && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-blue-400" />
                                        Live Preview
                                        <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-full">
                                            PRO
                                        </span>
                                    </h2>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-white" style={{ height: "600px" }}>
                                    {formData && logoBase64 ? (
                                        <PDFViewer width="100%" height="100%">
                                            {InvoiceDocumentForViewer}
                                        </PDFViewer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
                                                <p>Loading preview...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setShowInvoice(false);
                                }}
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Form
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Download Invoice Section */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Download Invoice</h3>
                                        <p className="text-sm text-gray-400">Save as PDF to your device</p>
                                    </div>
                                </div>
                                {/* PHASE 8.5: Download button with PRO check */}
                                {isPro ? (
                                    <PDFDownloadLink
                                        document={InvoiceDocumentForDownload}
                                        fileName={`${formData.businessName || "Invoice"}_${formData.invoiceNumber || "temp"}.pdf`}
                                        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300"
                                    >
                                        {({ loading }) => (
                                            loading ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Generating...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Download className="w-5 h-5" />
                                                    <span>Download PDF</span>
                                                </div>
                                            )
                                        )}
                                    </PDFDownloadLink>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            // PHASE 8.5: Check authorization before allowing download
                                            try {
                                                await requestDownloadAuth();
                                                setUpgradeFeatureName('Download PDF invoices');
                                                setShowUpgradeModal(true);
                                            } catch (error) {
                                                if (error.message === 'FORBIDDEN') {
                                                    setUpgradeFeatureName('Download PDF invoices');
                                                    setShowUpgradeModal(true);
                                                } else if (error.message === 'UNAUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
                                                    showNotification({
                                                        type: 'error',
                                                        title: 'Session Expired',
                                                        message: 'Please sign in again to continue.',
                                                        autoClose: true,
                                                        autoCloseDelay: 3000
                                                    });
                                                    if (setCurrentPage) {
                                                        setCurrentPage('login');
                                                    }
                                                }
                                            }
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-3 bg-gray-700 text-gray-400 px-6 py-3 rounded-xl font-semibold cursor-not-allowed"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span>Download PDF (Pro)</span>
                                    </button>
                                )}
                            </div>

                            {/* WhatsApp Section */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Send via WhatsApp</h3>
                                        <p className="text-sm text-gray-400">
                                            {formData.clientPhone
                                                ? `Default: ${formData.clientPhone}`
                                                : "Enter phone number"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="tel"
                                        placeholder={formData.clientPhone || "Enter phone number (e.g., +1234567890)"}
                                        value={sendToPhone}
                                        onChange={(e) => setSendToPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const phoneToSend = sendToPhone.trim() || formData.clientPhone;
                                        if (!phoneToSend) {
                                            showNotification({
                                                type: 'warning',
                                                title: 'Phone Number Required',
                                                message: 'Please enter a phone number to send via WhatsApp.',
                                                autoClose: true,
                                                autoCloseDelay: 3000
                                            });
                                            return;
                                        }

                                        // Format phone number (remove spaces, dashes, etc.)
                                        const formattedPhone = phoneToSend.replace(/[\s\-\(\)]/g, '');
                                        
                                        // Generate invoice summary message
                                        const invoiceSummary = `Invoice #${formData.invoiceNumber}\n` +
                                            `From: ${formData.businessName}\n` +
                                            `Date: ${new Date(formData.date).toLocaleDateString()}\n` +
                                            `Total: ${formatCurrency(calculateBalance(), formData.currency)}\n\n` +
                                            `Please find your invoice attached.`;

                                        // Create WhatsApp link
                                        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(invoiceSummary)}`;
                                        
                                        // Open WhatsApp in new tab
                                        window.open(whatsappUrl, '_blank');
                                        
                                        showNotification({
                                            type: 'success',
                                            title: 'Opening WhatsApp',
                                            message: `WhatsApp is opening for ${phoneToSend}. You can attach the PDF manually.`,
                                            autoClose: true,
                                            autoCloseDelay: 3000
                                        });
                                    }}
                                    disabled={(!sendToPhone.trim() && !formData.clientPhone)}
                                    className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${(sendToPhone.trim() || formData.clientPhone)
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Open WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                Invoice Preview
                            </h2>
                            <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: "800px" }}>
                                {formData && logoBase64 ? (
                                    <PDFViewer width="100%" height="100%">
                                        {InvoiceDocumentForViewer}
                                    </PDFViewer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
                                            <p>Loading preview...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">How was your experience?</h2>
                                <p className="text-gray-400">Your feedback helps us improve our invoice generator</p>
                            </div>

                            {!feedback.submitted ? (
                                <div className="space-y-8">
                                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                        <label className="block text-center text-lg font-semibold text-gray-300 mb-4">
                                            Overall Experience
                                        </label>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                                                    onMouseEnter={() => setHoveredStar(star)}
                                                    onMouseLeave={() => setHoveredStar(0)}
                                                    className="transform transition-all duration-200 hover:scale-125"
                                                >
                                                    <svg
                                                        className={`w-12 h-12 transition-colors ${star <= (hoveredStar || feedback.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-gray-600 text-gray-600'
                                                            }`}
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        {feedback.rating > 0 && (
                                            <p className="text-center mt-4 text-cyan-400 font-medium animate-fade-in">
                                                {feedback.rating === 5 && "Amazing! 🎉"}
                                                {feedback.rating === 4 && "Great! 😊"}
                                                {feedback.rating === 3 && "Good! 👍"}
                                                {feedback.rating === 2 && "Could be better 🤔"}
                                                {feedback.rating === 1 && "We'll improve 💪"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                                            Additional Comments (Optional)
                                        </label>
                                        <textarea
                                            value={feedback.comments}
                                            onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            rows="4"
                                            placeholder="Tell us what you loved or how we can improve..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmitFeedback}
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Submit Feedback
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Thank you for your feedback!</h3>
                                    <p className="text-gray-400 mb-6">
                                        Your input helps us create better invoicing experiences
                                    </p>
                                    <button
                                        onClick={() => setFeedback({
                                            rating: 0,
                                            comments: "",
                                            submitted: false
                                        })}
                                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                                    >
                                        Submit another response
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* PHASE 8.5: Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName={upgradeFeatureName}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
};

export default InvoiceGenerator;
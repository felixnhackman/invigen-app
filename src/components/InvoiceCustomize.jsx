import React, { useState, useEffect, useRef } from "react";
import {
    Document,
    Page,
    Text,
    Image,
    View,
    StyleSheet,
    PDFViewer,
    Font
} from "@react-pdf/renderer";
import { Upload, Palette, ArrowLeft, Check, X } from 'lucide-react';
import hero from '../assets/hero.png';
import logo2 from '../assets/logo2.png';
import PoppinsBold from "../fonts/Poppins-Bold.ttf";
import PoppinsRegular from "../fonts/Poppins-Regular.ttf";
import NotoSansBold from "../fonts/NotoSans-Bold.ttf";

// Register fonts
Font.register({
    family: "Poppins",
    fonts: [
        {
            src: PoppinsRegular,
            fontWeight: "normal",
        },
        {
            src: PoppinsBold,
            fontWeight: "bold",
        },
    ],
});

Font.register({
    family: "Noto Sans",
    src: NotoSansBold,
});

// Predefined professional colors - Expanded palette
const ACCENT_COLORS = [
    { name: 'Midnight', value: '#0f172a', light: '#f1f5f9' },
    { name: 'Dark Charcoal', value: '#1e293b', light: '#f1f5f9' },
    { name: 'Ocean Blue', value: '#3b82f6', light: '#dbeafe' },
    { name: 'Deep Navy', value: '#1e3a8a', light: '#dbeafe' },
    { name: 'Sky Blue', value: '#0ea5e9', light: '#e0f2fe' },
    { name: 'Indigo', value: '#4f46e5', light: '#e0e7ff' },
    { name: 'Emerald', value: '#10b981', light: '#d1fae5' },
    { name: 'Forest Green', value: '#059669', light: '#d1fae5' },
    { name: 'Teal', value: '#14b8a6', light: '#ccfbf1' },
    { name: 'Lime', value: '#84cc16', light: '#ecfccb' },
    { name: 'Royal Purple', value: '#7c3aed', light: '#ede9fe' },
    { name: 'Violet', value: '#8b5cf6', light: '#ede9fe' },
    { name: 'Pink', value: '#ec4899', light: '#fce7f3' },
    { name: 'Rose', value: '#f43f5e', light: '#ffe4e6' },
    { name: 'Slate Gray', value: '#475569', light: '#f1f5f9' },
    { name: 'Zinc', value: '#52525b', light: '#f4f4f5' },
    { name: 'Crimson', value: '#dc2626', light: '#fee2e2' },
    { name: 'Orange', value: '#f97316', light: '#ffedd5' },
    { name: 'Amber', value: '#f59e0b', light: '#fef3c7' },
    { name: 'Yellow', value: '#eab308', light: '#fef9c3' },
];

const formatCurrency = (amount, currencyCode = "USD") => {
    const currencies = {
        USD: "$", EUR: "€", GBP: "£", GHS: "₵", NGN: "₦",
        ZAR: "R", JPY: "¥", CNY: "¥", CAD: "C$", AUD: "A$"
    };
    const symbol = currencies[currencyCode] || "$";
    return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
};

// PDF Styles matching InvoiceGenerator exactly - Compact version with accent color support
const createStyles = (accentColor) => StyleSheet.create({
    page: {
        padding: 54,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins",
    },

    // Header section
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
        color: accentColor,
    },

    // Dark card with business info - uses accent color
    businessCard: {
        backgroundColor: accentColor || "#1e293b",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    businessLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    customLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        objectFit: "contain",
        padding: 3,
    },
    businessInfo: {
        flexDirection: "column",
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

    // Two columns
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
        color: accentColor,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 8,
        color: "#64748b",
        marginBottom: 3,
    },

    // Items
    itemsHeader: {
        fontSize: 9,
        fontWeight: "bold",
        color: accentColor,
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

    // Summary
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
        backgroundColor: accentColor,
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

    // Notes
    notes: {
        marginTop: 20,
        paddingTop: 14,
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

    // Footer
    footer: {
        position: "absolute",
        bottom: 18,
        left: 32,
        right: 32,
        paddingTop: 2,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#253344ff",
        marginRight: 3,
    },
    footerLogo: {
        width: 140,
        height: 100,

    },
});

// Custom Invoice Document - matches InvoiceGenerator structure with customization
const CustomInvoiceDocument = ({ formData, customization, calculateTotal, calculateBalance, invigenLogoSrc }) => {
    const styles = createStyles(customization.accentColor);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header - same as InvoiceGenerator */}
                <View style={styles.header}>
                    <Text style={styles.invoiceLabel}>New Invoice</Text>
                    <Text style={styles.invoiceNumber}>{formData.invoiceNumber}</Text>
                </View>

                {/* Business Card - with custom color and logo */}
                <View style={styles.businessCard}>
                    <View style={styles.businessLeft}>
                        {customization.logoUrl && customization.logoUrl.trim() !== '' && (
                            <Image
                                src={customization.logoUrl}
                                style={styles.customLogo}
                            />
                        )}
                        <View style={styles.businessInfo}>
                            <Text style={styles.businessName}>{formData.businessName}</Text>
                            <Text style={styles.businessEmail}>{formData.clientEmail || "info@company.com"}</Text>
                        </View>
                    </View>
                    <View style={styles.dateSection}>
                        <Text style={styles.dateLabel}>Issue Date</Text>
                        <Text style={styles.dateValue}>
                            {new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Two Columns - same as InvoiceGenerator */}
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

                {/* Items - same as InvoiceGenerator */}
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

                {/* Summary - same as InvoiceGenerator */}
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

                {/* Notes - same as InvoiceGenerator */}
                {formData.note && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{formData.note}</Text>
                    </View>
                )}

                {/* Footer - uses the pre-loaded base64 source */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated with</Text>
                    {invigenLogoSrc && invigenLogoSrc.trim() !== '' && (
                        <Image
                            src={invigenLogoSrc}
                            style={styles.footerLogo}
                        />
                    )}
                </View>
            </Page>
        </Document>
    );
};

const InvoiceCustomizer = ({ formData, onSave, onCancel }) => {
    const [customization, setCustomization] = useState({
        logoUrl: '',
        logoFile: null,
        accentColor: '#1e293b',
    });

    const [invigenLogoBase64, setInvigenLogoBase64] = useState('');
    const [isLoadingLogo, setIsLoadingLogo] = useState(true);

    // Ref to clear file input
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadInvigenLogo = async () => {
            try {
                const response = await fetch(logo2);
                if (!response.ok) throw new Error("Failed to fetch logo2");
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                setInvigenLogoBase64(base64);
            } catch (error) {
                console.error("Error loading Invigen logo:", error);
                setInvigenLogoBase64(logo2);
            } finally {
                setIsLoadingLogo(false);
            }
        };
        loadInvigenLogo();
    }, []);

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const calculateBalance = () => calculateTotal() - parseFloat(formData.amountPaid || 0);

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PNG, JPG, or SVG file');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (result && typeof result === 'string') {
                setCustomization(prev => ({
                    ...prev,
                    logoUrl: result,
                    logoFile: file,
                }));
            }
        };
        reader.onerror = () => {
            console.error('Error reading file');
            alert('Failed to read file. Please try again.');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        // Trigger file input click to change logo
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleColorSelect = (color) => {
        setCustomization(prev => ({
            ...prev,
            accentColor: color,
        }));
    };

    const handleSave = () => {
        onSave(customization);
    };

    return (
        <div className="relative min-h-screen bg-gray-950 pt-20 bg-cover bg-center tracking-tighter" style={{
            backgroundImage: `url(${hero})`
        }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
                {/* Header with back button */}
                <div className="mb-10">
                    <button
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white bg-gray-900/50 hover:bg-gray-800/80 rounded-lg border border-gray-800 hover:border-gray-700 transition-all mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Form</span>
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                            <Palette className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400">CUSTOMIZATION</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                            Customize Your Invoice
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Add your brand logo and choose colors to create a professional, personalized invoice
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    {/* Left: Customization Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo Upload Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-white mb-1">Brand Logo</h2>
                                    <p className="text-sm text-gray-400 leading-relaxed">Upload your company logo (PNG with transparent background recommended)</p>
                                </div>
                            </div>

                            {!customization.logoUrl ? (
                                <label className="block">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <div className="group border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl p-10 text-center cursor-pointer bg-gray-800/30 hover:bg-gray-800/60 transition-all duration-300">
                                        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-14 h-14 text-gray-600 group-hover:text-blue-400 mx-auto transition-colors" />
                                        </div>
                                        <p className="text-gray-300 font-semibold mb-2 group-hover:text-white transition-colors">Click to upload logo</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, or SVG • Max 2MB</p>
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-xl p-8 flex items-center justify-center min-h-[160px]">
                                        <img
                                            src={customization.logoUrl}
                                            alt="Brand logo preview"
                                            className="max-h-32 max-w-full object-contain drop-shadow-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveLogo}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-blue-900/30 text-gray-300 hover:text-blue-400 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all font-medium"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Change Logo
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Color Selection Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                                    <Palette className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-white mb-1">Header Color</h2>
                                    <p className="text-sm text-gray-400 leading-relaxed">Choose a color for the invoice header card</p>
                                </div>
                            </div>

                            {/* Color categories */}
                            <div className="space-y-5 mb-6">
                                {/* Dark & Neutrals */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dark & Neutrals</h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {ACCENT_COLORS.slice(0, 4).map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleColorSelect(color.value)}
                                                className={`relative group h-16 rounded-xl transition-all duration-300 ${customization.accentColor === color.value
                                                    ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-800 scale-105 shadow-xl'
                                                    : 'hover:scale-105 shadow-lg hover:shadow-xl'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            >
                                                {customization.accentColor === color.value && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                            <Check className="w-4 h-4 text-gray-900" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap bg-gray-900 px-2 py-1 rounded border border-gray-700 shadow-lg">
                                                        {color.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Blues & Purples */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Blues & Purples</h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {ACCENT_COLORS.slice(4, 12).map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleColorSelect(color.value)}
                                                className={`relative group h-16 rounded-xl transition-all duration-300 ${customization.accentColor === color.value
                                                    ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-800 scale-105 shadow-xl'
                                                    : 'hover:scale-105 shadow-lg hover:shadow-xl'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            >
                                                {customization.accentColor === color.value && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                            <Check className="w-4 h-4 text-gray-900" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap bg-gray-900 px-2 py-1 rounded border border-gray-700 shadow-lg">
                                                        {color.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Warm Colors */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Warm & Vibrant</h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {ACCENT_COLORS.slice(12, 20).map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleColorSelect(color.value)}
                                                className={`relative group h-16 rounded-xl transition-all duration-300 ${customization.accentColor === color.value
                                                    ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-800 scale-105 shadow-xl'
                                                    : 'hover:scale-105 shadow-lg hover:shadow-xl'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            >
                                                {customization.accentColor === color.value && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                            <Check className="w-4 h-4 text-gray-900" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap bg-gray-900 px-2 py-1 rounded border border-gray-700 shadow-lg">
                                                        {color.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Selected color preview */}
                            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-400">Selected Color</span>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-md"
                                            style={{ backgroundColor: customization.accentColor }}
                                        ></div>
                                        <span className="text-sm font-mono text-gray-300">{customization.accentColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Check className="w-5 h-5" />
                            Save & Preview
                        </button>

                        {/* Info Box */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-300 leading-relaxed">
                                        <strong className="font-semibold">Free Tier:</strong> Includes one logo and header color.
                                        Advanced features like multiple color zones and positioning coming in Pro.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Live Preview
                                </h2>
                                <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 font-medium">
                                    Updates in real-time
                                </span>
                            </div>
                            <div className="rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-white" style={{ height: "calc(100vh - 220px)", minHeight: "600px" }}>
                                <PDFViewer width="100%" height="100%" className="border-0">
                                    <CustomInvoiceDocument
                                        formData={formData}
                                        customization={customization}
                                        calculateTotal={calculateTotal}
                                        calculateBalance={calculateBalance}
                                        invigenLogoSrc={invigenLogoBase64}
                                    />
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { InvoiceCustomizer, CustomInvoiceDocument, ACCENT_COLORS };
export default InvoiceCustomizer;

import React, { useState, useEffect } from "react";
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

// Predefined professional colors
const ACCENT_COLORS = [
    { name: 'Ocean Blue', value: '#3b82f6', light: '#dbeafe' },
    { name: 'Deep Navy', value: '#1e3a8a', light: '#dbeafe' },
    { name: 'Emerald', value: '#10b981', light: '#d1fae5' },
    { name: 'Forest Green', value: '#059669', light: '#d1fae5' },
    { name: 'Royal Purple', value: '#7c3aed', light: '#ede9fe' },
    { name: 'Slate Gray', value: '#475569', light: '#f1f5f9' },
    { name: 'Crimson', value: '#dc2626', light: '#fee2e2' },
    { name: 'Amber', value: '#f59e0b', light: '#fef3c7' },
];

const formatCurrency = (amount, currencyCode = "USD") => {
    const currencies = {
        USD: "$", EUR: "€", GBP: "£", GHS: "₵", NGN: "₦",
        ZAR: "R", JPY: "¥", CNY: "¥", CAD: "C$", AUD: "A$"
    };
    const symbol = currencies[currencyCode] || "$";
    return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
};

// PDF Styles with dynamic colors
const createStyles = (accentColor) => StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins",
        letterSpacing: -0.5,
    },
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: accentColor || "#3b82f6",
        paddingBottom: 20,
    },
    logoSection: {
        width: "40%",
    },
    customLogo: {
        width: 140,
        height: 80,
        marginBottom: 10,
        objectFit: "contain",
    },
    businessName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 4,
    },
    invoiceDetails: {
        width: "50%",
        textAlign: "right",
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: accentColor || "#1e293b",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 4,
    },
    clientSection: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
    },
    clientLabel: {
        fontSize: 10,
        fontWeight: "bold",
        color: accentColor || "#64748b",
        marginBottom: 5,
    },
    clientName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 3,
    },
    clientEmail: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 2,
    },
    clientPhone: {
        fontSize: 10,
        color: "#64748b",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f1f5f9",
        borderBottomWidth: 2,
        borderColor: accentColor || "#3b82f6",
        fontWeight: "bold",
        fontSize: 10,
        minHeight: 28,
        alignItems: "center",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        minHeight: 26,
        alignItems: "center",
    },
    col1: { width: "50%", textAlign: "left", padding: 8, fontSize: 10, color: "#1e293b" },
    col2: { width: "15%", textAlign: "center", padding: 8, fontSize: 10, color: "#1e293b" },
    col3: { width: "15%", textAlign: "right", padding: 8, fontSize: 10, color: "#1e293b", fontFamily: "Noto Sans" },
    col4: { width: "20%", textAlign: "right", padding: 8, fontSize: 10, color: "#1e293b", fontFamily: "Noto Sans" },
    summary: {
        marginTop: 30,
        width: "100%",
        alignItems: "flex-end",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 6,
    },
    summaryLabel: { width: 90, fontSize: 11, fontWeight: "bold", color: "#475569" },
    summaryValue: { width: 80, fontSize: 11, textAlign: "right", color: "#1e293b", fontFamily: "Noto Sans" },
    balanceDue: { fontSize: 14, fontWeight: "bold", color: accentColor || "#1e293b", fontFamily: "Noto Sans" },
    noteSection: {
        marginTop: 25,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },
    noteTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 6,
        color: accentColor || "#1e293b"
    },
    noteText: { fontSize: 10, color: "#64748b", lineHeight: 1.5 },
    footer: {
        marginTop: 40,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#94a3b8",
        marginRight: 5,
    },
    footerLogo: {
        width: 60,
        height: 20,
        objectFit: "contain",
    },
});

// Custom Invoice Document with branding
const CustomInvoiceDocument = ({ formData, customization, calculateTotal, calculateBalance, invigenLogoSrc }) => {
    const styles = createStyles(customization.accentColor);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerSection}>
                    <View style={styles.logoSection}>
                        {customization.logoUrl && (
                            <Image src={customization.logoUrl} style={styles.customLogo} />
                        )}
                        <Text style={styles.businessName}>{formData.businessName || "Business Name"}</Text>
                    </View>
                    <View style={styles.invoiceDetails}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.subtitle}>Invoice #: {formData.invoiceNumber || "INV-XXX"}</Text>
                        <Text style={styles.subtitle}>Date: {formData.date ? new Date(formData.date).toLocaleDateString() : "-"}</Text>
                    </View>
                </View>

                {(formData.clientName || formData.clientEmail || formData.clientPhone) && (
                    <View style={styles.clientSection}>
                        <Text style={styles.clientLabel}>BILL TO:</Text>
                        {formData.clientName && <Text style={styles.clientName}>{formData.clientName}</Text>}
                        {formData.clientEmail && <Text style={styles.clientEmail}>Email: {formData.clientEmail}</Text>}
                        {formData.clientPhone && <Text style={styles.clientPhone}>Phone: {formData.clientPhone}</Text>}
                    </View>
                )}

                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Item</Text>
                    <Text style={styles.col2}>Qty</Text>
                    <Text style={styles.col3}>Price</Text>
                    <Text style={styles.col4}>Total</Text>
                </View>

                <View>
                    {formData.items.map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.col1}>{item.name}</Text>
                            <Text style={styles.col2}>{item.quantity}</Text>
                            <Text style={styles.col3}>{formatCurrency(item.price, formData.currency)}</Text>
                            <Text style={styles.col4}>{formatCurrency(item.quantity * item.price, formData.currency)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(calculateTotal(), formData.currency)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Paid:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(formData.amountPaid, formData.currency)}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 2, borderTopColor: "#1e293b", paddingTop: 6 }]}>
                        <Text style={[styles.summaryLabel, styles.balanceDue]}>Balance Due:</Text>
                        <Text style={[styles.summaryValue, styles.balanceDue]}>{formatCurrency(calculateBalance(), formData.currency)}</Text>
                    </View>
                </View>

                {formData.note && (
                    <View style={styles.noteSection}>
                        <Text style={styles.noteTitle}>Note:</Text>
                        <Text style={styles.noteText}>{formData.note}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated with</Text>
                    <Image src={invigenLogoSrc || logo2} style={styles.footerLogo} />
                </View>
            </Page>
        </Document>
    );
};

const InvoiceCustomizer = ({ formData, onSave, onCancel }) => {
    const [customization, setCustomization] = useState({
        logoUrl: null,
        logoFile: null,
        accentColor: '#3b82f6',
    });

    const [invigenLogoBase64, setInvigenLogoBase64] = useState(logo2);

    useEffect(() => {
        const loadInvigenLogo = async () => {
            try {
                const response = await fetch(logo2);
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
            }
        };
        loadInvigenLogo();
    }, []);

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const calculateBalance = () => calculateTotal() - parseFloat(formData.amountPaid || 0);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PNG, JPG, or SVG file');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomization(prev => ({
                    ...prev,
                    logoUrl: reader.result,
                    logoFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setCustomization(prev => ({
            ...prev,
            logoUrl: null,
            logoFile: null,
        }));
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Form
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tighter">
                            Customize Your Invoice
                        </h1>
                        <p className="text-xl text-gray-400">
                            Add your brand to create professional, personalized invoices
                        </p>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Customization Controls */}
                    <div className="space-y-6">
                        {/* Logo Upload */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Brand Logo</h2>
                                    <p className="text-sm text-gray-400">Upload your company logo (PNG, JPG, SVG)</p>
                                </div>
                            </div>

                            {!customization.logoUrl ? (
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-all">
                                        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-300 font-medium mb-2">Click to upload logo</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, or SVG (max 2MB)</p>
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex items-center justify-center">
                                        <img
                                            src={customization.logoUrl}
                                            alt="Brand logo preview"
                                            className="max-h-24 max-w-full object-contain"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveLogo}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-red-900/20 text-gray-300 hover:text-red-400 rounded-xl border border-gray-700 hover:border-red-900/50 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove Logo
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Color Selection */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Accent Color</h2>
                                    <p className="text-sm text-gray-400">Choose a color for headers and highlights</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {ACCENT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => handleColorSelect(color.value)}
                                        className={`relative group h-16 rounded-xl transition-all ${customization.accentColor === color.value
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {customization.accentColor === color.value && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check className="w-6 h-6 text-white drop-shadow-lg" />
                                            </div>
                                        )}
                                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Check className="w-5 h-5" />
                            Save Customization
                        </button>

                        {/* Info Box */}
                        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
                            <p className="text-sm text-blue-300">
                                <strong>Free Tier:</strong> One logo and accent color included.
                                Advanced positioning and multiple logos will be available in Pro.
                            </p>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-6">Live Preview</h2>
                        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: "800px" }}>
                            <PDFViewer width="100%" height="100%">
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
    );
};

export { InvoiceCustomizer, CustomInvoiceDocument, ACCENT_COLORS };
export default InvoiceCustomizer;
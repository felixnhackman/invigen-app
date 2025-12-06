import React, { useState, useEffect } from "react";
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
import { Plus, Trash2, Download, ArrowLeft, ArrowRight, Send, Mail, User, Building2, CheckCircle, Phone as PhoneIcon, FileText } from 'lucide-react';
import hero from '../assets/hero.png';
import logo2 from '../assets/logo2.png';
import PoppinsBold from "../fonts/Poppins-Bold.ttf";
import PoppinsRegular from "../fonts/Poppins-Regular.ttf";
import PoppinsSemiBold from "../fonts/Poppins-SemiBold.ttf";
import NotoSansBold from "../fonts/NotoSans-Bold.ttf";

import emailjs from '@emailjs/browser';
const SERVICE_ID = 'invigen_email_service';
// Renamed INVOICE_TEMPLATE_ID for clarity
const INVOICE_TEMPLATE_ID = 'template_ygm8pjo';
// New template ID for the user feedback email
const FEEDBACK_TEMPLATE_ID = 'feedback_invigen';
const PUBLIC_KEY = 'IP5q2YStka3oDD-zQ';

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

// FIX: Register a comprehensive font (Noto Sans) for currency symbols like Cedi (₵)
Font.register({
    family: "Noto Sans",
    src: NotoSansBold,
});

const styles = StyleSheet.create({
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
        borderBottomColor: "#3b82f6",
        paddingBottom: 20,
    },
    logoSection: {
        width: "40%",
    },
    logo: {
        width: 160,
        height: 120,
        marginBottom: 10,
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
        color: "#1e293b",
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
        color: "#64748b",
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
        borderColor: "#3b82f6",
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
    // FIX: Apply Noto Sans to currency columns to support special symbols
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
    // FIX: Apply Noto Sans to summary values
    summaryValue: { width: 80, fontSize: 11, textAlign: "right", color: "#1e293b", fontFamily: "Noto Sans" },
    balanceDue: { fontSize: 14, fontWeight: "bold", color: "#1e293b", fontFamily: "Noto Sans" },
    noteSection: {
        marginTop: 25,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },
    noteTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, color: "#1e293b" },
    noteText: { fontSize: 10, color: "#64748b", lineHeight: 1.5 },
});

const formatCurrency = (amount, currencyCode = "USD") => {
    const currencies = {
        USD: "$", EUR: "€", GBP: "£", GHS: "₵", NGN: "₦",
        ZAR: "R", JPY: "¥", CNY: "¥", CAD: "C$", AUD: "A$"
    };
    const symbol = currencies[currencyCode] || "$";
    return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
};

const InvoiceDocument = ({ formData, calculateTotal, calculateBalance, logoSrc }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.headerSection}>
                <View style={styles.logoSection}>
                    <Image src={logoSrc || logo2} style={styles.logo} />
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
        </Page>
    </Document>
);

const InvoiceGenerator = ({ onFinalDownload }) => {
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
    const [emailSent, setEmailSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [logoBase64, setLogoBase64] = useState(logo2);

    useEffect(() => {
        const loadLogo = async () => {
            const base64 = await getBase64Image(logo2);
            if (base64) {
                setLogoBase64(base64);
            }
        };
        loadLogo();
    }, []);

    useEffect(() => {
        emailjs.init(PUBLIC_KEY);
    }, []);

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const calculateBalance = () => calculateTotal() - parseFloat(formData.amountPaid || 0);

    const handleGenerate = () => {
        if (!formData.businessName || !formData.invoiceNumber) {
            alert("Please fill in Business Name and Invoice Number");
            return;
        }
        setShowInvoice(true);
        setEmailSent(false);
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => {
            const items = [...prev.items];
            if (field === "quantity" || field === "price") {
                items[index][field] = value === "" ? "" : Number(value);
            } else {
                items[index][field] = value;
            }
            return { ...prev, items };
        });
    };

    const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: "", quantity: 1, price: 0 }] }));
    const removeItem = (index) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendEmail = async () => {
        if (!formData.clientEmail) {
            alert("Please enter a client email address");
            return;
        }

        if (!emailjs || !SERVICE_ID || !INVOICE_TEMPLATE_ID || !PUBLIC_KEY) {
            alert("Email service is not configured. Check the setup instructions in the code.");
            return;
        }

        setIsSending(true);

        try {
            const blob = await pdf(
                <InvoiceDocument
                    formData={formData}
                    calculateTotal={calculateTotal}
                    calculateBalance={calculateBalance}
                    logoSrc={logoBase64}
                />
            ).toBlob();

            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const templateParams = {
                client_name: formData.clientName || 'Valued Client',
                client_email: formData.clientEmail,
                client_phone: formData.clientPhone,
                invoice_number: formData.invoiceNumber,
                businessName: formData.businessName,
                subtotal: calculateTotal().toFixed(2),
                amount_paid: parseFloat(formData.amountPaid || 0).toFixed(2),
                balance_due: calculateBalance().toFixed(2),
                date: new Date(formData.date).toLocaleDateString(),
                note: formData.note,
                year: new Date().getFullYear(),
                pdf_download_link: base64Data,
                currency: formData.currency
            };

            await emailjs.send(SERVICE_ID, INVOICE_TEMPLATE_ID, templateParams, PUBLIC_KEY);

            setEmailSent(true);
            alert(`Invoice sent successfully to ${formData.clientEmail}!`);

        } catch (error) {
            console.error("Error generating or sending PDF:", error);
            alert('Failed to send email. Please check your EmailJS configuration and network connection.');
        } finally {
            setIsSending(false);
        }
    };

    // NEW: Function to handle feedback submission to EmailJS
    const handleSubmitFeedback = async () => {
        if (!feedback.rating) {
            alert("Please rate your overall experience before submitting.");
            return;
        }

        // To prevent multiple submissions
        if (feedback.submitted) return;

        try {
            const templateParams = {
                rating: feedback.rating,
                user_comments: feedback.comments,
                invoice_number: formData.invoiceNumber || 'N/A', // Context
                business_name: formData.businessName || 'N/A', // Context
                year: new Date().getFullYear(),
                // Use a dynamic subject for easy triage
                subject: `[Invigen Feedback] Rating: ${feedback.rating}/5 Stars`,
            };

            // Assuming we are sending the feedback to a predefined email (e.g., your support email)
            // which is set in the EmailJS template window 'template_feedback_invigen'.
            await emailjs.send(SERVICE_ID, FEEDBACK_TEMPLATE_ID, templateParams, PUBLIC_KEY);

            // Update local state only after successful submission
            setFeedback(prev => ({ ...prev, submitted: true }));
            alert('Feedback submitted successfully! Thank you.');

        } catch (error) {
            console.error("Error sending feedback:", error);
            alert('Failed to submit feedback. Please check your EmailJS configuration and network connection.');
            // Revert submission state on failure
            setFeedback(prev => ({ ...prev, submitted: false }));
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-950 pt-20 bg-cover bg-center tracking-tighter" style={{
            backgroundImage: `url(${hero})`
        }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative max-w-5xl mx-auto px-4 py-12 md:max-w-6xl">
                {!showInvoice ? (
                    <>
                        <div className="text-center mb-12">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tighter">
                                Generate Invoice
                            </h1>
                            <p className="text-xl text-gray-400">
                                Create professional invoices in seconds
                            </p>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    Business Information
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
                                            placeholder="INV-001"
                                        />
                                    </div>
                                </div>

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
                                                        placeholder=""
                                                        min=""
                                                    />
                                                </div>
                                                <div className="col-span-4 sm:col-span-3">
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2">Price</label>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, "price", e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder=""
                                                        min=""
                                                        step="1"
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

                            <button
                                onClick={handleGenerate}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                Generate Invoice
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex justify-between items-center">
                            <button
                                onClick={() => setShowInvoice(false)}
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Form
                            </button>

                            {/* <button
                                onClick={() => onFinalDownload(formData)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Go to Download Link
                            </button> */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <PDFDownloadLink
                                    document={<InvoiceDocument formData={formData} calculateTotal={calculateTotal} calculateBalance={calculateBalance} logoSrc={logoBase64} />}
                                    fileName={`${formData.businessName || "Invoice"}_${formData.invoiceNumber || "temp"}.pdf`}
                                    className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300"
                                >
                                    {({ loading }) => (
                                        <>
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-5 h-5" />
                                                    Download PDF
                                                </>
                                            )}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Send via Email</h3>
                                        <p className="text-sm text-gray-400">
                                            {formData.clientEmail
                                                ? `${formData.clientEmail}`
                                                : "No email provided"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={!formData.clientEmail || isSending || emailSent}
                                    className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${emailSent
                                        ? 'bg-green-600 text-white'
                                        : formData.clientEmail && !isSending
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {emailSent ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Email Sent!
                                        </>
                                    ) : isSending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Invoice
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                Invoice Preview
                            </h2>
                            <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: "800px" }}>
                                <PDFViewer width="100%" height="100%">
                                    <InvoiceDocument formData={formData} calculateTotal={calculateTotal} calculateBalance={calculateBalance} logoSrc={logoBase64} />
                                </PDFViewer>
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
                                        onClick={() => {
                                            if (feedback.rating === 0) {
                                                alert("Please rate your overall experience");
                                                return;
                                            }
                                            // Call the new EmailJS submission function
                                            handleSubmitFeedback();
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <Send className="w-5 h-5" />
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
                                            // clarity: 0, // Reset unused properties too
                                            // professionalism: 0,
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
        </div>
    );
};

export default InvoiceGenerator;

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { pdf, Document, Page, Text, Image, View, StyleSheet } from "@react-pdf/renderer";
import logo2 from '../assets/logo2.png';
import hero from '../assets/hero.png';

// --- Replicating PDF Structure from InvoiceGenerator.jsx ---
// Ensure all necessary components (InvoiceDocument, styles, formatCurrency, getBase64Image) 
// are available in this file or imported from a common utility file. 
// For simplicity, I'm including the PDF logic here, as your original file did.

// Utility function (from your InvoiceGenerator.jsx)
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

// PDF Styles (from your InvoiceGenerator.jsx)
const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
    headerSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottomWidth: 2, borderBottomColor: "#3b82f6", paddingBottom: 20 },
    logoSection: { width: "40%" },
    logo: { width: 150, height: 120, marginBottom: 10 },
    businessName: { fontSize: 24, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
    invoiceDetails: { width: "50%", textAlign: "right" },
    invoiceTitle: { fontSize: 28, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
    subtitle: { fontSize: 11, color: "#64748b", marginTop: 4 },
    clientSection: { marginBottom: 25, padding: 15, backgroundColor: "#f8fafc", borderRadius: 8 },
    clientLabel: { fontSize: 10, fontWeight: "bold", color: "#64748b", marginBottom: 5 },
    clientName: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 3 },
    clientEmail: { fontSize: 10, color: "#64748b", marginBottom: 2 },
    clientPhone: { fontSize: 10, color: "#64748b" },
    tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", borderBottomWidth: 2, borderColor: "#3b82f6", fontWeight: "bold", fontSize: 10, minHeight: 28, alignItems: "center" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", minHeight: 26, alignItems: "center" },
    col1: { width: "50%", textAlign: "left", padding: 8, fontSize: 10, color: "#1e293b" },
    col2: { width: "15%", textAlign: "center", padding: 8, fontSize: 10, color: "#1e293b" },
    col3: { width: "15%", textAlign: "right", padding: 8, fontSize: 10, color: "#1e293b" },
    col4: { width: "20%", textAlign: "right", padding: 8, fontSize: 10, color: "#1e293b" },
    summary: { marginTop: 20, width: "100%", alignItems: "flex-end" },
    summaryRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 },
    summaryLabel: { width: 90, fontSize: 11, fontWeight: "bold", color: "#475569" },
    summaryValue: { width: 80, fontSize: 11, textAlign: "right", color: "#1e293b" },
    balanceDue: { fontSize: 14, fontWeight: "bold", color: "#1e293b" },
    noteSection: { marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
    noteTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, color: "#1e293b" },
    noteText: { fontSize: 10, color: "#64748b", lineHeight: 1.5 },
});

const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;

// Invoice Document (from your InvoiceGenerator.jsx)
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
            {/* ... rest of the PDF content layout ... */}
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
                        <Text style={styles.col3}>{formatCurrency(item.price)}</Text>
                        <Text style={styles.col4}>{formatCurrency(item.quantity * item.price)}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(calculateTotal())}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Paid:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(formData.amountPaid)}</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 2, borderTopColor: "#1e293b", paddingTop: 6 }]}>
                    <Text style={[styles.summaryLabel, styles.balanceDue]}>Balance Due:</Text>
                    <Text style={[styles.summaryValue, styles.balanceDue]}>{formatCurrency(calculateBalance())}</Text>
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

const InvoiceDownloadPage = ({ formData, onBack }) => {
    const [downloadStatus, setDownloadStatus] = useState('generating'); // 'generating', 'downloaded', 'error'
    const [logoBase64, setLogoBase64] = useState(logo2);

    // Replicate calculations locally
    const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const calculateBalance = () => calculateTotal() - parseFloat(formData.amountPaid || 0);

    // 1. Load Logo Base64
    useEffect(() => {
        const loadLogo = async () => {
            const base64 = await getBase64Image(logo2);
            if (base64) {
                setLogoBase64(base64);
            }
        };
        loadLogo();
    }, []);

    // 2. Auto-Download Effect
    useEffect(() => {
        const generateAndDownload = async () => {
            if (logoBase64 === logo2 && !logoBase64.startsWith('data:')) {
                // Wait for Base64 logo to load before generating PDF
                return;
            }

            try {
                const doc = (
                    <InvoiceDocument
                        formData={formData}
                        calculateTotal={calculateTotal}
                        calculateBalance={calculateBalance}
                        logoSrc={logoBase64}
                    />
                );

                const asPdf = pdf(doc);
                const blob = await asPdf.toBlob();

                // Create a temporary link element
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${formData.businessName || "Invoice"}_${formData.invoiceNumber || "temp"}.pdf`;

                // Trigger the download
                document.body.appendChild(a);
                a.click();

                // Clean up and set status
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setDownloadStatus('downloaded');

            } catch (error) {
                console.error("Failed to auto-download PDF:", error);
                setDownloadStatus('error');
            }
        };

        generateAndDownload();
    }, [formData, logoBase64]);


    let icon = <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>;
    let title = "Preparing Your Invoice...";
    let message = "Your PDF invoice is being generated and the download should start automatically in a moment.";

    if (downloadStatus === 'downloaded') {
        icon = <CheckCircle className="w-12 h-12 text-green-500" />;
        title = "Download Initialized!";
        message = "Your download is complete. If it didn't start automatically, click the button below.";
    } else if (downloadStatus === 'error') {
        icon = <Download className="w-12 h-12 text-red-500" />;
        title = "Download Failed";
        message = "There was an error generating the PDF. Please go back and try again.";
    }

    return (
        <div className="relative min-h-screen bg-gray-950 pt-20 bg-cover bg-center tracking-tighter" style={{
            backgroundImage: `url(${hero})`
        }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative max-w-xl mx-auto px-4 py-12 md:max-w-2xl">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10 shadow-xl text-center">

                    {/* Status Icon */}
                    <div className="flex justify-center mb-8">
                        {icon}
                    </div>

                    {/* Status Text */}
                    <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
                    <p className="text-md text-gray-400 mb-8">{message}</p>

                    {/* Manual Download Button (for safety) */}
                    <button
                        onClick={onBack}
                        className="inline-flex items-center justify-center gap-3 bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back to Generator
                    </button>

                    {downloadStatus !== 'downloaded' && downloadStatus !== 'error' && (
                        <div className="mt-4 text-sm text-gray-500">
                            (If your download does not start, click "Go Back" to use the manual button.)
                        </div>
                    )}

                </div>

                {/* Footer or branding element */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Powered by Invigen Invoice Generator
                </div>
            </div>
        </div>
    );
};

export default InvoiceDownloadPage;
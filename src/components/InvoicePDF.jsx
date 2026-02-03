import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font
} from "@react-pdf/renderer";

// Optional: add custom font
Font.register({
    family: "OpenSans",
    src: "https://fonts.gstatic.com/s/opensans/v29/mem8YaGs126MiZpBA-UFUK0Udc1UAw.ttf"
});

const styles = StyleSheet.create({
    page: {
        fontFamily: "OpenSans",
        fontSize: 12,
        padding: 40,
        backgroundColor: "#fff"
    },
    header: {
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4
    },
    subHeader: {
        fontSize: 12,
        marginBottom: 2
    },
    table: {
        display: "table",
        width: "auto",
        marginTop: 10,
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        flexDirection: "row"
    },
    tableColHeader: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#f0f0f0",
        padding: 4,
        fontWeight: "bold"
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 4
    },
    summary: {
        marginTop: 20,
        width: "50%",
        alignSelf: "flex-end"
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4
    },
    note: {
        marginTop: 20,
        fontStyle: "italic"
    },
    signature: {
        marginTop: 50,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    sigBox: {
        borderTopWidth: 1,
        borderTopColor: "#000",
        width: "45%",
        textAlign: "center",
        paddingTop: 4
    }
});

const InvoicePDF = ({ formData, calculateTotal, calculateBalance }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{formData.businessName}</Text>
                    <Text style={styles.subHeader}>Invoice #: {formData.invoiceNumber}</Text>
                    <Text style={styles.subHeader}>
                        Date: {new Date(formData.date).toLocaleDateString()}
                    </Text>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Item</Text>
                        <Text style={styles.tableColHeader}>Qty</Text>
                        <Text style={styles.tableColHeader}>Price</Text>
                        <Text style={styles.tableColHeader}>Total</Text>
                    </View>

                    {/* Table Rows */}
                    {formData.items.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={styles.tableCol}>{item.name}</Text>
                            <Text style={styles.tableCol}>{item.quantity}</Text>
                            <Text style={styles.tableCol}>${item.price.toFixed(2)}</Text>
                            <Text style={styles.tableCol}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text>Subtotal:</Text>
                        <Text>${calculateTotal().toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>Paid:</Text>
                        <Text>${parseFloat(formData.amountPaid).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ fontWeight: "bold" }}>Balance Due:</Text>
                        <Text style={{ fontWeight: "bold" }}>
                            ${calculateBalance().toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {formData.note && <Text style={styles.note}>{formData.note}</Text>}

                {/* Signature Fields */}
                <View style={styles.signature}>
                    <Text style={styles.sigBox}>Authorized Signature</Text>
                    <Text style={styles.sigBox}>Customer Signature</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;

# EmailJS Setup Guide - Complete Walkthrough

This guide will walk you through setting up EmailJS from scratch to enable email sending in your Invigen app.

## 📋 Prerequisites

- A Gmail account (or any email service)
- Access to your Gmail account settings
- Your Invigen app codebase

---

## Step 1: Create EmailJS Account

1. **Go to EmailJS website**
   - Visit: https://www.emailjs.com/
   - Click **"Sign Up"** (top right corner)

2. **Sign up options**
   - You can sign up with:
     - Email address
     - Google account
     - GitHub account
   - Choose the easiest option for you

3. **Verify your email** (if using email signup)
   - Check your inbox for verification email
   - Click the verification link

---

## Step 2: Create an Email Service (Connect Gmail)

1. **Navigate to Email Services**
   - After logging in, you'll see the dashboard
   - Click **"Email Services"** in the left sidebar
   - Or go directly to: https://dashboard.emailjs.com/admin/integration

2. **Add New Service**
   - Click the **"+ Add New Service"** button
   - You'll see a list of email providers

3. **Select Gmail**
   - Click on **"Gmail"** from the list
   - Click **"Connect Account"**

4. **Authorize Gmail**
   - A popup will open asking you to sign in to Google
   - Sign in with the Gmail account you want to use for sending invoices
   - Click **"Allow"** to grant EmailJS permission to send emails on your behalf
   - You'll see a success message

5. **Name Your Service**
   - Give it a name like: `invigen_email_service`
   - Click **"Create Service"**
   - **Important:** Remember this name - you'll need it for your code!

6. **Verify Connection**
   - You should see your service listed with a green checkmark or "Connected" status
   - Note the **Service ID** - it's usually the same as the service name

---

## Step 3: Create Email Template

1. **Navigate to Email Templates**
   - Click **"Email Templates"** in the left sidebar
   - Or go to: https://dashboard.emailjs.com/admin/template

2. **Create New Template**
   - Click **"+ Create New Template"**

3. **Template Settings**
   - **Template Name:** `Invoice Email` or `Invoice Template`
   - **Subject:** `Invoice from {{business_name}} - Invoice #{{invoice_number}}`
   
4. **Template Content**
   Copy and paste this template (or customize it):

   ```
   Hello {{client_name}},

   Please find your invoice attached below.

   Invoice Details:
   - Invoice Number: {{invoice_number}}
   - Date: {{date}}
   - Business: {{business_name}}
   - Subtotal: {{subtotal}}
   - Amount Paid: {{amount_paid}}
   - Balance Due: {{balance_due}}
   - Currency: {{currency}}

   {% if note != 'N/A' %}
   Notes: {{note}}
   {% endif %}

   Thank you for your business!

   Best regards,
   {{business_name}}
   ```

5. **Add Attachment (PDF)**
   - Scroll down to find **"Attachments"** section
   - Click **"Add Attachment"**
   - Select **"From Variable"**
   - Variable name: `pdf_attachment`
   - File name: `Invoice_{{invoice_number}}.pdf`
   - Click **"Save"**

6. **Save Template**
   - Click **"Save"** button at the top
   - **Important:** Note the **Template ID** - it looks like `template_xxxxxxx`
   - You'll see it in the URL or template settings

---

## Step 4: Get Your Public Key

1. **Navigate to Account Settings**
   - Click your profile/account icon (top right)
   - Click **"Account"** or **"General"**

2. **Find Public Key**
   - Look for **"Public Key"** or **"API Keys"** section
   - Copy the **Public Key** - it looks like: `xxxxxxxxxxxxx`
   - This is safe to use in frontend code (it's public)

---

## Step 5: Update Your Code

Now update your `InvoiceGenerator.jsx` file with your actual values:

1. **Open** `src/components/InvoiceGenerator.jsx`

2. **Find the EmailJS Configuration section** (around line 30):

   ```javascript
   // EmailJS Configuration
   const SERVICE_ID = 'invigen_email_service';  // ← Your service name
   const INVOICE_TEMPLATE_ID = 'template_ygm8pjo';  // ← Your template ID
   const FEEDBACK_TEMPLATE_ID = 'feedback_invigen';  // ← Optional: for feedback
   const PUBLIC_KEY = 'IP5q2YStka3oDD-zQ';  // ← Your public key
   ```

3. **Replace with your values:**
   - `SERVICE_ID`: The name you gave your email service (e.g., `invigen_email_service`)
   - `INVOICE_TEMPLATE_ID`: The template ID from Step 3 (e.g., `template_abc123`)
   - `PUBLIC_KEY`: Your public key from Step 4

---

## Step 6: Test Email Sending

1. **Start your app**
   ```bash
   npm run dev
   ```

2. **Generate an invoice**
   - Fill out the invoice form
   - Click "Generate Invoice"

3. **Try sending an email**
   - Enter an email address in the "Send via Email" section
   - Click "Send Invoice"
   - Check the recipient's inbox (and spam folder)

---

## 🔧 Troubleshooting

### Error: "Invalid grant"
- **Solution:** Go back to Email Services → Click on your service → Click "Reconnect"
- This refreshes the OAuth token

### Error: "Service not found"
- **Solution:** Double-check your `SERVICE_ID` matches exactly (case-sensitive)
- Go to Email Services and verify the service name

### Error: "Template not found"
- **Solution:** Verify your `TEMPLATE_ID` is correct
- Check the template ID in Email Templates dashboard

### Emails going to spam
- **Solution:** 
  - Make sure you're using a verified Gmail account
  - Add proper email content (not just attachments)
  - Consider using a custom domain email for better deliverability

### PDF attachment too large
- **Solution:** The code already compresses images, but if still too large:
  - Reduce logo size in customization
  - Simplify invoice design
  - Or download PDF manually and send via regular email

---

## 📝 Quick Reference

After setup, you should have:
- ✅ EmailJS account created
- ✅ Gmail service connected (`invigen_email_service`)
- ✅ Email template created (`template_xxxxxxx`)
- ✅ Public key copied (`xxxxxxxxxxxxx`)
- ✅ Code updated with your values

---

## 🎯 Next Steps

Once EmailJS is working:
1. Test sending invoices to different email addresses
2. Customize the email template to match your brand
3. Consider creating a feedback template (optional)
4. Set up email templates for other notifications (optional)

---

## 💡 Tips

- **Free Tier Limits:** EmailJS free tier includes 200 emails/month
- **Upgrade:** If you need more, consider EmailJS paid plans
- **Multiple Services:** You can create multiple email services for different purposes
- **Templates:** Create different templates for different invoice types if needed

---

## 📞 Need Help?

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/
- Check EmailJS dashboard for service status and logs

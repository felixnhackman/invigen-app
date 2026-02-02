# Invigen - Invoice Generator SaaS

A modern, professional invoice generation platform built with React, Vite, and Supabase.

## 🎯 Current Status: Phase 8 - Launch Readiness

Invigen is a subscription-based SaaS application for creating professional invoices. The app features:
- **FREE Plan**: Preview invoices, up to 10 invoices/month, watermark included
- **PRO Plan**: Unlimited invoices, PDF downloads, email sending, watermark removal, custom branding

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project
- Paystack account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/felixnhackman/invigen-app.git
   cd invigen-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Create `.env` in root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```
   
   Create `backend/.env`:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up database**
   - Run SQL migrations from `backend/supabase-migration.sql` in Supabase SQL Editor
   - Ensure RLS policies are configured

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd backend && npm start
   ```

## 📋 Launch Checklist

See [LAUNCH.md](./LAUNCH.md) for complete pre-launch checklist including:
- Environment variables
- Supabase configuration
- Paystack setup
- Security checks
- Feature testing

## 🏗️ Architecture

### Frontend
- **React + Vite**: Modern React with fast HMR
- **Tailwind CSS**: Utility-first styling
- **Supabase Auth**: User authentication
- **EmailJS**: Email sending service
- **@react-pdf/renderer**: PDF generation

### Backend
- **Express.js**: REST API server
- **Supabase**: Database and auth
- **Paystack**: Payment processing
- **Node.js**: Runtime environment

## 📦 Features

### Subscription System
- FREE and PRO plans
- Backend-enforced limits
- Paystack payment integration
- Subscription lifecycle management

### Invoice Features
- Professional invoice templates
- Custom branding (PRO)
- PDF download (PRO)
- Email sending (PRO)
- Watermark removal (PRO)
- Multiple currencies

## 🔒 Security

- Backend is the source of truth for subscriptions
- All premium features validated server-side
- RLS policies protect user data
- Webhook signature verification
- No client-side subscription assumptions

## 📝 Known Limitations

- Yearly billing UI-only (not yet implemented)
- Subscription API integration pending (Phase 8 TODO)
- Payment processing placeholder (ready for Paystack integration)

## 🚀 Deployment

See [LAUNCH.md](./LAUNCH.md) for deployment instructions and production checklist.

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

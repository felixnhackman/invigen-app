# Invigen Launch Checklist

## 🚀 Pre-Launch Requirements

### Environment Variables

#### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000 (development) or your_production_backend_url
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

#### Backend (.env)
```
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
CORS_ORIGIN=your_frontend_url
```

### Supabase Configuration

- [ ] **Database Tables Created**
  - [ ] `subscriptions` table (with RLS policies)
  - [ ] `invoice_usage` table (with RLS policies)
  - [ ] `profiles` table (for user profiles)

- [ ] **Row Level Security (RLS)**
  - [ ] RLS enabled on all tables
  - [ ] Policies configured for authenticated users
  - [ ] Service role key secured (backend only)

- [ ] **Supabase Auth**
  - [ ] Email authentication enabled
  - [ ] OAuth providers configured (if using Google sign-in)
  - [ ] Email templates customized

### Paystack Configuration

- [ ] **Paystack Account**
  - [ ] Live API keys obtained
  - [ ] Webhook URL configured: `https://your-backend-url/api/webhooks/paystack`
  - [ ] Webhook secret verified
  - [ ] Test transactions completed

- [ ] **Payment Flow**
  - [ ] Pro plan pricing verified (₵99/month)
  - [ ] Currency set to GHS (Ghana Cedis)
  - [ ] Payment success redirect tested
  - [ ] Payment failure handling tested

### Backend Deployment

- [ ] **Server Setup**
  - [ ] Node.js 18+ installed
  - [ ] Environment variables configured
  - [ ] Database migrations run
  - [ ] Server starts without errors

- [ ] **API Endpoints**
  - [ ] `/api/subscriptions/me` - Returns user subscription
  - [ ] `/api/subscriptions/verify` - Verifies Paystack payment
  - [ ] `/api/webhooks/paystack` - Handles Paystack webhooks
  - [ ] `/api/invoices/create` - Creates invoice (with limits)
  - [ ] `/api/invoices/usage` - Returns usage status
  - [ ] `/api/invoices/download` - Validates PDF download
  - [ ] `/api/invoices/send` - Validates email send
  - [ ] `/api/invoices/remove-watermark` - Validates watermark removal

- [ ] **Security**
  - [ ] CORS configured for production domain
  - [ ] Paystack webhook signature verification working
  - [ ] No hardcoded credentials in code
  - [ ] Service role key never exposed to frontend

### Frontend Deployment

- [ ] **Build & Deploy**
  - [ ] `npm run build` completes successfully
  - [ ] Environment variables set in hosting platform
  - [ ] Static files served correctly
  - [ ] PWA manifest configured

- [ ] **Authentication Flow**
  - [ ] Sign up works
  - [ ] Login works
  - [ ] Logout works
  - [ ] Session persistence works
  - [ ] Protected routes redirect correctly

- [ ] **Subscription Flow**
  - [ ] Free users see correct limitations
  - [ ] Upgrade to Pro works
  - [ ] Payment processing works
  - [ ] Subscription status updates after payment
  - [ ] Invoice limits enforced (10/month for FREE)

### Feature Testing

- [ ] **Invoice Generation**
  - [ ] Invoice preview works
  - [ ] PDF download works (PRO only)
  - [ ] Email sending works (PRO only)
  - [ ] Watermark removal works (PRO only)
  - [ ] Customization works

- [ ] **Limits & Enforcement**
  - [ ] FREE users blocked after 10 invoices/month
  - [ ] FREE users cannot download PDFs
  - [ ] FREE users cannot send emails
  - [ ] FREE users cannot remove watermark
  - [ ] Backend always consulted (no client-side bypass)

- [ ] **Error Handling**
  - [ ] Network errors show user-friendly messages
  - [ ] 403 errors show UpgradeModal
  - [ ] No raw error objects in UI
  - [ ] App never crashes on missing data

### UX & Polish

- [ ] **Loading States**
  - [ ] Buttons show loading spinners during API calls
  - [ ] Subscription loading handled gracefully
  - [ ] No flickering or layout shifts

- [ ] **Empty States**
  - [ ] First-time users see helpful messages
  - [ ] No invoices yet state
  - [ ] No subscription yet state

- [ ] **Navigation**
  - [ ] All links work
  - [ ] No dead navigation paths
  - [ ] Back button works correctly

## 📋 Known Limitations

### Current Phase 8 Status

1. **Yearly Billing**
   - UI shows yearly pricing as visual anchor
   - Yearly billing not yet implemented
   - Users can only select monthly billing
   - Status: Intentional (Phase 7.2 feature)

2. **Subscription Integration**
   - Frontend subscription state is placeholder
   - TODO: Connect to backend subscription API
   - TODO: Use authenticated user context for API calls
   - Status: Ready for integration

3. **Payment Processing**
   - Payment flow is simulated
   - TODO: Connect to real Paystack integration
   - Status: Ready for integration

### Future Enhancements

- [ ] Yearly billing implementation
- [ ] Subscription management page
- [ ] Invoice history/storage
- [ ] Team collaboration features
- [ ] Advanced reporting

## 🔒 Security Checklist

- [ ] All API keys in environment variables
- [ ] No secrets in client-side code
- [ ] CORS properly configured
- [ ] RLS policies tested
- [ ] Webhook signature verification working
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection (if applicable)

## 📊 Monitoring & Analytics

- [ ] Error tracking configured (e.g., Sentry)
- [ ] Analytics configured (if needed)
- [ ] Server logs monitored
- [ ] Payment webhook logs reviewed
- [ ] User feedback collection working

## 🚦 Go-Live Steps

1. **Final Checks**
   - [ ] All environment variables set
   - [ ] Database migrations complete
   - [ ] Paystack webhook URL updated
   - [ ] CORS origin updated to production domain

2. **Deploy Backend**
   - [ ] Deploy to production server
   - [ ] Verify server starts
   - [ ] Test health endpoint
   - [ ] Verify database connection

3. **Deploy Frontend**
   - [ ] Build production bundle
   - [ ] Deploy to hosting platform
   - [ ] Verify environment variables
   - [ ] Test authentication flow

4. **Post-Deploy Verification**
   - [ ] Test signup flow
   - [ ] Test payment flow (small amount)
   - [ ] Verify webhook receives events
   - [ ] Check error logs
   - [ ] Monitor for 24 hours

## 📞 Support & Maintenance

- [ ] Support email configured
- [ ] Error reporting system active
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

**Last Updated:** Phase 8 - Launch Readiness
**Status:** Ready for integration testing

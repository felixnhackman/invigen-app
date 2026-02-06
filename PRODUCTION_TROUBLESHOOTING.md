# Production Subscription Troubleshooting Guide

## Issue: Subscriptions work locally but not in production

### Quick Diagnostic Steps

1. **Check Backend Configuration**
   - Visit: `https://your-backend-url.onrender.com/debug/config`
   - This will show you:
     - ✅/❌ Supabase URL configured
     - ✅/❌ Supabase Service Role Key configured
     - ✅/❌ Supabase connection status
     - ✅/❌ Subscriptions table exists

2. **Check Render Environment Variables**
   - Go to Render Dashboard → Your Backend Service → Environment
   - Verify these are set:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     PAYSTACK_SECRET_KEY=your-paystack-secret
     ```

3. **Check Backend Logs**
   - Go to Render Dashboard → Your Backend Service → Logs
   - Look for:
     - `❌ Supabase not configured!` - Environment variables missing
     - `✅ Found subscription for user` - Subscription found
     - `❌ Error updating subscription` - Database error

### Common Issues and Fixes

#### Issue 1: Environment Variables Not Set in Render

**Symptoms:**
- Backend logs show: `❌ Supabase not configured!`
- `/debug/config` shows missing environment variables

**Fix:**
1. Go to Render Dashboard → Your Backend Service → Environment
2. Add:
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key (from Supabase Dashboard → Settings → API)
3. Redeploy the service

#### Issue 2: Supabase Tables Don't Exist

**Symptoms:**
- `/debug/config` shows Supabase connected but table doesn't exist
- Backend logs show: `Error: relation "public.subscriptions" does not exist`

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `00005_add_products_and_subscription_expiry.sql`
   - `00006_create_subscriptions_table.sql`
   - `00007_fix_invoice_usage_user_id.sql`
3. Verify tables exist: Supabase Dashboard → Table Editor

#### Issue 3: Wrong Supabase Project

**Symptoms:**
- Subscriptions save but don't appear in frontend
- Different Supabase projects for local vs production

**Fix:**
1. Verify frontend `.env` uses production Supabase:
   ```
   VITE_SUPABASE_URL=https://your-production-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   ```
2. Verify backend uses same Supabase project:
   ```
   SUPABASE_URL=https://your-production-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   ```

#### Issue 4: RLS Policies Blocking Backend

**Symptoms:**
- Backend logs show permission errors
- `Error: new row violates row-level security policy`

**Fix:**
- Backend uses Service Role Key which bypasses RLS
- Verify you're using Service Role Key (not Anon Key) in backend
- Service Role Key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT)

### Testing Subscription Flow

1. **Subscribe via Frontend**
   - Make a payment
   - Check backend logs for: `✅ Subscription saved to Supabase successfully`

2. **Verify in Database**
   - Go to Supabase Dashboard → Table Editor → `subscriptions`
   - Find your user_id
   - Verify `plan` = `pro`

3. **Check Frontend**
   - Refresh page
   - Check ProfilePage - should show PRO status
   - Check backend API: `GET /api/subscriptions/me` (with auth token)

### Debug Endpoints

- `GET /health` - Basic health check
- `GET /debug/config` - Backend configuration status (no auth required)

### Still Not Working?

1. **Check Backend Logs** for detailed error messages
2. **Check Supabase Logs** (Dashboard → Logs) for database errors
3. **Verify Migration Order** - Run migrations in numerical order
4. **Check User ID** - Ensure frontend sends correct user ID in auth token

### Migration Checklist

- [ ] Run `00005_add_products_and_subscription_expiry.sql`
- [ ] Run `00006_create_subscriptions_table.sql`
- [ ] Run `00007_fix_invoice_usage_user_id.sql`
- [ ] Verify `subscriptions` table exists
- [ ] Verify `invoice_usage` table exists
- [ ] Check RLS policies are enabled
- [ ] Verify backend environment variables are set
- [ ] Restart backend service after setting env vars

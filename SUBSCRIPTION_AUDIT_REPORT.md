# Subscription System Audit Report

## Executive Summary

This audit examined the Node.js + Express + Supabase + Paystack subscription system. Key findings include:
- ✅ Subscription insertion correctly uses `user_id` (UUID)
- ✅ Backend correctly uses `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `/api/subscriptions/me` queries by `user_id` correctly
- ❌ **CRITICAL**: Paystack webhook handler was missing (now created)
- ✅ Added comprehensive logging around subscription insertion

---

## 1. Paystack Webhook Handler Location

### Finding
**Status**: ❌ **MISSING** (Now Fixed)

The system had **NO webhook handler** for Paystack events. The auth middleware referenced `/api/webhooks/paystack` but no route existed.

### Location
- **Before**: No handler existed
- **After**: Created `backend/src/controllers/webhook.controller.js`
- **Route**: `POST /api/webhooks/paystack` (added to `backend/src/app.js`)

### Implementation Details
- Webhook handler verifies Paystack signature using HMAC SHA512
- Handles `charge.success` events to activate PRO subscriptions
- Looks up user by email from Paystack transaction
- Uses service role key to bypass RLS and update subscriptions

### Production Webhook URL
**Required URL**: `https://your-backend-url/api/webhooks/paystack`

**Action Required**: 
1. Configure this URL in Paystack Dashboard → Settings → Webhooks
2. Ensure the backend URL is publicly accessible
3. Test webhook delivery using Paystack's webhook testing tool

---

## 2. Subscription Insertion: user_id vs user_email

### Finding
**Status**: ✅ **CORRECT**

Subscriptions are inserted using `user_id` (UUID), not `user_email`.

### Evidence

**Schema** (`supabase/migrations/00006_create_subscriptions_table.sql`):
```sql
user_id uuid not null references auth.users(id) on delete cascade
```

**Insert Code** (`backend/src/models/subscription.store.supabase.js:96`):
```javascript
.upsert({
    user_id: userId,  // ✅ Uses UUID
    ...updateData,
}, {
    onConflict: 'user_id'  // ✅ Conflicts on user_id
})
```

**Controller** (`backend/src/controllers/subscription.controller.js:193`):
```javascript
const subscriptionWithPayment = {
    plan: 'pro',
    userId,  // ✅ UUID from req.user.id
    userEmail,  // Only for logging/reference
    // ...
};
```

### Conclusion
✅ **Correct**: System uses `user_id` (UUID) for all subscription operations.

---

## 3. Insert Payload vs Supabase Schema Comparison

### Finding
**Status**: ✅ **MATCHES**

The insert payload correctly maps to the Supabase schema.

### Schema Fields
```sql
- id (uuid, auto-generated)
- user_id (uuid, required, FK to auth.users)
- plan (text, required, 'free' or 'pro')
- paystack_reference (text, nullable)
- paystack_customer_code (text, nullable)
- activated_at (timestamptz, nullable)
- expires_at (timestamptz, nullable)
- created_at (timestamptz, auto)
- updated_at (timestamptz, auto)
```

### Insert Payload Mapping
```javascript
// From subscription.store.supabase.js:84-91
{
    user_id: userId,                    // ✅ Maps to user_id
    plan: subscriptionData.plan,         // ✅ Maps to plan
    paystack_reference: ...,            // ✅ Maps to paystack_reference
    paystack_customer_code: ...,        // ✅ Maps to paystack_customer_code
    activated_at: ...,                  // ✅ Maps to activated_at
    expires_at: ...,                    // ✅ Maps to expires_at
    updated_at: new Date().toISOString() // ✅ Maps to updated_at
}
```

### Conclusion
✅ **All fields match correctly**. The camelCase to snake_case conversion is handled properly.

---

## 4. Backend Uses SUPABASE_SERVICE_ROLE_KEY

### Finding
**Status**: ✅ **CORRECT**

The backend correctly uses `SUPABASE_SERVICE_ROLE_KEY` (not anon key).

### Evidence

**Subscription Store** (`backend/src/models/subscription.store.supabase.js:8-19`):
```javascript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {  // ✅ Service role key
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;
```

**Auth Middleware** (`backend/src/middleware/auth.middleware.js:8-19`):
```javascript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {  // ✅ Service role key
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;
```

### Security Note
✅ **Correct**: Service role key bypasses RLS, allowing backend to manage all subscriptions. This is the correct approach for backend operations.

---

## 5. Detailed Logging Around Subscription Insertion

### Finding
**Status**: ✅ **ADDED**

Comprehensive logging has been added around subscription insertion.

### Logging Added

**Location**: `backend/src/models/subscription.store.supabase.js:82-140`

**Before Insert**:
```javascript
console.log('🔍 BEFORE INSERT - Payload being sent to Supabase:');
console.log('INSERT PAYLOAD:', JSON.stringify(payload, null, 2));
console.log('   - user_id (UUID):', userId);
console.log('   - plan:', payload.plan);
console.log('   - paystack_reference:', payload.paystack_reference);
// ... all fields logged
```

**After Insert (Success)**:
```javascript
console.log('✅ AFTER INSERT - Success:');
console.log('INSERT RESULT:', { data, error: null });
console.log('   - Inserted/Updated subscription ID:', data.id);
console.log('   - User ID:', data.user_id);
// ... all returned fields logged
```

**After Insert (Error)**:
```javascript
console.error('❌ AFTER INSERT - Error occurred:');
console.error('INSERT RESULT:', { data: null, error });
console.error('   Error code:', error.code);
console.error('   Error message:', error.message);
console.error('   Error details:', error.details);
console.error('   Error hint:', error.hint);
```

**On Exception**:
```javascript
console.error('❌ ON ERROR - Exception caught:');
console.error('INSERT RESULT:', { data: null, error: error.message });
console.error('   Error stack:', error.stack);
```

### Testing
After deployment, check Render logs for:
- `INSERT PAYLOAD:` - Shows exactly what's being sent
- `INSERT RESULT:` - Shows the response from Supabase
- Any error details if insertion fails

---

## 6. Production Webhook URL

### Finding
**Status**: ⚠️ **REQUIRES CONFIGURATION**

The webhook handler is now implemented, but the production URL must be configured in Paystack.

### Required Actions

1. **Get Production Backend URL**
   - Example: `https://your-backend.onrender.com`
   - Or: `https://api.yourdomain.com`

2. **Configure in Paystack Dashboard**
   - Go to: Settings → API Keys & Webhooks
   - Add Webhook URL: `https://your-backend-url/api/webhooks/paystack`
   - Select events: `charge.success` (at minimum)

3. **Test Webhook**
   - Use Paystack's webhook testing tool
   - Or trigger a test payment and check logs

4. **Verify Webhook Receives Events**
   - Check backend logs for: `📨 Paystack webhook received:`
   - Verify signature validation passes
   - Confirm subscription activation logs appear

---

## 7. `/api/subscriptions/me` Query Verification

### Finding
**Status**: ✅ **CORRECT**

The endpoint correctly queries by `user_id`.

### Evidence

**Controller** (`backend/src/controllers/subscription.controller.js:31`):
```javascript
const subscriptionData = await getSubscription(userId);  // ✅ Uses userId (UUID)
```

**Store** (`backend/src/models/subscription.store.supabase.js:34-38`):
```javascript
const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)  // ✅ Queries by user_id (UUID)
    .maybeSingle();
```

### Conclusion
✅ **Correct**: Queries use `user_id` (UUID) consistently.

---

## Summary of Changes Made

### 1. Created Paystack Webhook Handler
- **File**: `backend/src/controllers/webhook.controller.js`
- **Features**:
  - Signature verification (HMAC SHA512)
  - Handles `charge.success` events
  - User lookup by email
  - PRO subscription activation
  - Comprehensive logging

### 2. Added Webhook Route
- **File**: `backend/src/app.js`
- **Route**: `POST /api/webhooks/paystack`
- **Auth**: Bypassed (uses signature verification)
- **Body**: Raw JSON for signature verification

### 3. Enhanced Logging
- **File**: `backend/src/models/subscription.store.supabase.js`
- **Added**:
  - Before insert payload logging
  - After insert result logging (success/error)
  - Exception logging with stack traces
  - All fields logged for debugging

---

## Critical Issues Found & Fixed

### ❌ Issue 1: Missing Webhook Handler
- **Severity**: CRITICAL
- **Impact**: Paystack webhooks were not being processed
- **Fix**: Created webhook handler with signature verification
- **Status**: ✅ FIXED

### ⚠️ Issue 2: Insufficient Logging
- **Severity**: HIGH
- **Impact**: Difficult to debug subscription insertion failures
- **Fix**: Added comprehensive logging around insert operations
- **Status**: ✅ FIXED

---

## Recommendations

### Immediate Actions

1. **Configure Paystack Webhook URL**
   - Set webhook URL in Paystack dashboard
   - Test with a small payment
   - Verify logs show webhook received

2. **Deploy and Test**
   - Deploy backend with new webhook handler
   - Test subscription flow end-to-end
   - Monitor logs for `INSERT PAYLOAD` and `INSERT RESULT`

3. **Monitor Production Logs**
   - Watch for webhook events
   - Verify subscription activations
   - Check for any insertion errors

### Future Improvements

1. **Add Webhook Retry Logic**
   - Handle webhook delivery failures
   - Implement idempotency checks

2. **Add Subscription Expiration Job**
   - Automatically downgrade expired PRO subscriptions
   - Send expiration warnings

3. **Add Webhook Event Logging**
   - Store webhook events in database
   - Track webhook delivery status

---

## Testing Checklist

- [ ] Deploy backend with new webhook handler
- [ ] Configure Paystack webhook URL
- [ ] Test payment flow from frontend
- [ ] Verify `/api/subscriptions/verify` still works
- [ ] Test webhook delivery from Paystack
- [ ] Check logs for `INSERT PAYLOAD` and `INSERT RESULT`
- [ ] Verify subscription appears in Supabase
- [ ] Test `/api/subscriptions/me` returns correct data

---

## Files Modified

1. `backend/src/models/subscription.store.supabase.js` - Added detailed logging
2. `backend/src/controllers/webhook.controller.js` - **NEW FILE** - Webhook handler
3. `backend/src/app.js` - Added webhook route

---

**Audit Date**: 2025-01-27
**Status**: ✅ All critical issues fixed, ready for testing


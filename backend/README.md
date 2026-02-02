# Invigen Backend API

PHASE 8.5: Backend API with Supabase authentication integration.

## Overview

This backend provides authenticated API endpoints for subscription management and invoice usage tracking. All endpoints require Supabase JWT authentication.

## Setup

### Prerequisites

- Node.js 18+ 
- Supabase project with authentication enabled

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Important**: Use the **Service Role Key** (not the anon key) for backend authentication. This allows the backend to verify JWT tokens.

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `PORT`).

## API Endpoints

### Authentication

All endpoints (except `/health`) require an `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

### Health Check

```
GET /health
```

Returns server status. No authentication required.

### Subscription Endpoints

#### Get Current User's Subscription

```
GET /api/subscriptions/me
```

**Response:**
```json
{
  "plan": "free" | "pro",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Subscription

```
POST /api/subscriptions/update
Body: { "plan": "free" | "pro" }
```

**Note**: This endpoint is typically called by webhooks or admin tools.

### Invoice Endpoints

#### Get Invoice Usage

```
GET /api/invoices/usage
```

**Response:**
```json
{
  "count": 5,
  "limit": 10,
  "userId": "uuid",
  "userEmail": "user@example.com"
}
```

#### Create Invoice (Track Usage)

```
POST /api/invoices/create
Body: { ...invoiceData }
```

Tracks invoice creation and enforces usage limits based on subscription plan.

#### Authorize PDF Download (PRO Only)

```
POST /api/invoices/download
```

Returns authorization status. Returns `403 Forbidden` for FREE users.

#### Authorize Email Send (PRO Only)

```
POST /api/invoices/send
```

Returns authorization status. Returns `403 Forbidden` for FREE users.

#### Authorize Watermark Removal (PRO Only)

```
POST /api/invoices/remove-watermark
```

Returns authorization status. Returns `403 Forbidden` for FREE users.

## Authentication Flow

1. **Frontend**: User signs in via Supabase Auth
2. **Frontend**: Gets JWT token from Supabase session
3. **Frontend**: Includes token in `Authorization: Bearer <token>` header
4. **Backend**: Middleware verifies token using Supabase admin client
5. **Backend**: Attaches `req.user = { id, email }` to request
6. **Backend**: Controller uses `req.user` for user-specific operations

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "This feature requires Pro subscription"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to process request"
}
```

## Database Schema (TODO)

The current implementation uses placeholder logic. You'll need to create database tables:

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Invoice Usage Table

```sql
CREATE TABLE invoice_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  limit INTEGER DEFAULT 10,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);
```

## Security Notes

- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to the frontend
- All user-specific operations use `req.user` from authenticated context
- Two users cannot see each other's subscription or usage data
- JWT tokens are verified on every request

## Development Notes

- Controllers currently return placeholder data
- Replace TODO comments with actual database queries
- Add proper error handling and logging
- Implement rate limiting for production
- Add request validation middleware

## Known Limitations

- Database integration is placeholder (returns default values)
- No actual usage tracking implemented yet
- No webhook handlers for Paystack payment events
- No subscription expiration handling

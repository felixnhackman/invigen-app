/**
 * PHASE 8.5: Express app setup with authenticated routes
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import subscriptionRoutes from './routes/subscription.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import { getAllSubscriptions } from './models/subscription.store.supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', '..', 'dist');

const app = express();

// PHASE 8.5: Middleware - CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

// Add common production patterns
const productionPatterns = [
    /^https?:\/\/.*\.onrender\.com$/i, // Render.com domains
    /^https?:\/\/.*\.vercel\.app$/i,   // Vercel domains
    /^https?:\/\/.*\.netlify\.app$/i,  // Netlify domains
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        // Check if origin matches production patterns
        const matchesPattern = productionPatterns.some(pattern => pattern.test(origin));
        if (matchesPattern) {
            console.log(`✅ CORS allowed for production origin: ${origin}`);
            return callback(null, true);
        }
        
        // Log rejected origin for debugging
        console.warn(`❌ CORS rejected origin: ${origin}`);
        console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// PHASE 8.5: Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint to check backend configuration (no auth required)
app.get('/debug/config', async (req, res) => {
    const config = {
        supabase: {
            url: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
            serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
            configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
        paystack: {
            secretKey: process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Missing',
        },
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
    };
    
    // Try to connect to Supabase if configured
    if (config.supabase.configured) {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                { auth: { autoRefreshToken: false, persistSession: false } }
            );
            
            // Try a simple query to check connection
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .select('count')
                .limit(1);
            
            if (error) {
                config.supabase.connection = `❌ Error: ${error.message}`;
                config.supabase.tableExists = false;
            } else {
                config.supabase.connection = '✅ Connected';
                config.supabase.tableExists = true;
            }
        } catch (err) {
            config.supabase.connection = `❌ Error: ${err.message}`;
        }
    }
    
    res.json(config);
});

// Debug endpoint to check stored subscriptions (development only)
app.get('/debug/subscriptions', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not available in production' });
    }
    const subscriptions = getAllSubscriptions();
    res.json({
        count: subscriptions.length,
        subscriptions,
        note: '⚠️ This is in-memory storage - data is lost on server restart',
    });
});

// PHASE 8.5: Authenticated routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);

// PHASE 8.5: Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// Serve built frontend (Vite dist) when deployed; express.static sets correct Content-Type (fixes CSS MIME type)
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback: serve index.html for GET requests that don't match a file or API route
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// PHASE 8.5: 404 handler (for non-GET or when dist is not present)
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

export default app;

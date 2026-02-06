/**
 * PHASE 8.5: Backend server entry point
 */

import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// PHASE 8.5: Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Warning: Supabase environment variables not set');
    console.warn('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for authentication');
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

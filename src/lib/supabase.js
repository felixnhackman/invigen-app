import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// PHASE 8.5: Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// PHASE 8.5: Initialize Supabase client with validation
// If URL is empty, createClient will throw - we handle this gracefully
export const supabase = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * PHASE 8.5: Get authentication token for API calls
 * Returns the current session's access token
 */
export async function getAuthToken() {
    if (!supabase) {
        return null;
    }
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    } catch (e) {
        if (e?.name === 'AbortError') return null;
        throw e;
    }
}

/**
 * PHASE 8.5: Get authenticated user info
 * Returns user id and email for API calls
 */
export async function getAuthUser() {
    if (!supabase) {
        return null;
    }
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return null;
        }
        return {
            id: session.user.id,
            email: session.user.email || ''
        };
    } catch (e) {
        if (e?.name === 'AbortError') return null;
        throw e;
    }
}

/**
 * Map Supabase user to app user shape { id, email, name }
 */
export function supabaseUserToAppUser(supabaseUser) {
    if (!supabaseUser) return null;
    const id = supabaseUser.id;
    const email = supabaseUser.email || '';
    const name =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.user_name ||
        email.split('@')[0] ||
        'User';
    return { id, email, name };
}

/**
 * Fetch profile from public.profiles by user id
 */
export async function getProfile(userId) {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, updated_at, created_at')
        .eq('id', userId)
        .maybeSingle();
    if (error) throw error;
    return data;
}

/**
 * Update profile in public.profiles
 */
export async function updateProfile(userId, updates) {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Upsert profile (insert or update) - for users created before the trigger existed
 */
export async function upsertProfile(userId, defaults = {}) {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
        .from('profiles')
        .upsert(
            { id: userId, ...defaults, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
        )
        .select()
        .single();
    if (error) throw error;
    return data;
}

const AVATARS_BUCKET = 'avatars';

/**
 * Upload profile photo to Supabase Storage and return public URL.
 * Requires an "avatars" bucket with public read and policy: authenticated users can upload to their own path.
 */
export async function uploadAvatar(userId, file) {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
}

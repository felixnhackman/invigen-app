import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, ArrowLeft, LogOut, Edit2, Save, Camera, Crown, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { getProfile, updateProfile, upsertProfile, uploadAvatar } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';

const ProfilePage = ({ user, setCurrentPage, onLogout }) => {
    // PHASE 8.6: Subscription hook for plan and usage info
    const { plan, isPro, isFree, invoiceCount, invoiceLimit, isLoading: subscriptionLoading } = useSubscription();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const photoInputRef = useRef(null);

    useEffect(() => {
        if (!user) setCurrentPage?.('home');
    }, [user, setCurrentPage]);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        setLoading(true);
        setError('');
        getProfile(user.id)
            .then((data) => {
                if (!cancelled) {
                    setProfile(data);
                    setEditName(data?.full_name ?? user.name ?? '');
                    setEditPhone(data?.phone ?? '');
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Failed to load profile');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [user?.id, user?.name]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        setError('');
        try {
            const payload = {
                full_name: editName.trim() || null,
                phone: editPhone.trim() || null,
            };
            const updated = profile
                ? await updateProfile(user.id, payload)
                : await upsertProfile(user.id, { ...payload, full_name: payload.full_name ?? user.name });
            setProfile(updated);
            setEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const ensureProfile = async () => {
        if (!user?.id || profile) return;
        try {
            const row = await upsertProfile(user.id, { full_name: user.name });
            setProfile(row);
            setEditName(row.full_name ?? user.name ?? '');
            setEditPhone(row.phone ?? '');
        } catch (_) {
            // ignore; profile might not exist yet for old users
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target?.files?.[0];
        if (!file || !user?.id) return;
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file (e.g. JPG, PNG).');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2 MB.');
            return;
        }
        e.target.value = '';
        setError('');
        setUploadingPhoto(true);
        try {
            const url = await uploadAvatar(user.id, file);
            const payload = { avatar_url: url };
            const updated = profile
                ? await updateProfile(user.id, payload)
                : await upsertProfile(user.id, { ...payload, full_name: user.name });
            setProfile(updated);
            setAvatarKey((k) => k + 1);
        } catch (err) {
            const msg = err?.message || '';
            if (msg.toLowerCase().includes('bucket') && msg.toLowerCase().includes('not found')) {
                setError('Storage bucket "avatars" is missing. Create it in Supabase Dashboard → Storage → New bucket → name: avatars → Public.');
            } else {
                setError(msg || 'Failed to upload photo');
            }
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (!user) return null;

    const displayName = profile?.full_name ?? user.name ?? '—';
    const displayPhone = profile?.phone ?? '—';

    return (
        <section className="min-h-screen pt-28 pb-16 px-4 bg-gray-950 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={uploadingPhoto}
                        />
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="relative group inline-block rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
                        >
                            {profile?.avatar_url ? (
                                <img
                                    src={`${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}v=${avatarKey}`}
                                    alt=""
                                    className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-gray-500 transition-all"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center ring-2 ring-gray-700 group-hover:ring-gray-500 transition-all">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                            )}
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingPhoto ? (
                                    <span className="text-xs text-white font-medium">Uploading...</span>
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </span>
                        </button>
                        <p className="text-xs text-gray-500 mb-1">Click photo to change</p>
                        <h1 className="text-2xl font-bold text-white">Profile</h1>
                        <p className="text-gray-400 mt-1">Your account details</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-gray-400 text-center py-6">Loading profile...</p>
                    ) : (
                        <>
                            {!profile && (
                                <p className="text-gray-500 text-sm mb-4">
                                    No profile yet.{' '}
                                    <button
                                        type="button"
                                        onClick={ensureProfile}
                                        className="text-blue-400 hover:text-cyan-400"
                                    >
                                        Create one
                                    </button>
                                </p>
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                        {editing ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Your name"
                                            />
                                        ) : (
                                            <p className="text-white font-medium truncate">{displayName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-white font-medium truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                                        {editing ? (
                                            <input
                                                type="tel"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Phone number"
                                            />
                                        ) : (
                                            <p className="text-white font-medium truncate">{displayPhone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* PHASE 8.6: Current Plan */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    <Crown className={`w-5 h-5 flex-shrink-0 ${isPro ? 'text-yellow-400' : 'text-gray-500'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current Plan</p>
                                        {subscriptionLoading ? (
                                            <p className="text-gray-400 text-sm mt-1">Loading...</p>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-white font-semibold ${isPro ? 'text-yellow-400' : ''}`}>
                                                    {plan === 'pro' ? 'PRO' : 'FREE'}
                                                </span>
                                                {isPro && (
                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PHASE 8.6: Invoice Usage */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    <TrendingUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Usage</p>
                                        {subscriptionLoading ? (
                                            <p className="text-gray-400 text-sm mt-1">Loading...</p>
                                        ) : (
                                            <p className="text-white font-medium mt-1">
                                                {isPro ? (
                                                    <span className="text-green-400">Unlimited</span>
                                                ) : (
                                                    <span>
                                                        {invoiceCount} / {invoiceLimit} invoices this month
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* PHASE 8.6: Subscription Status */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                                    {isPro ? (
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Subscription Status</p>
                                        {subscriptionLoading ? (
                                            <p className="text-gray-400 text-sm mt-1">Loading...</p>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`font-medium ${isPro ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {isPro ? 'Active' : 'Free Plan'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {editing ? (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold disabled:opacity-70"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setEditing(false); setEditName(displayName); setEditPhone(displayPhone); }}
                                        className="px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit profile
                                </button>
                            )}
                        </>
                    )}

                    {/* PHASE 8.6: Upgrade to Pro Button (only show for FREE users) */}
                    {!subscriptionLoading && isFree && (
                        <div className="mt-6">
                            <button
                                onClick={() => setCurrentPage('pricing')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300"
                            >
                                <Crown className="w-4 h-4" />
                                Upgrade to Pro
                            </button>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setCurrentPage('home')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </button>
                        <button
                            onClick={() => { onLogout?.(); setCurrentPage('home'); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;

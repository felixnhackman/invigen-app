import React from 'react';
import { Crown, X, ArrowRight } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, featureName, setCurrentPage }) => {
    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        if (setCurrentPage) {
            setCurrentPage('pricing');
        }
    };

    // PHASE 7.1: Determine message based on feature name
    const getMessage = () => {
        if (featureName) {
            if (featureName.includes('10/month') || featureName.includes('limit') || featureName.includes('Create more')) {
                return (
                    <>
                        You've used all 10 free invoices this month.<br />
                        Upgrade to Pro to create unlimited invoices, download PDFs, and send invoices instantly.
                    </>
                );
            } else {
                return (
                    <>
                        This feature is available on Pro.<br />
                        Upgrade to unlock PDF downloads, email invoices, and remove the Invigen watermark.
                    </>
                );
            }
        }
        return (
            <>
                This feature is available on Pro.<br />
                Upgrade to unlock PDF downloads, email invoices, and remove the Invigen watermark.
            </>
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-xl transform transition-all duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
                >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>

                <div className="p-8">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Upgrade to Pro
                        </h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            {getMessage()}
                        </p>
                    </div>

                    {/* PHASE 7.1: Value Stack */}
                    <div className="bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-700">
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">✓</span>
                                <span>Unlimited invoices</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">✓</span>
                                <span>PDF downloads</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">✓</span>
                                <span>Email invoices directly</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">✓</span>
                                <span>Remove watermark</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">✓</span>
                                <span>Custom branding</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        {/* PHASE 7.1: CTA Button Polish */}
                        <button
                            onClick={handleUpgrade}
                            className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            Upgrade to Pro — ₵99/month
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            Cancel anytime
                        </p>
                    </div>

                    {/* PHASE 7.2: Social Proof */}
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Most users upgrade after hitting the free limit
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;

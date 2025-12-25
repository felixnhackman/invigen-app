import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * NotificationDialog Component
 * A beautiful, customizable notification system that matches the Invigen design aesthetic
 * 
 * Types:
 * - success: Green themed, with checkmark icon
 * - error: Red themed, with alert icon
 * - warning: Yellow themed, with warning icon
 * - info: Blue themed, with info icon
 */

const NotificationDialog = ({
    isOpen,
    onClose,
    type = 'info',
    title,
    message,
    details = null,
    autoClose = false,
    autoCloseDelay = 5000,
    showCloseButton = true,
    actions = null
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);
                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [isOpen, autoClose, autoCloseDelay]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const typeConfig = {
        success: {
            bgColor: 'from-green-600/20 to-emerald-500/20',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400',
            icon: CheckCircle,
            accentBg: 'bg-green-500/20',
            accentBorder: 'border-green-500/20'
        },
        error: {
            bgColor: 'from-red-600/20 to-rose-500/20',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            icon: AlertCircle,
            accentBg: 'bg-red-500/20',
            accentBorder: 'border-red-500/20'
        },
        warning: {
            bgColor: 'from-yellow-600/20 to-amber-500/20',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-400',
            icon: AlertTriangle,
            accentBg: 'bg-yellow-500/20',
            accentBorder: 'border-yellow-500/20'
        },
        info: {
            bgColor: 'from-blue-600/20 to-cyan-500/20',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            icon: Info,
            accentBg: 'bg-blue-500/20',
            accentBorder: 'border-blue-500/20'
        }
    };

    const config = typeConfig[type];
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Dialog */}
            <div
                className={`relative bg-gradient-to-br ${config.bgColor} border ${config.borderColor} rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-xl transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
            >
                {/* Close Button */}
                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </button>
                )}

                <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.accentBg} border ${config.accentBorder} flex items-center justify-center`}>
                            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Details (if provided) */}
                    {details && (
                        <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400 font-mono leading-relaxed">
                                {details}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    {actions ? (
                        <div className="mt-6 flex gap-3 justify-end">
                            {actions}
                        </div>
                    ) : (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleClose}
                                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${type === 'success'
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30'
                                        : type === 'error'
                                            ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-lg hover:shadow-red-500/30'
                                            : type === 'warning'
                                                ? 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:shadow-lg hover:shadow-yellow-500/30'
                                                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30'
                                    } text-white transform hover:scale-105`}
                            >
                                Got it
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Toast Notification Component
 * A subtle notification that appears at the top or bottom of the screen
 */

const Toast = ({ isOpen, onClose, type = 'info', message, position = 'top', duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const typeConfig = {
        success: {
            bgColor: 'from-green-600 to-emerald-500',
            icon: CheckCircle
        },
        error: {
            bgColor: 'from-red-600 to-rose-500',
            icon: AlertCircle
        },
        warning: {
            bgColor: 'from-yellow-600 to-amber-500',
            icon: AlertTriangle
        },
        info: {
            bgColor: 'from-blue-600 to-cyan-500',
            icon: Info
        }
    };

    const config = typeConfig[type];
    const IconComponent = config.icon;

    const positionClasses = {
        top: 'top-4',
        bottom: 'bottom-4'
    };

    return (
        <div className={`fixed ${positionClasses[position]} left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : position === 'top' ? '-translate-y-4 opacity-0' : 'translate-y-4 opacity-0'
            }`}>
            <div className={`bg-gradient-to-r ${config.bgColor} rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-xl border border-white/20`}>
                <IconComponent className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white font-medium flex-1">{message}</p>
                <button
                    onClick={handleClose}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
};

/**
 * Custom hook to manage notifications
 */
export const useNotification = () => {
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        details: null,
        autoClose: false,
        autoCloseDelay: 5000,
        showCloseButton: true,
        actions: null
    });

    const [toast, setToast] = useState({
        isOpen: false,
        type: 'info',
        message: '',
        position: 'top',
        duration: 3000
    });

    const showNotification = (config) => {
        setNotification({
            isOpen: true,
            type: config.type || 'info',
            title: config.title,
            message: config.message,
            details: config.details || null,
            autoClose: config.autoClose || false,
            autoCloseDelay: config.autoCloseDelay || 5000,
            showCloseButton: config.showCloseButton !== false,
            actions: config.actions || null
        });
    };

    const showToast = (config) => {
        setToast({
            isOpen: true,
            type: config.type || 'info',
            message: config.message,
            position: config.position || 'top',
            duration: config.duration || 3000
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    const closeToast = () => {
        setToast(prev => ({ ...prev, isOpen: false }));
    };

    return {
        notification,
        toast,
        showNotification,
        showToast,
        closeNotification,
        closeToast
    };
};

export { NotificationDialog, Toast };
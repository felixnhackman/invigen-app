import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, User, UserPlus, ChevronDown, LogOut } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const Navbar = ({ currentPage, setCurrentPage, user, onLogout }) => {
    // Auth-aware subscription check for Pricing visibility
    const { isPro, isLoading: subscriptionLoading } = useSubscription();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine if Pricing should be shown
    // Show Pricing if: not logged in OR logged in but FREE plan
    const shouldShowPricing = !user || (user && !subscriptionLoading && !isPro);

    const navItems = [
        { name: 'Home', id: 'home', sectionId: 'hero-section' },
        { name: "Who It's For", id: 'who-its-for', sectionId: 'use-cases-section' },
        { name: 'Contact', id: 'contact', sectionId: 'contact-section' }
    ];

    // Handle Pricing navigation (page navigation, not section scroll)
    const handlePricingClick = () => {
        setCurrentPage('pricing');
        setMobileMenuOpen(false);
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (item) => {
        if (currentPage !== 'home') {
            // If not on homepage, navigate to homepage first
            setCurrentPage('home');
            // Wait for page to load then scroll
            setTimeout(() => {
                scrollToSection(item.sectionId);
            }, 100);
        } else {
            // Already on homepage, just scroll
            scrollToSection(item.sectionId);
        }
        setMobileMenuOpen(false);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 96; // Height of navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={`fixed w-full  top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-gray-950/80 backdrop-blur-lg border-b border-gray-800'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center min-h-14 sm:min-h-16 md:h-20">
                    <span className="text-lg sm:text-xl font-semibold text-white truncate">Invigen</span>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 text-sm font-normal transition-all duration-300 rounded-lg"
                            >
                                {item.name}
                            </button>
                        ))}

                        {/* Pricing Link - Auth-aware visibility */}
                        {shouldShowPricing && (
                            <button
                                onClick={handlePricingClick}
                                className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 text-sm font-normal transition-all duration-300 rounded-lg"
                            >
                                Pricing
                            </button>
                        )}

                        {/* Auth: Sign up when logged out, Profile dropdown when logged in */}
                        {user ? (
                            <div className="ml-4 relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 text-sm rounded-lg transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                    <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-1 py-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50">
                                        <button
                                            onClick={() => { setCurrentPage('profile'); setProfileDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            View profile
                                        </button>
                                        <button
                                            onClick={() => { onLogout?.(); setCurrentPage('home'); setProfileDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => { setCurrentPage('signup'); setMobileMenuOpen(false); }}
                                className="ml-4 inline-flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 text-sm rounded-lg transition-all border border-gray-600 hover:border-gray-500"
                            >
                                <UserPlus className="w-4 h-4" />
                                Sign up
                            </button>
                        )}

                        {/* CTA Button: sign up first if not logged in */}
                        <button
                            onClick={() => {
                                if (user) setCurrentPage('invoice');
                                else setCurrentPage('signup');
                            }}
                            className="ml-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 group"
                        >
                            Generate Invoice
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Mobile Menu Button - touch-friendly */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-3 -mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-lg">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="text-gray-400 hover:bg-gray-800 hover:text-white block w-full text-left px-4 py-3.5 rounded-lg text-base transition-colors min-h-[44px] flex items-center touch-manipulation"
                            >
                                {item.name}
                            </button>
                        ))}

                        {/* Mobile Pricing Link - Auth-aware visibility */}
                        {shouldShowPricing && (
                            <button
                                onClick={handlePricingClick}
                                className="text-gray-400 hover:bg-gray-800 hover:text-white block w-full text-left px-4 py-3.5 rounded-lg text-base transition-colors min-h-[44px] flex items-center touch-manipulation"
                            >
                                Pricing
                            </button>
                        )}

                        {/* Mobile Auth: Sign up when logged out, Profile / Logout when logged in */}
                        {user ? (
                            <div className="py-2 space-y-1">
                                <button
                                    onClick={() => { setCurrentPage('profile'); setMobileMenuOpen(false); }}
                                    className="w-full inline-flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 hover:text-white px-4 py-3.5 rounded-lg min-h-[44px] touch-manipulation"
                                >
                                    <User className="w-4 h-4" />
                                    View profile
                                </button>
                                <button
                                    onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                                    className="w-full inline-flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-3.5 rounded-lg min-h-[44px] touch-manipulation"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setCurrentPage('signup'); setMobileMenuOpen(false); }}
                                className="w-full inline-flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 hover:text-white px-4 py-3.5 rounded-lg border border-gray-600 min-h-[44px] touch-manipulation"
                            >
                                <UserPlus className="w-4 h-4" />
                                Sign up
                            </button>
                        )}

                        {/* Mobile CTA Button: sign up first if not logged in */}
                        <button
                            onClick={() => {
                                if (user) setCurrentPage('invoice');
                                else setCurrentPage('signup');
                                setMobileMenuOpen(false);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3.5 rounded-xl text-base font-semibold mt-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all min-h-[48px] touch-manipulation"
                        >
                            Generate Invoice
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
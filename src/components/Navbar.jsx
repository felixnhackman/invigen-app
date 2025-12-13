import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = ({ currentPage, setCurrentPage }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navItems = [
        { name: 'Home', id: 'home', sectionId: 'hero-section' },
        { name: "Who It's For", id: 'who-its-for', sectionId: 'use-cases-section' },
        { name: 'Contact', id: 'contact', sectionId: 'contact-section' }
    ];

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
            const offset = 80; // Height of navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={`fixed w-full mt-3 top-0 z-50 rounded-full transition-all duration-300 ${scrolled
            ? 'bg-gray-950/80 backdrop-blur-lg border-b border-gray-800'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <button
                        onClick={() => handleNavClick(navItems[0])}
                        className="flex items-center gap-3 group"
                    >
                        <img
                            className="w-50 h-60 object-contain"
                            src={logo}
                            alt="Invigen Logo"
                        />
                    </button>

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

                        {/* CTA Button */}
                        <button
                            onClick={() => setCurrentPage('invoice')}
                            className="ml-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 group"
                        >
                            Generate Invoice
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
                    <div className="px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="text-gray-400 hover:bg-gray-800 hover:text-white block w-full text-left px-4 py-3 rounded-lg text-base transition-colors"
                            >
                                {item.name}
                            </button>
                        ))}

                        {/* Mobile CTA Button */}
                        <button
                            onClick={() => {
                                setCurrentPage('invoice');
                                setMobileMenuOpen(false);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl text-base font-semibold mt-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
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
import { Mail, Phone, Facebook, Twitter, Linkedin } from 'lucide-react';

function Footer() {


    const Footer = ({ setCurrentPage }) => {
        return (
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 sm:mx-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
                        <div>
                            <div className="mb-3 sm:mb-4">
                                <span className="text-xl sm:text-2xl font-bold text-white">Invigen</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2 sm:mb-3">by Mayflower</p>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto md:mx-0">
                                Simplifying business transactions with professional invoice and receipt generation.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-300">Contact Us</h3>
                            <div className="space-y-2 text-sm text-gray-400 flex flex-col items-center md:items-start">
                                <a href="mailto:contact@invigen.com" className="flex items-center gap-2 break-all">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span>contact@invigen.com</span>
                                </a>
                                <a href="tel:+15551234567" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>+1 (555) 123-4567</span>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-300">Follow Us</h3>
                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"><div>

                        <p>&copy; {new Date().getFullYear()} Invigen. All rights reserved.</p>
                    </div>
                    </div>
                </div>
            </footer>
        );
    };
}

export default Footer;
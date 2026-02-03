

function Footer() {


    const Footer = ({ setCurrentPage }) => {
        return (
            <footer className="bg-gray-900 text-white ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:mx-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <FileText className="h-8 w-8 text-blue-500" />
                                <span className="ml-2 text-2xl font-bold">Invigen</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Simplifying business transactions with professional invoice and receipt generation.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <span>contact@invigen.com</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
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

                        <img src="./assets/logo.png" />
                        <p>&copy; {new Date().getFullYear()} Invigen. All rights reserved.</p>
                    </div>
                    </div>
                </div>
            </footer>
        );
    };
}

export default Footer;
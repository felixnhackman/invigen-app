import React from 'react';
import { Menu, X, FileText, Phone, Mail, Linkedin, Twitter, Facebook } from 'lucide-react';


const ContactPage = () => {
    return (
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 mt-20">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mb-12"></div>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Have questions or need support? We're here to help you make the most of Invigen.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="mailto:contact@invigen.com" className="flex items-center text-gray-700 hover:text-blue-600">
                        <Mail className="h-5 w-5 mr-2" />
                        <span>contact@invigen.com</span>
                    </a>
                    <a href="tel:+15551234567" className="flex items-center text-gray-700 hover:text-blue-600">
                        <Phone className="h-5 w-5 mr-2" />
                        <span>+1 (555) 123-4567</span>
                    </a>
                </div>
            </div>
        </section>
    );
};


export default ContactPage;
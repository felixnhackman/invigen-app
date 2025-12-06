import React, { useState } from 'react';
import {
    Phone,
    Mail,
    Linkedin,
    Twitter,
    Facebook,
    Zap,
    Clock,
    ArrowRight,
    BadgeCheck,
    Briefcase,
    User,
    Store,
    Building,
    Users,
    ShoppingCart,
    Wrench,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import invigenmain from "../assets/invigenmain.png";
import December from "../assets/DECEMBER.png";
import Post from "../assets/POST 1.jpg";
import hero from "../assets/hero.png";


const HomePage = ({ setCurrentPage = () => { } }) => {
    const [currentFlyer, setCurrentFlyer] = useState(0);

    const flyers = [
        {

            image: invigenmain
        },
        {
            image: December
        },
        {

            image: Post
        },

    ];

    const nextFlyer = () => {
        setCurrentFlyer((prev) => (prev + 1) % flyers.length);
    };

    const prevFlyer = () => {
        setCurrentFlyer((prev) => (prev - 1 + flyers.length) % flyers.length);
    };

    const FlyersShowcase = () => {
        const getPrevIndex = () => (currentFlyer - 1 + flyers.length) % flyers.length;
        const getNextIndex = () => (currentFlyer + 1) % flyers.length;

        return (
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-500">
                            Our <span className="text-gray-900">Marketing</span> Gallery
                        </h2>
                        <p className="text-xl text-gray-900 max-w-3xl mx-auto">
                            Explore our creative designs and promotional materials
                        </p>
                    </div>

                    <div className="relative max-w-7xl mx-auto">
                        <div className="relative flex items-center justify-center gap-4 overflow-hidden py-8">
                            {/* Previous Flyer (Left) */}
                            <div className="hidden md:block w-64 h-fit opacity-30 hover:opacity-50 transition-all duration-300 cursor-pointer flex-shrink-0"
                                onClick={prevFlyer}>
                                <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 h-full shadow-lg">
                                    <img
                                        src={flyers[getPrevIndex()].image}
                                        alt={flyers[getPrevIndex()].title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            {/* Current Flyer (Center) */}
                            <div className="w-full md:w-fit h-fit md:h-[600px] flex-shrink-0 transition-all duration-500 ease-in-out">
                                <div className="relative rounded-2xl overflow-hidden bg-gray-800 border-2 border-blue-500 shadow-lg h-full">
                                    <img
                                        src={flyers[currentFlyer].image}
                                        alt={flyers[currentFlyer].title}
                                        className="w-full h-full object-contain"
                                    />

                                    {/* Navigation Arrows */}
                                    <button
                                        onClick={prevFlyer}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 group z-10"
                                        aria-label="Previous flyer"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
                                    </button>

                                    <button
                                        onClick={nextFlyer}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 group z-10"
                                        aria-label="Next flyer"
                                    >
                                        <ChevronRight className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Next Flyer (Right) */}
                            <div className="hidden md:block md:w-fit h-[400px] opacity-30 hover:opacity-50 transition-all duration-300 cursor-pointer flex-shrink-0"
                                onClick={nextFlyer}>
                                <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 h-full shadow-lg">
                                    <img
                                        src={flyers[getNextIndex()].image}
                                        alt={flyers[getNextIndex()].title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </section>
        );
    };

    const businessTypes = [
        {
            title: "Freelancers",
            description: "Perfect for independent professionals to manage invoices quickly.",
            icon: <User className="w-6 h-6 text-blue-500" />
        },
        {
            title: "Small Businesses",
            description: "Easily handle billing and invoicing for your growing business.",
            icon: <Store className="w-6 h-6 text-purple-500" />
        },
        {
            title: "Enterprises",
            description: "Robust invoicing solutions for large-scale companies.",
            icon: <Building className="w-6 h-6 text-red-500" />
        },
        {
            title: "Consultants",
            description: "Manage client invoices and track your projects efficiently.",
            icon: <Users className="w-6 h-6 text-green-500" />
        },
        {
            title: "E-commerce",
            description: "Automate invoicing for online orders and sales.",
            icon: <ShoppingCart className="w-6 h-6 text-pink-500" />
        },
        {
            title: "Service Providers",
            description: "Simplify billing for your services and clients.",
            icon: <Wrench className="w-6 h-6 text-yellow-500" />
        }
    ];

    return (
        <div className="bg-blue-900 leading-tight tracking-tighter">
            {/* HERO SECTION */}
            <section
                id="hero-section"
                className="relative overflow-hidden bg-fit bg-center h-[600px]" style={{ backgroundImage: `url(${hero})` }}
            >
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 absolute inset-0 bg-black/80 backdrop-blur-sm">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-6 text-white tracking-tighter">
                            Simplify Business
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-200 bg-clip-text text-transparent">
                                {" "}Transactions
                            </span>
                        </h1>
                        <p className="text-xl sm:text-xl mb-10 leading-relaxed text-gray-400">
                            Generate invoices and receipts in seconds, seamlessly.
                            <br />
                            Professional, fast, and incredibly simple.
                        </p>

                        <button
                            onClick={() => setCurrentPage('invoice')}
                            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300"
                        >
                            Generate Invoice Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                            Key Features of <span className="bg-gradient-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent"> Invigen</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Each feature crafted to make invoice generation faster, smarter, and more professional.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500 transition-all duration-300">
                            <div className="text-4xl mb-4"><Zap className="w-6 h-6 text-blue-500" /></div>
                            <h3 className="text-xl font-bold mb-3 text-white">Instant Generation</h3>
                            <p className="text-gray-400">
                                Create professional invoices in seconds with our streamlined interface and smart templates.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-cyan-500 transition-all duration-300">
                            <div className="text-4xl mb-4"><BadgeCheck className="w-6 h-6 text-blue-500" /></div>
                            <h3 className="text-xl font-bold mb-3 text-white">Professional Output</h3>
                            <p className="text-gray-400">
                                Clean, polished invoices that enhance your brand image and build client trust.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500 transition-all duration-300">
                            <div className="text-4xl mb-4"><Briefcase className="w-6 h-6 text-blue-500" /></div>
                            <h3 className="text-xl font-bold mb-3 text-white">Business Ready</h3>
                            <p className="text-gray-400">
                                Perfect for freelancers, small businesses, and enterprises of any size.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* USE CASES / BUSINESS TYPES SECTION */}
            <section id="use-cases-section" className="py-24 bg-gray-900">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                            Perfect for Every <span className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-3">Business</span> Context
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Whether you're managing a single client or running an enterprise, our system scales to your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {businessTypes.map((type, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                            >
                                <div className="mb-3">{type.icon}</div>
                                <h3 className="text-lg font-semibold mb-2 text-white">{type.title}</h3>
                                <p className="text-sm text-gray-400">{type.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FLYERS SHOWCASE SECTION */}
            <FlyersShowcase />

            {/* TESTIMONIALS SECTION */}
            <section className="py-24 bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Trusted by Professionals</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'CEO, TechStart Inc.',
                                quote:
                                    'Invigen has transformed how we handle invoicing. What used to take hours now takes minutes.'
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Freelance Designer',
                                quote:
                                    'As a freelancer, I need tools that are simple and efficient. Invigen delivers exactly that.'
                            },
                            {
                                name: 'Emily Rodriguez',
                                role: 'Owner, Bloom Boutique',
                                quote:
                                    'The professional look of our invoices has improved our brand image significantly.'
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
                                <p className="text-lg mb-6 italic text-gray-300">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{testimonial.name}</p>
                                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact-section" className="py-24 bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Get in Touch</h2>
                    <p className="text-xl mb-12 text-gray-400">Have questions or need support? We're here to help.</p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <a
                            href="mailto:pixeldesksolutions@gmail.com"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-750 text-white border border-gray-700 transition-all duration-300 font-medium"
                        >
                            <Mail className="w-5 h-5" />
                            pixeldesksolutions@gmail.com
                        </a>

                        <a
                            href="tel:+23359377115"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-750 text-white border border-gray-700 transition-all duration-300 font-medium"
                        >
                            <Phone className="w-5 h-5" />
                            +233 593-77-115
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black border-t border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl font-bold text-white">Invigen</span>
                            </div>
                            <p className="text-sm mb-3 text-gray-400">by Mayflower</p>
                            <p className="text-sm text-gray-500">Simplifying business transactions for everyone.</p>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-400">Contact</h3>
                            <div className="space-y-3">
                                <a href="mailto:pixeldesksolutions@gmail.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                    pixeldesksolutions@gmail.com
                                </a>
                                <a href="tel:+23359377115" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                    +233 593-77-115
                                </a>
                            </div>
                        </div>

                        {/* Social */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-400">Follow Us</h3>
                            <div className="flex gap-3">
                                {[Facebook, Twitter, Linkedin].map((Icon, idx) => (
                                    <button key={idx} className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors">
                                        <Icon className="w-5 h-5 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-900 pt-8 text-center">
                        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Invigen. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
import React from 'react';


const AboutPage = () => {
    return (
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About Invigen</h2>
                    <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        At Invigen, we believe that managing business transactions should be simple, efficient, and professional.
                        Our platform empowers businesses of all sizes to create polished invoices and receipts instantly,
                        helping you maintain a professional image and streamline your financial operations.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        Founded with the mission to simplify business documentation, we've built a tool that combines
                        ease of use with professional-grade results. Whether you're a freelancer, small business owner,
                        or enterprise, Invigen adapts to your needs.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">Fast</div>
                            <p className="text-gray-600">Generate in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">Professional</div>
                            <p className="text-gray-600">Clean, polished output</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">Simple</div>
                            <p className="text-gray-600">Easy to use interface</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default AboutPage;
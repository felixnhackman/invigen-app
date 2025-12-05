import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import InvoiceGenerator from './components/InvoiceGenerator';
import DarkModeToggle from './components/DarkModeToggle';
import InvoiceDownloadPage from './components/InvoiceDownload';
import './index.css';
import './App.css';


function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />



      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'about' && <AboutPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'contact' && <ContactPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'invoice' && <InvoiceGenerator />}






      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
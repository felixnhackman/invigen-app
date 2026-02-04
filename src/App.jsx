import React, { useState, useEffect } from 'react';
import { supabase, supabaseUserToAppUser } from './lib/supabase';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import InvoiceGenerator from './components/InvoiceGenerator';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import Pricing from './components/Pricing';
import DarkModeToggle from './components/DarkModeToggle';
import './index.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setUser(session?.user ? supabaseUserToAppUser(session.user) : null);
          setAuthChecked(true);
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setAuthChecked(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ? supabaseUserToAppUser(session.user) : null);
      }
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  // Redirect to signup if guest tries to open invoice page (after auth has been checked)
  useEffect(() => {
    if (authChecked && currentPage === 'invoice' && !user) {
      setCurrentPage('signup');
    }
  }, [authChecked, currentPage, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} user={user} />}
      {currentPage === 'about' && <AboutPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'contact' && <ContactPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'invoice' && user && <InvoiceGenerator user={user} setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && (
        <LoginPage
          setCurrentPage={setCurrentPage}
          onLogin={setUser}
        />
      )}
      {currentPage === 'signup' && (
        <SignupPage
          setCurrentPage={setCurrentPage}
          onLogin={setUser}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      )}
      {currentPage === 'pricing' && (
        <Pricing setCurrentPage={setCurrentPage} user={user} />
      )}

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;

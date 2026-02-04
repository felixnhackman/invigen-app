import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase, supabaseUserToAppUser } from './lib/supabase';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import PageSkeleton from './components/PageSkeleton';
import AndroidChromeTip from './components/AndroidChromeTip';
import './index.css';
import './App.css';

// Lazy-load pages so initial load is smaller and faster; chunks are cached for next visit
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const InvoiceGenerator = lazy(() => import('./components/InvoiceGenerator'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const SignupPage = lazy(() => import('./components/SignupPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const Pricing = lazy(() => import('./components/Pricing'));

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
      <AndroidChromeTip />
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} user={user} />}
      <Suspense fallback={<PageSkeleton />}>
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
      </Suspense>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;

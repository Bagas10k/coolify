import React, { useState, useEffect } from 'react';
import Portfolio from './Portfolio';
import Login from './Login';
import Dashboard from './Dashboard';
import Button from './components/Button';
import { Terminal } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('portfolio'); // 'portfolio' | 'login' | 'dashboard'
  const [authenticated, setAuthenticated] = useState(false);

  // Sync auth status on boot
  useEffect(() => {
    // We try to fetch projects; if it returns 200, we're logged in.
    // Otherwise, we're guests.
    async function checkAuth() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          setAuthenticated(true);
          // If URL path is /dashboard, show dashboard
          if (window.location.pathname === '/dashboard') {
            setPage('dashboard');
          }
        } else {
          setAuthenticated(false);
          if (window.location.pathname === '/dashboard') {
            setPage('login');
          }
        }
      } catch (_) {
        setAuthenticated(false);
      }
    }
    checkAuth();

    // Listen to manual URL back/forward navigation
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        setPage(authenticated ? 'dashboard' : 'login');
      } else if (path === '/login') {
        setPage('login');
      } else {
        setPage('portfolio');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [authenticated]);

  const navigateTo = (newPage) => {
    setPage(newPage);
    if (newPage === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (newPage === 'login') {
      window.history.pushState({}, '', '/login');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (_) {}
    setAuthenticated(false);
    navigateTo('portfolio');
  };

  return (
    <div>
      {/* ─── Navbar ─── */}
      <nav className="navbar" id="navbar">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); navigateTo('portfolio'); }}>
          <span className="logo-icon">
            <Terminal size={20} />
          </span>
          <span>Bagas10k</span>
        </a>

        {page === 'portfolio' && (
          <div className="nav-center portfolio-nav">
            <a href="#home" className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
            }}>Home</a>
            <a href="#about" className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }}>About</a>
            <a href="#projects" className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            }}>Projects</a>
            <a href="#services" className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
            }}>Services</a>
            <a href="#contact" className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            }}>Contact</a>
          </div>
        )}

        <div className="nav-actions">
          {page === 'portfolio' && (
            <a href="/cv.pdf" download="Bagas_CV.pdf" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="bg-amber-500/10 text-amber-600 border border-amber-500/25 hover:bg-amber-500/20">
                Download CV
              </Button>
            </a>
          )}
          {authenticated ? (
            page === 'dashboard' ? (
              <Button variant="ghost" size="sm" onClick={() => navigateTo('portfolio')}>
                View Portfolio
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigateTo('dashboard')}>
                Dashboard
              </Button>
            )
          ) : (
            page === 'login' ? (
              <Button variant="ghost" size="sm" onClick={() => navigateTo('portfolio')}>
                Home
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigateTo('login')}>
                Sign In
              </Button>
            )
          )}
        </div>
      </nav>

      {/* ─── Page Router ─── */}
      {page === 'portfolio' && <Portfolio onNavigate={navigateTo} />}
      {page === 'login' && (
        <Login 
          onLoginSuccess={() => {
            setAuthenticated(true);
            navigateTo('dashboard');
          }} 
        />
      )}
      {page === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
        />
      )}

      {/* ─── Footer ─── */}
      <footer className="footer">
        <p>© 2026 Bagas10k. Created with custom Node.js Coolify dashboard.</p>
      </footer>
    </div>
  );
}

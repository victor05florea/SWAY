import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';

// Un mic truc ca să știm pe ce pagină suntem și să colorăm link-ul din Navbar
function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black italic text-sway-red tracking-widest font-headline">SWAY</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`font-headline tracking-tighter uppercase transition-colors duration-300 ${isActive('/') ? 'text-sway-red border-b-2 border-sway-red pb-1' : 'text-gray-500 hover:text-white'}`}>Home</Link>
          <Link to="/leaderboard" className={`font-headline tracking-tighter uppercase transition-colors duration-300 ${isActive('/leaderboard') ? 'text-sway-red border-b-2 border-sway-red pb-1' : 'text-gray-500 hover:text-white'}`}>Leaderboard</Link>
          <a href="#" className="font-headline tracking-tighter uppercase text-gray-500 hover:text-white transition-colors duration-300">Discord</a>
        </div>
        <a href="steam://connect/IP_AICI" className="bg-primary-dim text-white font-headline uppercase tracking-widest px-6 py-2 hover:bg-sway-red transition-all duration-200">
          CONNECT
        </a>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen relative font-body selection:bg-primary-dim selection:text-white flex flex-col">
        {/* Background Grid */}
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

        {/* Navbar */}
        <Navigation />

        {/* Zona dinamică: Aici se schimbă paginile */}
        <main className="relative z-10 pt-28 pb-32 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-background py-8 border-t border-outline-variant/15 relative z-10 mt-auto">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-lg font-black text-sway-red font-headline tracking-widest uppercase">SWAY</div>
            <div className="font-headline text-[10px] uppercase tracking-[0.2em] text-gray-600">
               © 2026 SWAY HNS. BUILT FOR VELOCITY.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
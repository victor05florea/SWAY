import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Bans from './pages/Bans'; 
import Profile from './pages/Profile';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        
        {/* LOGO CU NEON HOVER */}
        <Link to="/" className="text-2xl font-black italic text-sway-red tracking-widest font-headline hover:drop-shadow-[0_0_12px_rgba(233,0,54,0.8)] transition-all duration-300">
          SWAY
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          
          {/* HOME */}
          <Link to="/" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Home
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>
          
          {/* RANKINGS */}
          <Link to="/leaderboard" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/leaderboard') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Rankings
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/leaderboard') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          {/* HALL OF SHAME */}
          <Link to="/bans" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/bans') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Hall of Shame
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary-dim transition-transform duration-300 origin-left ${isActive('/bans') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>
          
          {/* DISCORD */}
          <a href="#" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.5)]">
            Discord
            {/* Culoare specifică Discord la linia de hover */}
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#5865F2] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

          {/* STEAM GROUP (NOU) */}
          <a href="https://steamcommunity.com/groups/swayro" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(102,192,244,0.5)]">
            Steam Group
            {/* Culoare specifică Steam la linia de hover */}
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#66c0f4] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

        </div>
        
        {/* BUTONUL CONNECT CU SWEEP ANIMATION */}
        <a href="steam://connect/IP_AICI" className="relative overflow-hidden group bg-primary-dim text-white font-headline uppercase tracking-widest px-6 py-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(233,0,54,0.4)] border border-transparent hover:border-white/20">
          <span className="relative z-10 group-hover:tracking-[0.2em] transition-all duration-300">CONNECT</span>
          {/* Sweep luminos */}
          <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full skew-x-12 -ml-4"></div>
        </a>

      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen relative font-body selection:bg-primary-dim selection:text-white flex flex-col">
        
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

        <Navigation />

        <main className="relative z-10 pt-28 pb-32 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/bans" element={<Bans />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>

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
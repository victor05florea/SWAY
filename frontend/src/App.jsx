import React, { useEffect } from 'react';
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
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
        
        <Link to="/" className="text-2xl font-black italic text-sway-red tracking-widest font-headline hover:drop-shadow-[0_0_15px_rgba(233,0,54,0.8)] transition-all duration-300 cursor-pointer z-10">
          SWAY
        </Link>
        
        <div className="hidden md:flex items-center gap-8 mx-auto absolute left-1/2 -translate-x-1/2">
          
          <Link to="/" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Home
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>
          
          <Link to="/leaderboard" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/leaderboard') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Rankings
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/leaderboard') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          <Link to="/bans" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/bans') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Hall of Shame
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary-dim transition-transform duration-300 origin-left ${isActive('/bans') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          <Link to="/demos" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/demos') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Demos
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary-dim transition-transform duration-300 origin-left ${isActive('/demos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>
          
          <a href="#" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.5)]">
            Discord
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#5865F2] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

          <a href="https://steamcommunity.com/groups/swayro" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(102,192,244,0.5)]">
            Steam Group
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#66c0f4] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

        </div>

      </div>
    </nav>
  );
}

function App() {
  
  // LOGICĂ SCROLLBAR: APARE INSTANT LA HOVER PE MARGINE SAU LA SCROLL
  useEffect(() => {
    let scrollTimeout;
    let isHoveringEdge = false;

    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      resetTimer();
    };

    // Funcția care ascultă mouse-ul
    const handleMouseMove = (e) => {
      // Dacă mouse-ul se află în ultimii 30 de pixeli din dreapta ecranului
      if (e.clientX >= window.innerWidth - 30) {
        isHoveringEdge = true;
        document.documentElement.classList.add('is-scrolling'); // Îl facem vizibil instant
        clearTimeout(scrollTimeout); // Oprim orice timer de dispariție
      } else {
        // Dacă plecăm de pe margine
        if (isHoveringEdge) {
          isHoveringEdge = false;
          resetTimer(); // Pornim timer-ul de ascundere
        }
      }
    };

    const resetTimer = () => {
      clearTimeout(scrollTimeout);
      // Dispariție după 600ms de inactivitate a scroll-ului, cu condiția să nu fim cu mouse-ul pe margine
      if (!isHoveringEdge) {
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove('is-scrolling');
        }, 600);
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative font-body selection:bg-primary-dim selection:text-white flex flex-col">
        
        {/* CSS GLOBAL PENTRU SCROLLBAR */}
        <style>{`
          html ::-webkit-scrollbar {
            width: 6px;
            background: transparent;
          }
          
          html ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          /* INVIZIBIL - Starea normală */
          html ::-webkit-scrollbar-thumb {
            background: rgba(233, 0, 54, 0); 
            border-radius: 6px;
            transition: background-color 0.4s ease-out;
          }

          /* VIZIBIL - La scroll SAU la hover pe zona din dreapta */
          html.is-scrolling ::-webkit-scrollbar-thumb {
            background: rgba(233, 0, 54, 0.6);
          }
          
          /* ROȘU APRINS - Când chiar pui mouse-ul pe bară */
          html.is-scrolling ::-webkit-scrollbar-thumb:hover {
            background: rgba(233, 0, 54, 1);
          }
        `}</style>

        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

        <Navigation />

        <main className="relative z-10 pt-24 pb-10 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/bans" element={<Bans />} />
            <Route path="/profile/:id" element={<Profile />} />
            
            <Route path="/demos" element={<div className="text-center text-white mt-32 font-headline text-3xl tracking-widest uppercase text-primary-dim">Demos Coming Soon</div>} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;
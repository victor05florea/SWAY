import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Bans from './pages/Bans'; 
import Profile from './pages/Profile';

function BackgroundSlider() {
  const [images] = React.useState(() => {
    const slideshowImages = [
      "fj_mansion.webp", "hns_avenue.webp", "hns_backalot.webp", "hns_devblocks_remake.webp", "hns_freeway.webp", "hns_mini_bbcity.webp", "hns_mini_floppy.webp", "hns_mini_jukecity.webp", "hns_mini_rooftops.webp", "hns_rooftops_remake.webp", "hns_mini_tyo.webp", "hns_trickpark.webp", "hns_boost_bbcity.webp", "hns_skyline.webp", "hns_boost_dust2.webp", "hns_boost_qube.webp", "hns_boost_mafia.webp", "hns_boost_jukecity.webp", "hns_oilrig.webp", "hns_miami.webp", "hns_half.webp", "hns_sunset.webp", "hns_rooftops.webp", "hns_rooftops_v5.webp", "hns_virtual.webp", "hns_iceskating.webp", "hns_jhard.webp", "hns_zen.webp", "hns_ruins.webp", "hns_liberation.webp", "hns_kitty_pro.webp", "hns_funk.webp", "hns_flowtown.webp", "hns_floppytown.webp", "hns_esip.webp", "hns_brickworld.webp", "hns_bakgard.webp", "hns_assault_inside.webp", "hns_jukecity.webp", "hns_devblocks.webp", "hns_tyo.webp", "hns_bbcity.webp"
    ];
    
    const shuffled = [...slideshowImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  if (images.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideshow {
            0% { opacity: 0; transform: scale(1.1); }
            4% { opacity: 1; }
            21% { opacity: 1; }
            25% { opacity: 0; transform: scale(1); }
            100% { opacity: 0; }
        }
        .slideshow-container { position: fixed; inset: 0; z-index: -10; background: #0a0a0c; overflow: hidden; }
        .slide { 
            position: absolute; inset: 0; background-size: cover; background-position: center; 
            opacity: 0; animation: slideshow 60s linear infinite; 
            filter: brightness(0.15) blur(4px) saturate(0.5);
        }
        @media (max-width: 767px) {
          .slide {
            animation: none;
            opacity: 0;
            filter: brightness(0.25) blur(1px) saturate(0.7);
          }
          .slide:first-child {
            opacity: 1;
          }
        }
      `}</style>
      <div className="slideshow-container">
        {images.map((img, index) => (
          <div 
            key={img}
            className="slide" 
            style={{ 
              backgroundImage: `url(/images/${img})`, 
              animationDelay: `${index * 5}s`,
              animationDuration: `${images.length * 1}s` 
            }}
          />
        ))}
      </div>
    </>
  );
}

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
        
        <Link to="/" className="text-2xl font-black italic text-sway-red tracking-widest font-headline hover:drop-shadow-[0_0_15px_rgba(233,0,54,0.8)] transition-all duration-300 cursor-pointer z-10">
          SWAY
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-white/15 text-gray-300 hover:text-white hover:border-primary-dim/40 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        
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
          
          {/* BUTOANE SOCIALE FIXATE ȘI YOUTUBE ADĂUGAT */}
          <a href="https://discord.gg/eWMUKGB" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.5)]">
            Discord
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#5865F2] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

          <a href="https://steamcommunity.com/groups/swayhns" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(102,192,244,0.5)]">
            Steam Group
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#66c0f4] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

          <a href="https://www.youtube.com/@cra5h1337" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
            Youtube
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF0000] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

        </div>
      </div>

      <div className={`md:hidden fixed top-[73px] right-0 h-[calc(100vh-73px)] w-[82%] max-w-[320px] bg-background/95 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-5 gap-3">
          <Link to="/" className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Home</Link>
          <Link to="/leaderboard" className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/leaderboard') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Rankings</Link>
          <Link to="/bans" className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/bans') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Hall of Shame</Link>
          <Link to="/demos" className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/demos') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Demos</Link>

          <div className="h-px bg-white/10 my-2"></div>

          <a href="https://discord.gg/eWMUKGB" target="_blank" rel="noreferrer" className="font-headline uppercase tracking-widest text-xs px-3 py-3 border border-white/10 text-gray-300">Discord</a>
          <a href="https://steamcommunity.com/groups/swayhns" target="_blank" rel="noreferrer" className="font-headline uppercase tracking-widest text-xs px-3 py-3 border border-white/10 text-gray-300">Steam Group</a>
          <a href="https://www.youtube.com/@cra5h1337" target="_blank" rel="noreferrer" className="font-headline uppercase tracking-widest text-xs px-3 py-3 border border-white/10 text-gray-300">Youtube</a>
        </div>
      </div>

      {isMobileMenuOpen && (
        <button
          className="md:hidden fixed inset-0 top-[73px] bg-black/45"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
    </nav>
  );
}

function App() {
  
  // LOGICĂ SCROLLBAR
  useEffect(() => {
    let scrollTimeout;
    let isHoveringEdge = false;

    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      resetTimer();
    };

    const handleMouseMove = (e) => {
      if (e.clientX >= window.innerWidth - 30) {
        isHoveringEdge = true;
        document.documentElement.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
      } else {
        if (isHoveringEdge) {
          isHoveringEdge = false;
          resetTimer();
        }
      }
    };

    const resetTimer = () => {
      clearTimeout(scrollTimeout);
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
        
        <style>{`
          html ::-webkit-scrollbar { width: 6px; background: transparent; }
          html ::-webkit-scrollbar-track { background: transparent; }
          html ::-webkit-scrollbar-thumb { background: rgba(233, 0, 54, 0); border-radius: 6px; transition: background-color 0.4s ease-out; }
          html.is-scrolling ::-webkit-scrollbar-thumb { background: rgba(233, 0, 54, 0.6); }
          html.is-scrolling ::-webkit-scrollbar-thumb:hover { background: rgba(233, 0, 54, 1); }
        `}</style>

        {/* FUNDAL ANIMAT - Acum rulează pe toată aplicația */}
        <BackgroundSlider />
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
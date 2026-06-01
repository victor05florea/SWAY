import React, { useEffect, useState, lazy, Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

const importHome = () => import('./pages/Home');
const importLeaderboard = () => import('./pages/Leaderboard');
const importBans = () => import('./pages/Bans');
const importProfile = () => import('./pages/Profile');

const Home = lazy(importHome);
const Leaderboard = lazy(importLeaderboard);
const Bans = lazy(importBans);
const Profile = lazy(importProfile);

const prefetch = {
  '/': importHome,
  '/leaderboard': importLeaderboard,
  '/bans': importBans,
};
const handlePrefetch = (key) => () => { const fn = prefetch[key]; if (fn) fn(); };

const SLIDESHOW_POOL = [
  "fj_mansion.webp", "hns_avenue.webp", "hns_backalot.webp", "hns_devblocks_remake.webp", "hns_freeway.webp", "hns_mini_bbcity.webp", "hns_mini_floppy.webp", "hns_mini_jukecity.webp", "hns_mini_rooftops.webp", "hns_rooftops_remake.webp", "hns_mini_tyo.webp", "hns_trickpark.webp", "hns_boost_bbcity.webp", "hns_skyline.webp", "hns_boost_dust2.webp", "hns_boost_qube.webp", "hns_boost_mafia.webp", "hns_boost_jukecity.webp", "hns_oilrig.webp", "hns_miami.webp", "hns_half.webp", "hns_sunset.webp", "hns_rooftops.webp", "hns_rooftops_v5.webp", "hns_virtual.webp", "hns_iceskating.webp", "hns_jhard.webp", "hns_zen.webp", "hns_ruins.webp", "hns_liberation.webp", "hns_kitty_pro.webp", "hns_funk.webp", "hns_flowtown.webp", "hns_floppytown.webp", "hns_esip.webp", "hns_brickworld.webp", "hns_bakgard.webp", "hns_assault_inside.webp", "hns_jukecity.webp", "hns_devblocks.webp", "hns_tyo.webp", "hns_bbcity.webp"
];
const SLIDESHOW_COUNT = 6;

const SLIDESHOW = (() => {
  const pool = [...SLIDESHOW_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SLIDESHOW_COUNT);
})();

if (typeof document !== 'undefined' && SLIDESHOW[0]) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = `/images/${SLIDESHOW[0]}`;
  link.fetchPriority = 'high';
  document.head.appendChild(link);
}

const BackgroundSlider = memo(function BackgroundSlider() {
  const images = SLIDESHOW;
  if (images.length === 0) return null;

  const cycle = images.length * 5;
  return (
    <div className="slideshow-container">
      {images.map((img, index) => (
        <div
          key={img}
          className="slide"
          style={{
            backgroundImage: `url(/images/${img})`,
            animationDelay: `${index * 5}s`,
            animationDuration: `${cycle}s`
          }}
        />
      ))}
    </div>
  );
});

const Navigation = memo(function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Close the mobile menu on navigation. Intentional state reset on route change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav aria-label="Main navigation" className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15 transition-all duration-300">
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

          <Link to="/" onMouseEnter={handlePrefetch('/')} onFocus={handlePrefetch('/')} className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Home
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          <Link to="/leaderboard" onMouseEnter={handlePrefetch('/leaderboard')} onFocus={handlePrefetch('/leaderboard')} className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/leaderboard') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Rankings
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-sway-red transition-transform duration-300 origin-left ${isActive('/leaderboard') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          <Link to="/bans" onMouseEnter={handlePrefetch('/bans')} onFocus={handlePrefetch('/bans')} className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/bans') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Hall of Shame
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary-dim transition-transform duration-300 origin-left ${isActive('/bans') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

          <Link to="/demos" className={`relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 ${isActive('/demos') ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
            Demos
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary-dim transition-transform duration-300 origin-left ${isActive('/demos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
          </Link>

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
          <Link to="/" onTouchStart={handlePrefetch('/')} className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Home</Link>
          <Link to="/leaderboard" onTouchStart={handlePrefetch('/leaderboard')} className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/leaderboard') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Rankings</Link>
          <Link to="/bans" onTouchStart={handlePrefetch('/bans')} className={`font-headline uppercase tracking-widest text-sm px-3 py-3 border ${isActive('/bans') ? 'text-white border-primary-dim/40 bg-primary-dim/10' : 'text-gray-400 border-white/10'}`}>Hall of Shame</Link>
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
});

function RouteFallback() {
  return <div className="text-center text-primary-dim font-headline text-xl tracking-widest uppercase mt-32 animate-pulse">Loading…</div>;
}

function App() {
  useEffect(() => {
    let scrollTimeout;
    let isHoveringEdge = false;
    let rafPending = false;
    let lastClientX = 0;

    const resetTimer = () => {
      clearTimeout(scrollTimeout);
      if (!isHoveringEdge) {
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove('is-scrolling');
        }, 600);
      }
    };

    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      resetTimer();
    };

    const processMouse = () => {
      rafPending = false;
      const onEdge = lastClientX >= window.innerWidth - 30;
      if (onEdge) {
        isHoveringEdge = true;
        document.documentElement.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
      } else if (isHoveringEdge) {
        isHoveringEdge = false;
        resetTimer();
      }
    };

    const handleMouseMove = (e) => {
      lastClientX = e.clientX;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(processMouse);
      }
    };

    const handleGlobalKey = (e) => {
      if (e.defaultPrevented) return;
      const target = e.target;
      const tag = target && target.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable);
      if (e.key === '/' && !isEditable && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.querySelector('[data-search-input]');
        if (el) {
          e.preventDefault();
          el.focus();
          if (typeof el.select === 'function') el.select();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleGlobalKey);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative font-body selection:bg-primary-dim selection:text-white flex flex-col">
        <BackgroundSlider />
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

        <Navigation />

        <main id="content" role="main" className="relative z-10 pt-24 pb-10 flex-grow">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/bans" element={<Bans />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/demos" element={<div className="text-center text-white mt-32 font-headline text-3xl tracking-widest uppercase text-primary-dim">Demos Coming Soon</div>} />
            </Routes>
          </Suspense>
        </main>

      </div>
    </Router>
  );
}

export default App;

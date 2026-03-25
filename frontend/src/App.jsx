import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Bans from './pages/Bans'; 
import Profile from './pages/Profile';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // STATE PENTRU USER LOGAT (SIMULARE)
  const [user, setUser] = useState(null); 

  useEffect(() => {
    // Încercăm să citim token-ul la încărcare
    const savedToken = localStorage.getItem('sway_token');
    
    // Verificăm și URL-ul pentru token (cazul când ne întoarcem de la Steam)
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
        localStorage.setItem('sway_token', tokenFromUrl);
        // Curățăm URL-ul
        navigate(location.pathname, { replace: true });
        // Aici ar urma fetch-ul real. Simulăm:
        setUser({
            name: "SwayPlayer",
            avatarUrl: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
            steamid: "STEAM_0:1:12345678",
            admin: "1",
            vip: 1
        });
    } else if (savedToken) {
        // Simulăm fetch-ul pe baza token-ului salvat
        setUser({
            name: "SwayPlayer",
            avatarUrl: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
            steamid: "STEAM_0:1:12345678",
            admin: "1",
            vip: 1
        });
    }
  }, [location.search, location.pathname, navigate]);

  const handleSteamLogin = () => {
    // window.location.href = "http://localhost:8080/api/auth/steam";
    // Simulare login rapid pt test interfață
    const fakeToken = "fake-jwt-token";
    navigate(`${location.pathname}?token=${fakeToken}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('sway_token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-3 max-w-7xl mx-auto">
        
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
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#5865F2] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

          {/* STEAM GROUP */}
          <a href="#" target="_blank" rel="noreferrer" className="relative font-headline tracking-tighter uppercase py-1 group transition-all duration-300 text-gray-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(102,192,244,0.5)]">
            Steam Group
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#66c0f4] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
          </a>

        </div>
        
        {/* ZONA DE AUTENTIFICARE */}
        <div className="flex items-center">
          {!user ? (
            /* Butonul de Login cu Steam re-stilizat din Connect */
            <button 
              onClick={handleSteamLogin}
              className="relative overflow-hidden group bg-[#171a21] text-white font-headline uppercase tracking-widest px-5 py-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,192,244,0.3)] border border-white/5 hover:border-[#66c0f4]/50 flex items-center gap-2.5 rounded-sm"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-4 h-4" alt="Steam"/>
              <span className="relative z-10 text-[10px] group-hover:tracking-[0.1em] transition-all duration-300 font-bold">Sign In</span>
              <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full skew-x-12 -ml-4"></div>
            </button>
          ) : (
            /* Interfața pentru utilizator logat */
            <div className="flex items-center gap-5 relative group/user">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white group-hover/user:text-sway-red transition-colors">{user.name}</div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover/user:text-white transition-colors">My Account</div>
                </div>
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-lg border-2 border-white/10 group-hover/user:border-sway-red transition-colors object-cover shadow-lg"
                />
              </div>
              
              {/* Dropdown simplu la hover */}
              <div className="absolute top-full right-0 mt-2 w-40 bg-surface-container-highest border border-outline-variant/30 rounded-lg shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-300 z-50 overflow-hidden">
                <Link to={`/profile/${user.steamid}`} className="block px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white font-headline uppercase tracking-widest border-b border-outline-variant/15">
                    View Profile
                </Link>
                <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-2.5 text-xs text-primary-dim hover:bg-primary-dim/10 font-headline uppercase tracking-widest flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Logout
                </button>
              </div>
            </div>
          )}
        </div>

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

        <main className="relative z-10 pt-24 pb-10 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/bans" element={<Bans />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;
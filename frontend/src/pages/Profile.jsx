import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Profile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NOU: Memoria pentru butonul de Jump Stats (PRE vs NOPRE)
  const [jumpMode, setJumpMode] = useState("PRE");

  useEffect(() => {
    fetch(`http://localhost:8080/api/players/${id}`)
      .then(response => {
        if (!response.ok) throw new Error("Operator not found");
        return response.json();
      })
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Eroare:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary-dim font-headline text-2xl animate-pulse uppercase">Establishing secure connection...</div>;
  if (!player) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-headline text-2xl uppercase">Operator Identity Not Found.</div>;

  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);
  const steamLink = player.steamId ? `https://steamcommunity.com/profiles/${player.steamId}` : `https://steamcommunity.com/search/users/#text=${player.name}`;

  // Logica viitoare pentru a alege datele corecte de pe backend
  // Când fratele tău va face backend-ul, datele vor veni probabil sub formă de obiecte separate
  const currentJumpStats = jumpMode === "PRE" 
    ? (player.jumpStatsPre || {}) 
    : (player.jumpStatsNoPre || {});

  return (
    <div className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <Link to="/leaderboard" className="inline-flex items-center text-gray-500 hover:text-primary-dim font-headline uppercase tracking-widest text-sm transition-colors mb-4 border border-outline-variant/30 px-4 py-2 bg-surface-container-high hover:bg-white/5">
         &larr; Return to Rankings
      </Link>

      {/* HEADER PROFIL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-outline-variant/20 pb-8">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary-dim/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-48 h-48 bg-surface-container-highest overflow-hidden border-2 border-primary-dim/20">
              <img src={player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundType=gradientLinear&backgroundColor=0e0e0e,ff003c`} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <span className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">{player.name}</span>
            <div className="flex flex-col gap-1 mt-2">
              <span className="font-headline text-primary-dim tracking-[0.4em] text-sm md:text-base font-bold uppercase">Database ID: #{player.id}</span>
              <span className="font-headline text-gray-500 tracking-[0.2em] text-xs uppercase">Status: Active Operator</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <a href={steamLink} target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-primary-dim text-white font-headline font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(233,0,54,0.4)]">
            <span className="relative z-10 flex items-center space-x-3">
              <span>OPEN STEAM PROFILE</span>
              <span className="text-xl leading-none">&nearr;</span>
            </span>
          </a>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        
        {/* 1. SERVICE RECORD */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Service Record</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Time</p>
              <p className="font-headline text-2xl font-bold text-white">{player.totalPlaytime || '0'} <span className="text-xs text-gray-500">HRS</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Last 7 Days</p>
              <p className="font-headline text-2xl font-bold text-primary-dim">{player.weeklyPlaytime || '0'} <span className="text-xs text-gray-500">HRS</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Ownages</p>
              <p className="font-headline text-2xl font-bold text-white">{player.ownages || '0'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Wreckers</p>
              <p className="font-headline text-2xl font-bold text-white">{player.wreckers || '0'}</p>
            </div>
          </div>
        </div>

        {/* 2. PERSONAL BESTS (AICI E COMUTATORUL NOU) */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Personal Bests</h3>
            
            {/* TOGGLE PRE / NOPRE */}
            <div className="flex bg-background border border-outline-variant/20 p-1">
              <button 
                onClick={() => setJumpMode("PRE")}
                className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "PRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}
              >
                PRE
              </button>
              <button 
                onClick={() => setJumpMode("NOPRE")}
                className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "NOPRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}
              >
                NOPRE
              </button>
            </div>
          </div>

          {/* DATELE SCHIMBĂTOARE */}
          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Long Jump</span>
              <span className="font-headline font-bold text-lg text-white tracking-tighter">{currentJumpStats.longjump || '0.00'} <span className="text-[10px] text-gray-600 uppercase ml-1">Units</span></span>
            </div>
            <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Count Jump</span>
              <span className="font-headline font-bold text-lg text-white tracking-tighter">{currentJumpStats.countjump || '0.00'} <span className="text-[10px] text-gray-600 uppercase ml-1">Units</span></span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bhop</span>
              <span className="font-headline font-bold text-lg text-white tracking-tighter">{currentJumpStats.bhop || '0.00'} <span className="text-[10px] text-gray-600 uppercase ml-1">Units</span></span>
            </div>
          </div>
        </div>

        {/* 3. COMBAT RECORD */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Combat Record</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Kills</p>
              <p className="font-headline text-4xl font-bold text-white">{player.kills}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Deaths</p>
              <p className="font-headline text-4xl font-bold text-gray-600">{player.deaths}</p>
            </div>
            <div className="space-y-1">
              <p className="text-primary-dim text-[10px] font-bold uppercase tracking-wider">K/D Ratio</p>
              <p className="font-headline text-4xl font-bold text-primary-dim">{kdRatio}</p>
            </div>
          </div>
        </div>

        {/* 4. KINETICS */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Kinetics</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Jumps</span>
                <span className="font-headline font-bold text-xl text-white">{player.jumps || '0'}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20">
                <div className="h-full bg-primary-dim w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Ducks</span>
                <span className="font-headline font-bold text-xl text-white">{player.ducks || '0'}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20">
                <div className="h-full bg-gray-500 w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaSteam } from 'react-icons/fa';

export default function Profile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jumpMode, setJumpMode] = useState("PRE");

  useEffect(() => {
    // 1. Dacă din greșeală link-ul este gol sau stricat, ne oprim.
    if (!id || id === "undefined") {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/players/${id}`)
      .then(res => {
        // 2. Dacă Java ne spune că nu l-a găsit (Eroare 404 sau 500)
        if (!res.ok) {
          throw new Error("Jucătorul nu a fost găsit în baza de date.");
        }
        return res.json();
      })
      .then(data => {
        // 3. Extra-protecție: Dacă Java ne trimite un JSON de eroare în loc de profil
        if (data.error || !data.name) {
          throw new Error("Date invalide primite de la server.");
        }
        setPlayer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Eroare la încărcarea profilului:", err);
        setPlayer(null); // Forțăm playerul să fie null ca să apară mesajul "Not Found"
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-headline text-primary-dim text-2xl animate-pulse tracking-widest uppercase">Establishing secure connection...</div>;
  
  if (!player) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-500 font-headline text-2xl tracking-widest uppercase">Operator Identity Not Found in Database.</div>;
 
  const preStats = player.jumpStatsPre || {};
  const noPreStats = player.jumpStatsNoPre || {};
  const currentStats = jumpMode === "PRE" ? preStats : noPreStats;

  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);

  // Funcție care transformă ID-ul din baza de date în link real de Steam
  const getSteamProfileUrl = () => {
    const rawId = player.steamid || player.steamId;
    if (!rawId) return `https://steamcommunity.com/search/users/#text=${player.name}`;

    try {
      // Magia SteamID64: adunăm ID-ul scurt cu "numărul magic" de la Valve
      const steam64Base = 76561197960265728n; // Folosim "n" la final pentru numere uriașe (BigInt)

      // Dacă ID-ul este doar din cifre (ex: 371937544)
      if (/^\d+$/.test(rawId)) {
        const steamId64 = BigInt(rawId) + steam64Base;
        return `https://steamcommunity.com/profiles/${steamId64.toString()}`;
      } 
      // Dacă ID-ul este format clasic (ex: STEAM_1:0:185968772)
      else if (rawId.startsWith("STEAM_")) {
        const parts = rawId.split(":");
        if (parts.length === 3) {
          const y = BigInt(parts[1]);
          const z = BigInt(parts[2]);
          const steamId64 = (z * 2n) + y + steam64Base;
          return `https://steamcommunity.com/profiles/${steamId64.toString()}`;
        }
      }
    } catch (e) {
      console.error("Eroare la calcularea SteamID64:", e);
    }
    
    // Fallback: Dacă ceva nu merge, caută-l după nume
    return `https://steamcommunity.com/search/users/#text=${player.name}`;
  };

  const steamLink = getSteamProfileUrl();

  // Funcție pentru puncte la numere (ex: 25.678)
  const formatNumber = (num) => num ? Number(num).toLocaleString('de-DE') : '0';

  // Funcție Roluri (Discord Style)
  const getRoles = () => {
    let roles = [];
    if (player.admin && player.admin !== "0" && player.admin !== "") {
        roles.push({ name: "ADMIN", style: "bg-primary-dim/10 text-primary-dim border-primary-dim/30" });
    }
    if (player.vip && player.vip > 0) {
        roles.push({ name: "VIP", style: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" });
    }
    if (roles.length === 0) {
        roles.push({ name: "PLAYER", style: "bg-white/5 text-gray-400 border-white/10" });
    }
    return roles;
  };

  // Cele 3 Jump-uri principale
  const mainJumps = [
    { label: "Long Jump", dist: currentStats.longjump },
    { label: "Count Jump", dist: currentStats.countjump },
    { label: "Bhop", dist: currentStats.bhop }
  ];

  // Toate Jump-urile pentru Modal
  const getAllJumps = (stats) => [
    { label: "Long Jump", dist: stats.longjump, str: stats.ljStrafes, sync: stats.ljSync },
    { label: "Count Jump", dist: stats.countjump, str: stats.cjStrafes, sync: stats.cjSync },
    { label: "Bhop", dist: stats.bhop, str: stats.bjStrafes, sync: stats.bjSync },
    { label: "Multi Bhop", dist: stats.mbjRecord, str: stats.mbjStrafes, sync: stats.mbjSync },
    { label: "Weird Jump", dist: stats.wjRecord, str: stats.wjStrafes, sync: stats.wjSync },
    { label: "Ladder Jump", dist: stats.lajRecord, str: stats.lajStrafes, sync: stats.lajSync },
    { label: "Drop Standup", dist: stats.dsbjRecord, str: stats.dsbjStrafes, sync: stats.dsbjSync },
    { label: "Ladder Bhop", dist: stats.lbrRecord, str: stats.lbrStrafes, sync: stats.lbrSync },
  ];

  const renderModalStat = (j) => {
    if (!j.dist || parseFloat(j.dist) <= 0) return null;
    return (
      <div key={j.label} className="flex justify-between items-end border-b border-white/5 pb-2 hover:bg-white/[0.02] transition-colors p-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{j.label}</span>
        <div className="text-right">
          <div className="font-headline font-black text-lg text-white leading-none">{parseFloat(j.dist).toFixed(2)}</div>
          <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest">
            {j.str || 0} Str <span className="text-primary-dim mx-1">//</span> {parseFloat(j.sync || 0).toFixed(0)}% Sync
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <Link to="/leaderboard" className="inline-flex items-center text-gray-500 hover:text-primary-dim font-headline uppercase tracking-widest text-sm transition-colors mb-4 border border-outline-variant/30 px-4 py-2 bg-surface-container-high hover:bg-white/5">
         &larr; Return to Rankings
      </Link>

      {/* HEADER: AVATAR COLORAT PERMANENT & SERVER RANK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-outline-variant/20 pb-8">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative w-48 h-48 bg-surface-container-highest overflow-hidden border-2 border-primary-dim/20 shadow-[0_0_15px_rgba(233,0,54,0.15)]">
             {/* Fără filtru grayscale, direct poza originală */}
             <img src={player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundType=gradientLinear&backgroundColor=0e0e0e,ff003c`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <span className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">{player.name}</span>
            <div className="flex flex-col gap-2 mt-2">
              <span className="font-headline text-primary-dim tracking-[0.4em] text-sm md:text-base font-bold uppercase">
                 Server Rank: #{player.serverRank || 'Unranked'}
              </span>
              
              {/* ROLURILE DISCORD */}
              <div className="flex justify-center md:justify-start gap-2">
                  {getRoles().map(role => (
                      <span key={role.name} className={`text-[10px] px-2 py-0.5 border font-bold tracking-widest ${role.style}`}>
                          {role.name}
                      </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <a href={steamLink} target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-primary-dim text-white font-headline font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(233,0,54,0.4)]">
            <span className="relative z-10 flex items-center space-x-3">
              <FaSteam className="text-xl" />
              <span>VIEW STEAM PROFILE</span>
            </span>
          </a>
        </div>
      </section>

      {/* GRIDUL PRINCIPAL */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        
        {/* 1. SERVICE RECORD (FOND MĂRIT ȘI RE-ARANJAT PE 2 RÂNDURI) */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Service Record</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            {/* Rândul 1: Orele (Mărite) */}
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Time</p>
              <p className="font-headline text-4xl font-bold text-white">{(player.time / 3600).toFixed(1)} <span className="text-sm text-gray-500">HRS</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Last 7 Days</p>
              <p className="font-headline text-4xl font-bold text-primary-dim">{(player.weektime / 3600).toFixed(1)} <span className="text-sm text-gray-500">HRS</span></p>
            </div>
            {/* Rândul 2: Ownages & Wreckers */}
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Ownages</p>
              <p className="font-headline text-3xl font-bold text-white">{formatNumber(player.ownages)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Wreckers</p>
              <p className="font-headline text-3xl font-bold text-white">{formatNumber(player.wreckers)}</p>
            </div>
          </div>
        </div>

        {/* 2. PERSONAL BESTS (MAI COMPACT, BUTON SEE ALL SUS) */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/10 pb-4 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
                <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Personal Bests</h3>
                {/* BUTONUL SEE ALL (MUTAT AICI) */}
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="text-[9px] font-bold text-primary-dim hover:text-white transition-colors uppercase tracking-[0.2em] italic flex items-center gap-1 group"
                >
                  SEE ALL RECORDS <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
            </div>
            <div className="flex bg-background border border-outline-variant/20 p-1">
              <button onClick={() => setJumpMode("PRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "PRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>PRE</button>
              <button onClick={() => setJumpMode("NOPRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "NOPRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>NOPRE</button>
            </div>
          </div>

          <div className="space-y-4">
            {mainJumps.map(j => (
              <div key={j.label} className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{j.label}</span>
                <span className="font-headline font-bold text-lg text-white tracking-tighter">
                  {parseFloat(j.dist || 0).toFixed(2)} <span className="text-[10px] text-gray-600 uppercase ml-1">Units</span>
                </span>
              </div>
            ))}
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
              <p className="font-headline text-4xl font-bold text-white">{formatNumber(player.kills)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Deaths</p>
              <p className="font-headline text-4xl font-bold text-gray-600">{formatNumber(player.deaths)}</p>
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
                <span className="font-headline font-bold text-xl text-white">{formatNumber(player.jumps)}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20">
                <div className="h-full bg-primary-dim w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Ducks</span>
                <span className="font-headline font-bold text-xl text-white">{formatNumber(player.ducks)}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20">
                <div className="h-full bg-gray-500 w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* --- MODALUL DUAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-surface-container-highest border border-white/10 w-full max-w-5xl p-8 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
              <div>
                 <h2 className="font-headline text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">Complete Jump Database</h2>
                 <p className="text-[10px] text-primary-dim uppercase tracking-[0.2em] mt-2">Name: {player.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  
                  {/* COLOANA PRE */}
                  <div className="bg-surface-container-low/30 border border-white/5 p-4">
                      <div className="text-center mb-4 pb-2 border-b border-primary-dim/30">
                          <span className="text-[11px] font-bold text-white uppercase tracking-[0.3em] bg-primary-dim/20 px-3 py-1 text-primary-dim">PRE Mode Records</span>
                      </div>
                      <div className="space-y-1">
                          {getAllJumps(preStats).map(j => renderModalStat(j))}
                          {getAllJumps(preStats).every(j => !j.dist || j.dist <= 0) && <p className="text-center text-gray-600 text-[10px] py-4 uppercase tracking-widest">No PRE records found.</p>}
                      </div>
                  </div>

                  {/* COLOANA NOPRE */}
                  <div className="bg-surface-container-low/30 border border-white/5 p-4">
                      <div className="text-center mb-4 pb-2 border-b border-gray-500/30">
                          <span className="text-[11px] font-bold text-white uppercase tracking-[0.3em] bg-white/5 px-3 py-1 text-gray-400">NOPRE Mode Records</span>
                      </div>
                      <div className="space-y-1">
                          {getAllJumps(noPreStats).map(j => renderModalStat(j))}
                          {getAllJumps(noPreStats).every(j => !j.dist || j.dist <= 0) && <p className="text-center text-gray-600 text-[10px] py-4 uppercase tracking-widest">No NOPRE records found.</p>}
                      </div>
                  </div>

                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
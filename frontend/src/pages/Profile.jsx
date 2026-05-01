import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSteam } from 'react-icons/fa';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jumpMode, setJumpMode] = useState("PRE");
  const [mixRank, setMixRank] = useState("UNRANKED");
  const [cheaterInfo, setCheaterInfo] = useState(null);

  useEffect(() => {
    if (!id || id === "undefined") {
      setLoading(false);
      return;
    }

    const fetchProfileData = () => {
      Promise.all([
          fetch(`/api/players/${id}`).then(res => {
            if (!res.ok) throw new Error("Jucătorul nu a fost găsit în baza de date.");
            return res.json();
          }),
          fetch(`/api/players/${id}/rank/mix`).then(res => res.ok ? res.text() : "0").catch(() => "0"),
          fetch('/api/cheaters').then(res => res.ok ? res.json() : []).catch(() => [])
        ])
          .then(([playerData, mixRankData, cheatersData]) => {
            if (playerData.error || !playerData.name) throw new Error("Date invalide primite de la server.");
            
            setPlayer(playerData);
  
            const games = playerData.mixgames || playerData.mixGames || 0;
            const parsedRank = parseInt(mixRankData);
            if (games > 0 && parsedRank > 0) {
              setMixRank(`#${parsedRank}`);
            } else {
              setMixRank("UNRANKED");
            }

           const getCoreId = (id) => {
                const strId = String(id || ""); 
                return strId.includes(":") ? strId.split(":").slice(1).join(":") : strId;
            };

            const playerCoreId = getCoreId(playerData.steamid || playerData.steamId);
            
            const foundCheater = cheatersData.find(c => {
                const cheaterCoreId = getCoreId(c.steamid || c.steamId);
                return cheaterCoreId !== "" && cheaterCoreId === playerCoreId;
            });

            if (foundCheater) {
                setCheaterInfo(foundCheater);
            }
  
            setLoading(false);
          })
        .catch(err => {
          console.error("Eroare la încărcarea profilului:", err);
          setLoading(false);
        });
    };

    fetchProfileData();
    const interval = setInterval(fetchProfileData, 30000);
    return () => clearInterval(interval);

  }, [id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-headline text-primary-dim text-2xl animate-pulse tracking-widest uppercase">Establishing secure connection...</div>;
  if (!player) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-500 font-headline text-2xl tracking-widest uppercase">Operator Identity Not Found in Database.</div>;
 
  const preStats = player.jumpStatsPre || {};
  const noPreStats = player.jumpStatsNoPre || {};
  const currentStats = jumpMode === "PRE" ? preStats : noPreStats;

  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);
  const hasMixStats = (player.mixgames || player.mixGames || 0) > 0; // Verificare stats mix[cite: 3]

  const getSteamProfileUrl = () => {
    const rawId = player.steamid || player.steamId;
    if (!rawId) return `https://steamcommunity.com/search/users/#text=${player.name}`;
    try {
      const steam64Base = 76561197960265728n; 
      if (/^\d+$/.test(rawId)) {
        const steamId64 = BigInt(rawId) + steam64Base;
        return `https://steamcommunity.com/profiles/${steamId64.toString()}`;
      } else if (rawId.startsWith("STEAM_")) {
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
    return `https://steamcommunity.com/search/users/#text=${player.name}`;
  };

  const steamLink = getSteamProfileUrl();
  const formatNumber = (num) => num ? Number(num).toLocaleString('de-DE') : '0';

  const renderTime = (totalSeconds, unitColorClass = "text-white") => {
    if (!totalSeconds || isNaN(totalSeconds)) {
        return <>0<span className={`text-sm font-normal ${unitColorClass} lowercase ml-1.5 tracking-wider`}>min</span></>;
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    if (h === 0) {
        return <>{m}<span className={`text-sm font-normal ${unitColorClass} lowercase ml-1.5 tracking-wider`}>min</span></>;
    }
    return (
      <>{h}<span className={`text-sm font-normal ${unitColorClass} lowercase mx-1`}>h</span> 
        {m}<span className={`text-sm font-normal ${unitColorClass} lowercase ml-1`}>m</span></>
    );
  };

  const getRoles = () => {
    const roleStr = (player.role || player.status || player.admin || "").toString().toLowerCase();
    const vipValue = parseInt(player.vip) || 0;
    let roles = [];

    if (cheaterInfo && cheaterInfo.banned !== 0) {
        roles.push({ name: "BANNED", style: "bg-red-900/40 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)] animate-pulse" });
    }

    if (roleStr.includes('developer') || roleStr.includes('dev')) {
        roles.push({ name: "DEVELOPER", style: "bg-red-500/10 text-red-500 border-red-500/30" });
    } else if (roleStr.includes('head admin')) {
        roles.push({ name: "HEAD ADMIN", style: "bg-orange-500/10 text-orange-400 border-orange-500/30" });
    } else if (roleStr.includes('admin') || roleStr === "1") {
        roles.push({ name: "ADMIN", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" });
    }

    if (vipValue === 2) {
        roles.push({ name: "VIP LIFETIME", style: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" });
    } else if (vipValue > 2) {
        const expiryDate = new Date(vipValue * 1000);
        const dateString = expiryDate.toLocaleDateString('ro-RO');
        roles.push({ name: `VIP UNTIL: ${dateString}`, style: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" });
    }
    return roles;
  };

  const mainJumps = [
    { label: "Long Jump", dist: currentStats.longjump },
    { label: "Count Jump", dist: currentStats.countjump },
    { label: "Bhop", dist: currentStats.bhop }
  ];

  const getAllJumps = (stats) => [
    { label: "Long Jump", dist: stats.longjump, max: stats.ljMax, height: stats.ljHeight, pre: stats.ljPre, str: stats.ljStrafes, sync: stats.ljSync },
    { label: "Count Jump", dist: stats.countjump, max: stats.cjMax, height: stats.cjHeight, pre: stats.cjPre, str: stats.cjStrafes, sync: stats.cjSync },
    { label: "Bhop", dist: stats.bhop, max: stats.bjMax, height: stats.bjHeight, pre: stats.bjPre, str: stats.bjStrafes, sync: stats.bjSync },
    { label: "Multi Bhop", dist: stats.mbjRecord, max: stats.mbjMax, height: stats.mbjHeight, pre: stats.mbjPre, str: stats.mbjStrafes, sync: stats.mbjSync },
    { label: "Weird Jump", dist: stats.wjRecord, max: stats.wjMax, height: stats.wjHeight, pre: stats.wjPre, str: stats.wjStrafes, sync: stats.wjSync },
    { label: "Ladder Jump", dist: stats.lajRecord, max: stats.lajMax, height: stats.lajHeight, pre: stats.lajPre, str: stats.lajStrafes, sync: stats.lajSync },
    { label: "Drop Standup", dist: stats.dsbjRecord, max: stats.dsbjMax, height: stats.dsbjHeight, pre: stats.dsbjPre, str: stats.dsbjStrafes, sync: stats.dsbjSync },
    { label: "Ladder Bhop", dist: stats.lbrRecord, max: stats.lbrMax, height: stats.lbrHeight, pre: stats.lbrPre, str: stats.lbrStrafes, sync: stats.lbrSync },
  ];

  const renderModalStat = (j) => {
    if (!j.dist || parseFloat(j.dist) <= 0) return null;
    return (
      <div key={j.label} className="flex flex-col border border-white/5 rounded-lg mb-3 bg-black/20 hover:bg-white/[0.03] transition-colors p-3.5 gap-3 shadow-inner">
        <div className="flex justify-between items-end border-b border-white/5 pb-2">
          <span className="text-sm font-bold text-gray-300 uppercase tracking-widest drop-shadow-sm">{j.label}</span>
          <span className="font-headline font-black text-2xl text-white leading-none drop-shadow-md">{parseFloat(j.dist).toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-5 text-center divide-x divide-white/10 text-xs font-bold uppercase tracking-widest text-gray-300">
          <div className="flex flex-col gap-1 px-1"><span className="text-[9px] text-gray-500">Max</span><span className="text-white">{parseFloat(j.max || 0).toFixed(0)}</span></div>
          <div className="flex flex-col gap-1 px-1"><span className="text-[9px] text-gray-500">Height</span><span className="text-white">{parseFloat(j.height || 0).toFixed(2)}</span></div>
          <div className="flex flex-col gap-1 px-1"><span className="text-[9px] text-gray-500">Pre</span><span className="text-white">{parseFloat(j.pre || 0).toFixed(2)}</span></div>
          <div className="flex flex-col gap-1 px-1"><span className="text-[9px] text-gray-500">Strafes</span><span className="text-white">{j.str || 0}</span></div>
          <div className="flex flex-col gap-1 px-1"><span className="text-[9px] text-primary-dim">Sync</span><span className="text-primary-dim">{parseFloat(j.sync || 0).toFixed(0)}%</span></div>
        </div>
      </div>
    );
  };

  const getBanStatus = (bannedVal) => {
    if (bannedVal === 0) return { text: "UNBANNED", color: "text-gray-400" };
    if (bannedVal === 1 || bannedVal === 2) return { text: "PERMANENT", color: "text-red-500" };
    if (bannedVal > 2) {
      const date = new Date(bannedVal * 1000);
      return { text: `UNTIL ${date.toLocaleDateString('de-DE')}`, color: "text-yellow-500" };
    }
    return { text: "UNKNOWN", color: "text-gray-500" };
  };

  return (
    <div className="min-h-screen w-full custom-scrollbar pb-20">      
      <div className="relative pt-32 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-500 hover:text-primary-dim font-headline uppercase tracking-widest text-sm transition-colors mb-4 border border-outline-variant/30 px-4 py-2 bg-surface-container-high hover:bg-white/5 cursor-pointer">
          &larr; Go Back
        </button>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-outline-variant/20 pb-8">
          <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative w-48 h-48 bg-surface-container-highest overflow-hidden border-2 border-primary-dim/20 shadow-[0_0_15px_rgba(233,0,54,0.15)] shrink-0">
               <img src={player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundType=gradientLinear&backgroundColor=0e0e0e,ff003c`} alt="Avatar" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <span title={player.name} className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none break-all max-w-full">{player.name}</span>
                 <div className="group relative inline-flex items-center justify-center">
                   <span className="flex items-center justify-center w-5 h-5 rounded-full border border-outline-variant/40 bg-white/5 text-gray-400 hover:text-white transition-all text-[10px] font-bold shadow-sm cursor-default">!</span>
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-surface-container-highest border border-outline-variant/30 px-5 py-2.5 rounded shadow-xl z-50 w-max max-w-[300px] text-center pointer-events-none">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 border-b border-white/5 pb-1">First name</p>
                      <p className="font-headline text-sm text-white pt-1">{player.firstname || player.name}</p>
                   </div>
                 </div>
                 {player.country && player.country.toLowerCase() !== 'un' && (
                    <img src={`/countryflags/${player.country.toLowerCase()}.gif`} alt={player.country} loading="lazy" className="w-8 h-auto rounded-[2px] shadow-sm mb-1 opacity-90 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                 )}
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-headline text-primary-dim tracking-[0.2em] text-sm md:text-base font-bold uppercase">Server Rank: #{player.serverRank || 'Unranked'}</span>
                <span className="font-headline text-gray-400 tracking-[0.2em] text-xs font-bold uppercase mb-2">Mix elo: <span className="text-white">{player.mixelo || player.mixElo || 0}</span> <span className="text-primary-dim">({mixRank})</span></span>
                <div className="flex justify-center md:justify-start gap-2 text-left">
                    {getRoles().map(role => <span key={role.name} className={`text-[10px] px-2 py-0.5 border font-bold tracking-widest ${role.style}`}>{role.name}</span>)}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-center lg:justify-end items-center lg:items-end">
            <a href={steamLink} target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-primary-dim text-white font-headline font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(233,0,54,0.4)] w-full lg:w-auto text-center mt-4 lg:mt-0">
              <span className="relative z-10 flex items-center justify-center space-x-3"><FaSteam className="text-xl" /><span>VIEW STEAM PROFILE</span></span>
            </a>
          </div>
        </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        
        {/* --- BANNED BAR --- */}
        {cheaterInfo && (
          <div className={`col-span-full ${cheaterInfo.banned === 0 ? 'bg-surface-container-low border-gray-600/30' : 'bg-[#120505] border-red-900/50'} border rounded-sm p-3 md:px-6 md:py-2.5 shadow-sm`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
               <div className="flex flex-wrap items-center gap-x-8 gap-y-2 py-1">
                 <div className="flex items-center gap-3">
                   {cheaterInfo.banned !== 0 ? (
                     <span className="flex h-2.5 w-2.5 relative shrink-0">
                       <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50 blur-[2px] animate-pulse"></span>
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse"></span>
                     </span>
                   ) : <span className="flex h-2.5 w-2.5 relative shrink-0"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-600"></span></span>}
                   <span className={`font-headline text-lg md:text-xl font-bold uppercase tracking-widest leading-none ${cheaterInfo.banned === 0 ? 'text-gray-400' : 'text-red-500 animate-pulse'}`}>
                     {getBanStatus(cheaterInfo.banned).text === "UNBANNED" ? "STATUS: UNBANNED" : getBanStatus(cheaterInfo.banned).text === "PERMANENT" ? "BANNED PERMANENTLY" : `BANNED ${getBanStatus(cheaterInfo.banned).text}`}
                   </span>
                 </div>
                 <div className="flex flex-col border-l border-white/10 pl-5">
                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">last Detection</span>
                    <span className="text-[11px] text-white font-bold tracking-wider">{cheaterInfo.date || 'N/A'}</span>
                 </div>
               </div>
               <div className="flex flex-col gap-1 w-full lg:w-auto items-end py-1">
                 {(() => {
                   let reasons = [];
                   if (cheaterInfo.bhophack > 0) reasons.push({ name: 'Bhop Script', count: cheaterInfo.bhophack });
                   if (cheaterInfo.gstrafehack > 0) reasons.push({ name: 'G-Strafe Hack', count: cheaterInfo.gstrafehack });
                   if (cheaterInfo.strafehack > 0) reasons.push({ name: 'Strafe Optimizer', count: cheaterInfo.strafehack });
                   if (cheaterInfo.dll > 0) reasons.push({ name: 'DLL Inject', count: cheaterInfo.dll });
                   if (reasons.length === 0) return <span className={`font-headline text-sm uppercase tracking-wider ${cheaterInfo.banned === 0 ? 'text-gray-400' : 'text-red-400'}`}>Manual / Admin</span>;
                   return reasons.map(r => (
                      <div key={r.name} className="grid grid-cols-[1fr_40px] gap-x-4 items-center w-full lg:w-auto">
                         <span className={`font-headline text-sm uppercase tracking-wider text-right ${cheaterInfo.banned === 0 ? 'text-gray-400' : 'text-red-400'}`}>{r.name}</span>
                         <span className={`text-[11px] font-black tracking-widest text-left ${cheaterInfo.banned === 0 ? 'text-gray-500' : 'text-red-500'}`}>{r.count}x</span>
                      </div>
                   ));
                 })()}
               </div>
            </div>
          </div>
        )}

        {/* --- MIX STATS (BLURRED IF NO DATA) --- */}
        <div className="col-span-full relative bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-2 overflow-hidden">
          
          {/* Lock Overlay[cite: 3] */}
          {!hasMixStats && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[6px]">
               <svg className="w-12 h-12 text-gray-500 mb-2 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
               </svg>
               <span className="font-headline text-xs font-bold text-gray-400 uppercase tracking-[0.3em] drop-shadow-md">No Mix Data Registered</span>
            </div>
          )}

          <div className={`p-8 transition-all duration-500 ${!hasMixStats ? 'blur-md opacity-30 select-none' : ''}`}>
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-6">
              <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary-dim">Mix Competitive Stats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 text-center items-center">
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Mix Games</p><p className="font-headline text-3xl font-bold text-white">{formatNumber(player.mixgames || player.mixGames)}</p></div>
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Mix Won</p><p className="font-headline text-3xl font-bold text-emerald-400">{formatNumber(player.mixwon || player.mixWon)}</p></div>
              <div className="space-y-1 flex flex-col justify-center"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Time Alive</p><p className="font-headline text-3xl font-bold text-white flex justify-center items-baseline">{renderTime(player.mixtotaltime || player.mixTotalTime, "text-white")}</p></div>
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Stabs</p><p className="font-headline text-3xl font-bold text-white">{formatNumber(player.mixtotalstabs || player.mixTotalStabs)}</p></div>
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Disconnects</p><p className="font-headline text-3xl font-bold text-red-500">{formatNumber(player.mixdisconnects || player.mixDisconnects)}</p></div>
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Fall Damage</p><p className="font-headline text-3xl font-bold text-gray-400">{formatNumber(player.mixtotalfalldmg || player.mixTotalFallDmg)}</p></div>
              <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Mix Elo</p><p className="font-headline text-3xl font-bold text-primary-dim">{formatNumber(player.mixelo || player.mixElo)}</p></div>
            </div>
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4"><h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Stats</h3></div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="space-y-1 flex flex-col"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Time</p><p className="font-headline text-4xl font-bold text-white flex items-baseline">{renderTime(player.time, "text-white")}</p></div>
            <div className="space-y-1 flex flex-col"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Last 7 Days</p><p className="font-headline text-4xl font-bold text-primary-dim flex items-baseline">{renderTime(player.weektime, "text-primary-dim")}</p></div>
            <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Ownages</p><p className="font-headline text-3xl font-bold text-white">{formatNumber(player.ownages)}</p></div>
            <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Wreckers</p><p className="font-headline text-3xl font-bold text-white">{formatNumber(player.wreckers)}</p></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/10 pb-4 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
                <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Personal Bests</h3>
                <button onClick={() => setIsModalOpen(true)} className="text-[9px] font-bold text-primary-dim hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-1 group">SEE ALL RECORDS <span className="group-hover:translate-x-1 transition-transform">&rarr;</span></button>
            </div>
            <div className="flex bg-background border border-outline-variant/20 p-1">
              <button onClick={() => setJumpMode("PRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "PRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>PRE</button>
              <button onClick={() => setJumpMode("NOPRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "NOPRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>NOPRE</button>
            </div>
          </div>
          <div className="space-y-4">
            {mainJumps.map(j => <div key={j.label} className="flex justify-between items-end border-b border-outline-variant/10 pb-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{j.label}</span><span className="font-headline font-bold text-lg text-white tracking-tighter">{parseFloat(j.dist || 0).toFixed(2)} <span className="text-[10px] text-gray-600 uppercase ml-1">Units</span></span></div>)}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4"><h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Combat</h3></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Kills</p><p className="font-headline text-4xl font-bold text-white">{formatNumber(player.kills)}</p></div>
            <div className="space-y-1"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Deaths</p><p className="font-headline text-4xl font-bold text-gray-600">{formatNumber(player.deaths)}</p></div>
            <div className="space-y-1"><p className="text-primary-dim text-[10px] font-bold uppercase tracking-wider">K/D Ratio</p><p className="font-headline text-4xl font-bold text-primary-dim">{kdRatio}</p></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4"><h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Movement</h3></div>
          <div className="space-y-6">
            <div><div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Jumps</span><span className="font-headline font-bold text-xl text-white">{formatNumber(player.jumps)}</span></div><div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20"><div className="h-full bg-primary-dim w-[85%]"></div></div></div>
            <div><div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Ducks</span><span className="font-headline font-bold text-xl text-white">{formatNumber(player.ducks)}</span></div><div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20"><div className="h-full bg-gray-500 w-[45%]"></div></div></div>
          </div>
        </div>
      </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-surface-container-highest border border-outline-variant/20 w-full max-w-2xl p-6 md:p-8 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl animate-fade-in max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
              <div><h2 className="font-headline text-2xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">Jump Statistics</h2><p className="text-[10px] text-primary-dim font-bold uppercase tracking-[0.2em] mt-2">MODE: {jumpMode}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 rounded-md">Close</button>
            </div>
            <div className="overflow-y-auto custom-scrollbar pr-2 pb-4 flex-1">{getAllJumps(currentStats).map(j => renderModalStat(j))}</div>
          </div>
        </div>
      )}
    </div>
  );
}
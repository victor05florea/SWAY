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
  const [barAnim, setBarAnim] = useState(false);

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

  useEffect(() => {
    if (!loading && player) {
      const timer = setTimeout(() => setBarAnim(true), 300);
      return () => clearTimeout(timer);
    }
  }, [loading, player]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-headline text-primary-dim text-2xl animate-pulse tracking-widest uppercase">Loading...</div>;
  if (!player) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-500 font-headline text-2xl tracking-widest uppercase">Player not found.</div>;
 
  const preStats = player.jumpStatsPre || {};
  const noPreStats = player.jumpStatsNoPre || {};
  const currentStats = jumpMode === "PRE" ? preStats : noPreStats;

  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);
  const hasMixStats = (player.mixgames || player.mixGames || 0) > 0;
  
  const showFirstName = Boolean(
    player.firstname &&
    String(player.firstname).trim() !== "" &&
    String(player.firstname).trim().toLowerCase() !== "null" &&
    String(player.firstname).trim().toLowerCase() !== String(player.name || "").trim().toLowerCase()
  );

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
        return <>0<span className={`text-sm font-headline ${unitColorClass} lowercase ml-1.5 tracking-wider`}>min</span></>;
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    if (h === 0) {
        return <>{m}<span className={`text-sm font-headline ${unitColorClass} lowercase ml-1.5 tracking-wider`}>min</span></>;
    }
    return (
      <>{h}<span className={`text-sm font-headline ${unitColorClass} lowercase mx-1`}>h</span> 
        {m}<span className={`text-sm font-headline ${unitColorClass} lowercase ml-1`}>m</span></>
    );
  };

  const getRoles = () => {
    const roleStr = (player.role || player.status || player.admin || "").toString().toLowerCase();
    const adminValue = parseInt(player.admin, 10);
    const vipValue = parseInt(player.vip) || 0;
    let roles = [];

    if (cheaterInfo && cheaterInfo.banned !== 0) {
        roles.push({ name: "BANNED", style: "bg-red-900/40 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)] animate-pulse" });
    }

    if (roleStr.includes('developer') || roleStr.includes('dev') || adminValue >= 4) {
        roles.push({ name: "DEVELOPER", style: "bg-red-500/10 text-red-500 border-red-500/30" });
    } else if (roleStr.includes('head admin') || adminValue === 3) {
        roles.push({ name: "HEAD ADMIN", style: "bg-orange-500/10 text-orange-400 border-orange-500/30" });
    } else if (roleStr.includes('admin') || adminValue === 2) {
        roles.push({ name: "ADMIN", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" });
    } else if (roleStr.includes('helper') || adminValue === 1) {
        roles.push({ name: "HELPER", style: "bg-blue-500/10 text-blue-400 border-blue-500/30" });
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

  const getAllJumps = (stats) => [
    { abbr: "LJ", label: "Long Jump", dist: stats.longjump, max: stats.ljMax, height: stats.ljHeight, pre: stats.ljPre, str: stats.ljStrafes, sync: stats.ljSync },
    { abbr: "CJ", label: "Count Jump", dist: stats.countjump, max: stats.cjMax, height: stats.cjHeight, pre: stats.cjPre, str: stats.cjStrafes, sync: stats.cjSync },
    { abbr: "BJ", label: "Bhop", dist: stats.bhop, max: stats.bjMax, height: stats.bjHeight, pre: stats.bjPre, str: stats.bjStrafes, sync: stats.bjSync },
    { abbr: "MBJ", label: "Multi Bhop", dist: stats.mbjRecord, max: stats.mbjMax, height: stats.mbjHeight, pre: stats.mbjPre, str: stats.mbjStrafes, sync: stats.mbjSync },
    { abbr: "WJ", label: "Weird Jump", dist: stats.wjRecord, max: stats.wjMax, height: stats.wjHeight, pre: stats.wjPre, str: stats.wjStrafes, sync: stats.wjSync },
    { abbr: "LAJ", label: "Ladder Jump", dist: stats.lajRecord, max: stats.lajMax, height: stats.lajHeight, pre: stats.lajPre, str: stats.lajStrafes, sync: stats.lajSync },
    { abbr: "DBJ", label: "Drop Bhop", dist: stats.dsbjRecord, max: stats.dsbjMax, height: stats.dsbjHeight, pre: stats.dsbjPre, str: stats.dsbjStrafes, sync: stats.dsbjSync },
    { abbr: "LJB", label: "LJ Block", dist: stats.lbrRecord, max: stats.lbrMax, height: stats.lbrHeight, pre: stats.lbrPre, str: stats.lbrStrafes, sync: stats.lbrSync },
  ];

  const getJumpColor = (type, dist) => {
    const d = parseFloat(dist);
    if (!d || d === 0) return "text-white";
    let t = {};
    switch(type) {
        case "LJ": t = {pro: 270, leet: 275, ownage: 280, wrecker: 285}; break;
        case "CJ": t = {pro: 275, leet: 280, ownage: 285, wrecker: 290}; break;
        case "BJ":
        case "MBJ":
        case "DBJ":
        case "WJ": t = {pro: 280, leet: 285, ownage: 290, wrecker: 295}; break;
        case "LAJ": t = {pro: 170, leet: 175, ownage: 180, wrecker: 185}; break;
        case "LJB": t = {pro: 270, leet: 275, ownage: 280, wrecker: 285}; break;
        default: return "text-white";
    }
    if (d >= t.wrecker) return "text-[#792be0]";
    if (d >= t.ownage) return "text-yellow-500";
    if (d >= t.leet) return "text-red-600";
    if (d >= t.pro) return "text-green-500";
    return "text-gray-400"; 
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
                 
                 {showFirstName && (
                   <div className="group relative flex items-center justify-center cursor-help mt-1 md:mt-2">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 md:w-6 md:h-6 text-gray-500 hover:text-white transition-colors duration-200" fill="currentColor">
                       <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
                     </svg>
                     <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-sm shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-[999] w-max min-w-[120px] text-center">
                        <p className="font-headline text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 border-b border-white/10 pb-1">Real Name</p>
                        <p className="font-headline text-sm text-white drop-shadow-md">{player.firstname}</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white/10"></div>
                     </div>
                   </div>
                 )}

                 {player.country && player.country.toLowerCase() !== 'un' && (
                    <img src={`/countryflags/${player.country.toLowerCase()}.gif`} alt={player.country} loading="lazy" className="w-8 h-auto rounded-[2px] shadow-sm mb-1 opacity-90 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                 )}
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-headline text-primary-dim tracking-[0.2em] text-sm md:text-base font-bold uppercase">Server Rank: #{player.serverRank || 'Unranked'}</span>
                {hasMixStats && (
                  <span className="font-headline text-gray-400 tracking-[0.2em] text-xs font-bold uppercase mb-2">
                    Mix elo: <span className="text-yellow-500">{player.mixelo || player.mixElo || 0}</span> <span className="text-yellow-500">({mixRank})</span>
                  </span>
                )}
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

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 mt-8 items-stretch">
        
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
                    <span className="font-headline text-[11px] text-white font-bold tracking-wider">{cheaterInfo.date || 'N/A'}</span>
                 </div>
               </div>
               <div className="flex flex-col gap-1 w-full lg:w-auto items-end py-1">
                 {(() => {
                   let reasons = [];
                   if (cheaterInfo.bhophack > 0) reasons.push({ name: 'BhopHack', count: cheaterInfo.bhophack });
                   if (cheaterInfo.gstrafehack > 0) reasons.push({ name: 'GStrafeHack', count: cheaterInfo.gstrafehack });
                   if (cheaterInfo.strafehack > 0) reasons.push({ name: 'StrafeHack', count: cheaterInfo.strafehack });
                   if (cheaterInfo.dll > 0) reasons.push({ name: 'DLL Injection', count: cheaterInfo.dll });
                   if (reasons.length === 0) return <span className={`font-headline text-sm uppercase tracking-wider ${cheaterInfo.banned === 0 ? 'text-gray-400' : 'text-red-400'}`}>Manual / Admin</span>;
                   return reasons.map(r => (
                      <div key={r.name} className="grid grid-cols-[1fr_40px] gap-x-4 items-center w-full lg:w-auto">
                         <span className={`font-headline text-sm uppercase tracking-wider text-right ${cheaterInfo.banned === 0 ? 'text-gray-400' : 'text-red-400'}`}>{r.name}</span>
                         <span className={`font-headline text-[11px] font-black tracking-widest text-left ${cheaterInfo.banned === 0 ? 'text-gray-500' : 'text-red-500'}`}>{r.count}x</span>
                      </div>
                   ));
                 })()}
               </div>
            </div>
          </div>
        )}

        <div className="col-span-full relative bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-2 overflow-hidden">
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
            
            {/* Cele 6 elemente distribuite pe toata latimea div-ului */}
            <div className="flex flex-wrap lg:flex-nowrap justify-between w-full items-center gap-6 lg:gap-2 text-center">
              <div className="flex-1 space-y-1">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 shrink-0" fill="currentColor"><path d="M380.95 114.46c-62.946-13.147-63.32 32.04-124.868 32.04-53.25 0-55.247-44.675-124.87-32.04C17.207 135.072-.32 385.9 60.16 399.045c33.578 7.295 50.495-31.644 94.89-59.593a51.562 51.562 0 0 0 79.77-25.78 243.665 243.665 0 0 1 21.24-.91c7.466 0 14.44.32 21.126.898a51.573 51.573 0 0 0 79.82 25.717c44.45 27.95 61.367 66.93 94.955 59.626 60.47-13.104 42.496-260.845-71.01-284.543zM147.47 242.703h-26.144V216.12H94.73v-26.143h26.594v-26.593h26.144v26.582h26.582v26.144h-26.582v26.582zm38.223 89.615a34.336 34.336 0 1 1 34.337-34.336 34.336 34.336 0 0 1-34.325 34.346zm140.602 0a34.336 34.336 0 1 1 34.367-34.325 34.336 34.336 0 0 1-34.368 34.335zM349.98 220.36a17.323 17.323 0 1 1 17.32-17.32 17.323 17.323 0 0 1-17.323 17.323zm37.518 37.52a17.323 17.323 0 1 1 17.322-17.324 17.323 17.323 0 0 1-17.365 17.334zm0-75.048a17.323 17.323 0 1 1 17.322-17.323 17.323 17.323 0 0 1-17.365 17.333zm37.518 37.518a17.323 17.323 0 1 1 17.323-17.323 17.323 17.323 0 0 1-17.367 17.334z"/></svg>
                  Mix Games
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-white tabular-nums">{formatNumber(player.mixgames || player.mixGames)}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 481.882 481.882" className="w-6 h-6 shrink-0" fill="currentColor"><path d="M329.256,209.796c38.917-12.802,110.205-64.102,110.205-132.358c0-33.41-28.561-60.504-62.347-57.796c0.081-2.285,0.202-4.551,0.236-6.842c0-3.388-1.28-6.626-3.689-9.035C371.252,1.279,368.014,0,364.626,0H117.285c-3.388,0-6.626,1.279-9.035,3.765c-2.409,2.409-3.689,5.647-3.689,9.035c0.033,2.259,0.089,4.532,0.158,6.843c-33.776-2.665-62.297,24.4-62.297,57.795c0,68.272,71.322,119.581,110.233,132.366c14.62,24.177,31.308,41.664,49.562,51.918c-1.431,5.421-1.656,10.315-1.656,10.39c0,0.226,0.828,13.252,6.776,19.728v18.748c-17.035,4.695-28.402,12.643-32.331,22.287h-22.634c-4.216,0-7.529,3.388-7.529,7.529v106.09h-5.497c-4.216,0-7.529,3.387-7.529,7.529v20.329c0,4.142,3.313,7.529,7.529,7.529h203.219c4.141,0,7.529-3.387,7.529-7.529v-20.329c0-4.142-3.388-7.529-7.529-7.529h-5.496v-106.09c0-4.142-3.388-7.529-7.529-7.529h-22.701c-3.909-9.644-15.229-17.592-32.264-22.287v-18.598c5.873-6.4,6.776-19.652,6.776-19.878c0-0.075-0.301-4.969-1.656-10.315C297.95,251.469,314.571,233.976,329.256,209.796z M57.48,77.438c0-23.713,19.294-43.007,43.007-43.007c1.611,0,3.259,0.113,4.927,0.318c0.143,2.597,0.255,5.195,0.425,7.791c3.646,55.075,15.929,105.474,35.264,145.899C107.019,170.932,57.48,129.943,57.48,77.438z M376.07,42.54c0.167-2.548,0.327-5.131,0.468-7.796c1.644-0.2,3.269-0.314,4.857-0.314c23.713,0,43.007,19.294,43.007,43.007c0,52.487-49.504,93.466-83.589,110.985C360.142,148.002,372.35,97.608,376.07,42.54z M299.417,370.548v53.375H182.465v-53.375H299.417z M273.63,223.114l-8.735-12.265c9.988-7.118,19.982-18.882,28.901-34.029c2.595-4.411,5.051-9,7.297-13.618c16.139-33.199,26.757-77.169,29.901-123.823c0.143-2.213,0.279-4.441,0.404-6.794l15.037,0.779c-0.125,2.426-0.269,4.713-0.416,7.007c-3.272,48.559-14.416,94.515-31.383,129.412c-2.415,4.971-5.062,9.912-7.86,14.677C296.789,201.416,285.329,214.783,273.63,223.114z"/></svg>
                  Mix Won
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-green-500 tabular-nums">{formatNumber(player.mixwon || player.mixWon)}</p>
              </div>
              <div className="flex-1 space-y-1 flex flex-col justify-center">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 shrink-0" fill="currentColor"><path d="M372.48 31.215c-77.65 0-116.48 65.73-116.48 65.73s-38.83-65.72-116.48-65.72c-37.14 0-107.77 33.72-107.77 125.13 0 161.24 224.25 324.43 224.25 324.43s224.25-163.19 224.25-324.43c0-91.42-70.63-125.13-107.77-125.14zM160 129h192v18H160v-18zm23 31h18v176h-18V160zm33 0h80s-8 80-40 80-40-80-40-80zm95 0h18v176h-18V160zm-55 96c32 0 40 80 40 80h-80s8-80 40-80zm-96 93h192v18H160v-18z"/></svg>
                  Time Alive
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-white flex justify-center items-baseline tabular-nums">{renderTime(player.mixtotaltime || player.mixTotalTime, "text-white")}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 57.589 57.589" className="w-6 h-6 shrink-0" fill="currentColor"><circle cx="14.743" cy="7.173" r="4.375"/><path d="M27.007,26.171c2.925,0.243,3.82-4.268,0.874-4.514c-4.583-0.382-8.752-1.636-10.061-5.859c-0.037-0.119-0.087-0.219-0.136-0.322c-0.465-2.581-2.771-3.485-4.896-3.053c-0.097-0.023-0.19-0.051-0.294-0.063c-5.421-0.623-10.147,2.135-12.287,7.152c-1.148,2.694,2.81,5.038,3.969,2.319c1.064-2.494,2.655-4.044,4.8-4.653c0.003,0.052,0.001,0.102,0.006,0.154c0,0-2.022,7.993-2.939,12.867c-0.461,0.735-0.61,1.364-0.538,1.905L0.397,51.3c-1.208,3.148,3.67,5.013,4.874,1.871L9.67,36.544c2.619,1.072,5.04,2.527,6.149,5.277c1.1,2.727-0.64,6.207-1.979,8.489c-1.689,2.879,2.535,5.948,4.24,3.045c2.329-3.972,4.146-8.56,2.662-13.163c-1.114-3.451-3.788-5.79-6.868-7.434l2.493-10.804C19.019,24.494,22.923,25.83,27.007,26.171z"/><path d="M57.427,31.395c-1.733-6.634-5.365-12.496-10.436-17.101c-1.777-1.615-3.821-1.332-5.266-0.188c-4.646-0.862-9.287-1.725-13.935-2.587c-3.253-0.604-4.19,4.439-0.937,5.044c4.403,0.817,8.802,1.635,13.206,2.452c0.215,0.673,0.621,1.325,1.265,1.909c3.188,2.897,5.433,6.381,6.903,10.309c-7.911,1.237-14.996,5.418-19.588,12.371c-1.801,2.728,2.065,6.108,3.881,3.354c3.307-5.007,7.803-8.238,13.033-9.834c-1.521,1.387-2.972,2.854-4.416,4.275c-2.365,2.328,1.543,5.658,3.883,3.354c2.906-2.858,5.771-5.854,9.395-7.814c0.016-0.008,0.027-0.02,0.041-0.023C56.473,36.149,58.125,34.068,57.427,31.395z"/><circle cx="41.304" cy="8.305" r="4.105"/></svg>
                  Total Stabs
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-white tabular-nums">{formatNumber(player.mixtotalstabs || player.mixTotalStabs)}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-6 h-6 shrink-0" fill="currentColor"><path d="M12,6a6.21,6.21,0,0,0-6.21,5H2v2H5.83A6.23,6.23,0,0,0,12,18H17V6Z"/><path d="M33.79,23H30.14a6.25,6.25,0,0,0-6.21-5H19v2H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v4H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v2h4.94a6.23,6.23,0,0,0,6.22-5h3.64Z"/></svg>
                  Disconnects
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-red-500 tabular-nums">{formatNumber(player.mixdisconnects || player.mixDisconnects)}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-headline text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="currentColor"><path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM6.496 12.928l6.56-0.96 2.944-5.952 2.944 5.952 6.56 0.96-4.768 4.64 1.152 6.528-5.888-3.072-5.888 3.072 1.152-6.528z"/></svg>
                  Mix Elo
                </p>
                <p className="font-headline text-[26px] md:text-3xl font-bold text-yellow-500 tabular-nums">{formatNumber(player.mixelo || player.mixElo)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">

        {/* --- STATS --- */}
        <div className="bg-surface-container-low/80 backdrop-blur-md p-5 border border-outline-variant/20 space-y-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3"><h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Stats</h3></div>
          <div className="grid grid-cols-3 gap-y-4 gap-x-4">
            <div className="space-y-0.5 flex flex-col border-r border-outline-variant/10 pr-4">
              <p className="font-headline text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="M256 91.088c-111.453 0-202.122 88.575-202.122 197.456C53.878 397.426 144.548 486 256 486c111.453 0 202.122-88.574 202.122-197.456 0-108.881-90.67-197.455-202.122-197.455zm0 375.866c-100.942 0-183.076-80.039-183.076-178.41 0-98.37 82.134-178.41 183.076-178.41s183.076 80.04 183.076 178.41c0 98.371-82.134 178.41-183.076 178.41zm-.571-178.41 128.558 99.55A165.602 165.602 0 0 1 256 447.908c-90.467 0-164.03-71.493-164.03-159.365 0-87.681 73.266-159.055 163.447-159.352v159.352zM256 72.043a224.727 224.727 0 0 0-66.66 10.07V56.354A30.354 30.354 0 0 1 219.694 26h72.695a30.354 30.354 0 0 1 30.27 30.354v25.76A224.727 224.727 0 0 0 256 72.042zm128.939 40.71 20.117-19.748c8.797-8.642 21.272-10.463 27.878-4.083l20.403 19.748c6.594 6.38 4.761 18.558-3.988 27.2l-19.438 19.045a221.06 221.06 0 0 0-44.96-42.162zM82.435 154.51l-19.391-19.046c-8.797-8.642-10.713-20.724-4.202-26.985L78.875 89.1c6.476-6.26 18.856-4.344 27.652 4.298l20.046 19.688a221.06 221.06 0 0 0-44.138 41.425z"/></svg>
                Total Time
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-white flex items-baseline tabular-nums">{renderTime(player.time, "text-white")}</p>
            </div>
            <div className="space-y-0.5 flex flex-col border-r border-outline-variant/10 pr-4">
              <p className="font-headline text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 380c-94.9 0-172-77.1-172-172S161.1 84 256 84s172 77.1 172 172-77.1 172-172 172zm16-262h-32v112l96 57.6 16-26.2-80-47.4V166z"/></svg>
                Connects
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-gray-500 tabular-nums">{formatNumber(player.connections || player.connects || 0)}</p>
            </div>
            <div className="space-y-0.5 flex flex-col">
              <p className="font-headline text-primary-dim text-xs font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="m208.242 24.629-52.058 95.205 95.207 52.059 17.271-31.586-42.424-23.198A143.26 143.26 0 0 1 256 114c78.638 0 142 63.362 142 142s-63.362 142-142 142-142-63.362-142-142c0-16.46 2.785-32.247 7.896-46.928l-32.32-16.16C82.106 212.535 78 233.798 78 256c0 98.093 79.907 178 178 178s178-79.907 178-178S354.093 78 256 78c-13.103 0-25.875 1.44-38.18 4.148l22.008-40.25-31.586-17.27zm104.27 130.379L247 253.275V368h18V258.725l62.488-93.733-14.976-9.984z"/></svg>
                Last 7 Days
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-primary-dim flex items-baseline tabular-nums">{renderTime(player.weektime, "text-primary-dim")}</p>
            </div>
            {/* Row 2 */}
            <div className="space-y-0.5 border-r border-outline-variant/10 pr-4 pt-2 border-t border-t-outline-variant/10">
              <p className="font-headline text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="m485.813 19.125-85.594 28.563c5.54 36.314 1.39 77.714-19.095 122.937-25.507 56.312-75.953 118.53-163.53 186.22l-11.25-14.908c85.803-66.357 133.95-126.46 157.75-179 17.45-38.53 22.02-72.994 18.81-103.687L170.94 295.063l-22-29.125-14.907 11.25 23.095 30.562-.25.188 34.22 44.968c.022-.018.038-.044.06-.062l11.814 15.625.968 1.374 6.843 8.97-21 35.155 16.032 9.592L230.032 383l3.25-5.406-.126-.156c149.192-98.997 283.78-234.44 252.656-358.313zm-27.407 211.563c-3.195 44.583-12.58 64.095-21.875 78.03-4.663 6.994-9.53 13.964-9.53 23.032 0 18.143 14.388 33.094 32.53 33.094 18.144 0 33.126-14.95 33.126-33.094 0-10.064-6.316-17.154-11.78-24.72-9.717-13.458-18.577-32.888-22.47-76.342zm-85.03 83.156c-4.187 58.39-16.517 83.938-28.688 102.187-6.11 9.164-12.47 18.28-12.47 30.158 0 23.76 18.865 43.343 42.626 43.343 23.76 0 43.375-19.582 43.375-43.342 0-13.182-8.283-22.467-15.44-32.375-12.724-17.626-24.305-43.055-29.405-99.97zM142.03 319.28A593.69 593.69 0 0 0 127.625 331c3.36 9.22 7.55 20.726 11.875 32.72 3.4 9.423 6.637 18.544 9.594 26.905 8.9-9.123 18.042-17.753 27.5-25.875l-34.563-45.47zm-29.53 24.876A625.157 625.157 0 0 0 90.97 364.5l25 63.594A559.564 559.564 0 0 1 134.72 406c-.052-.145-.075-.26-.126-.406-3.47-9.91-8.09-22.787-12.688-35.53-3.423-9.494-6.464-17.82-9.406-25.908zm-35.844 34.97a684.95 684.95 0 0 0-24.47 27.218l32.19 64.28c6.026-8.72 12.082-17.21 18.25-25.405l-25.97-66.095zm-37.5 42.968a762.851 762.851 0 0 0-19.03 24.687c2.195 26.79 25.804 46.102 46.093 51.064 2.042-3.18 4.103-6.317 6.155-9.438l-33.22-66.312z"/></svg>
                Total Kills
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-white tabular-nums">{formatNumber(player.kills)}</p>
            </div>
            <div className="space-y-0.5 border-r border-outline-variant/10 pr-4 pt-2 border-t border-t-outline-variant/10">
              <p className="font-headline text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="M256 19.313c-44.404 0-85.098 25.433-115.248 68.123C110.6 130.126 91.594 189.846 91.594 256c0 66.152 19.005 125.87 49.156 168.563 30.15 42.69 70.845 68.125 115.25 68.125 44.402 0 85.07-25.435 115.22-68.125 30.15-42.69 49.186-102.41 49.186-168.563 0-66.152-19.037-125.87-49.19-168.564-30.15-42.69-70.812-68.124-115.214-68.124H256zM204.23 213.88l14.99 9.966-20.074 30.19 30.192 20.073-9.965 14.99-30.19-20.073-20.074 30.192-14.99-9.966 20.07-30.192L144 238.99l9.965-14.99 30.19 20.072 20.074-30.19zm103.54 0 20.074 30.192L358.034 224 368 238.99l-30.19 20.072 20.07 30.192-14.99 9.965-20.072-30.193-30.19 20.073-9.966-14.99 30.192-20.073-20.073-30.19 14.99-9.966zM256 367c26 0 52.242 8.515 70.363 26.637l-12.726 12.726c-3.28-3.28-7.006-6.198-11.067-8.75-.06 1.55-.142 3.128-.27 4.737-.46 5.693-1.33 11.654-3.568 17.257-2.236 5.603-6.655 11.875-14.228 13.487-8.496 1.807-15.982-2.58-21.13-7.59-5.146-5.01-9.12-11.24-12.495-17.422-4.78-8.754-8.213-17.494-9.83-21.902-16.58 2.595-31.98 9.477-42.687 20.183l-12.726-12.726C203.757 375.515 230 367 256 367zm3.945 18.084c1.67 4.095 3.972 9.312 6.735 14.373 2.885 5.286 6.303 10.28 9.25 13.147 2.8 2.724 4.114 2.98 4.728 2.896.056-.07.543-.523 1.358-2.564 1.098-2.752 1.965-7.354 2.34-12.032.333-4.114.343-8.192.257-11.523-7.827-2.495-16.192-3.952-24.668-4.296z"/></svg>
                Total Deaths
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-gray-500 tabular-nums">{formatNumber(player.deaths)}</p>
            </div>
            <div className="space-y-0.5 pt-2 border-t border-t-outline-variant/10">
              <p className="font-headline text-primary-dim text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 shrink-0" fill="currentColor"><path d="M85.875 20.97c-2.23 31.596-95.21 45.233-4.813 99.03-23.242-46.488 64.566-57.552 4.813-99.03zM278.53 23c-32.003 14.21-22.885 55.257-8.186 73 28 33.796-31.348 52.158-49.063-5.25-5.377 17.623-24.532 21.47-35.624 7.563-7.015-8.797-19.48-31.605-12.25-53.72-20.884 14.735-31.686 45.047-19.28 63.063 29.282 42.526-11.72 75.307-58.97 40.906 36.456 47.748 21.176 119.87-16.344 144.25 14.684-32.04 8.24-88.19-22.218-99.28 14.39 42.618-16.59 75.378-36.75 66.155V494.72h52.562c6.15-23.78 16.033-46.735 30.5-61.44 16.928-17.203 41.296-29.383 77.78-36.25l15.595-2.936-10.124-12.22c-20.233-24.38-33.406-59.518-33.406-98.655 0-37.723 12-71.733 30.906-95.94 18.906-24.205 44.29-38.53 72.125-38.53 27.837 0 53.19 14.325 72.095 38.53 18.905 24.208 30.906 58.218 30.906 95.94 0 38.246-12.073 73.187-31.374 97.374l-10.03 12.562 15.874 2.5c39.988 6.292 65.567 18.497 82.5 35.844 14.297 14.647 23.413 38.986 28.625 63.22h50.75V238.78c-7.012-23.793-17.18-46.354-32.625-51.093 19.492 39.968 1.278 129.343-61.906 141.313 26.715-22.383 45.213-78.483 35.03-101.594-34.788 47.587-79.102 2.555-34.437-43.22 29.676-30.412 39.924-68.813 10.5-110.967 9.104 40.185-37.766 84.93-69.875 56.655-21.68-19.09-10.235-60.918 23.75-71.844-26.954-9.334-47.72 2.8-52.562 21.595C295.337 62.535 272.155 51.37 278.53 23zm-74.155 242.844c-9.215-.212-19.062 3.635-29.063 13.28 14.593 29.555 39.886 25.69 67.938 13.188-9.878-14.53-23.517-26.116-38.875-26.468zm99.094 0c-15.36.352-28.998 11.938-38.876 26.47 28.05 12.5 53.345 16.365 67.937-13.19-10-9.645-19.846-13.492-29.06-13.28zM197.03 350.75c19.292 61.366 100.937 60.7 121.69 0-42.215 8.574-80.72 9.61-121.69 0z"/></svg>
                K/D Ratio
              </p>
              <p className="font-headline text-[26px] md:text-3xl font-bold text-primary-dim tabular-nums">{kdRatio}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low/80 backdrop-blur-md p-5 border border-outline-variant/20 space-y-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3"><h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Movement</h3></div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-headline text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.906 60.906" className="w-5 h-5 shrink-0" fill="currentColor"><path d="M19.472,3.504c2.436,0,4.411,1.975,4.411,4.411s-1.975,4.411-4.411,4.411s-4.411-1.975-4.411-4.411S17.036,3.504,19.472,3.504z M56.215,35.58c0.656,0,1.188,0.532,1.188,1.188s-0.532,1.188-1.188,1.188s-1.188-0.532-1.188-1.188C55.027,36.112,55.558,35.58,56.215,35.58z M57.525,41.412c0.332,0,0.601,0.27,0.601,0.602s-0.269,0.601-0.601,0.601s-0.602-0.269-0.602-0.601S57.193,41.412,57.525,41.412z M52.476,39.336c0.308,0,0.558,0.25,0.558,0.559c0,0.308-0.25,0.558-0.558,0.558c-0.309,0-0.559-0.25-0.559-0.558C51.918,39.586,52.168,39.336,52.476,39.336z M52.94,44.564l7.937-0.018l0.029,12.838l-7.936,0.018L52.94,44.564z M48.039,35.562c-5.486-1.654-9.902-6.232-12.686-11.101c-0.074-0.134-0.159-0.252-0.248-0.363c-0.082-0.291-0.191-0.578-0.325-0.858c-1.177-2.473-2.709-4.795-4.531-6.855c4.333-0.884,8.58-2.089,12.744-3.688c3.083-1.182,1.747-6.188-1.374-4.99c-5.702,2.19-11.623,3.77-17.684,4.565c-0.088,0.012-0.164,0.04-0.248,0.058c-0.917,0.095-1.808,0.49-2.557,1.248c-0.283,0.287-0.521,0.623-0.713,0.987c-3.674,0.54-7.009-0.527-10.16-2.707c-2.752-1.904-5.336,2.583-2.612,4.468c4.053,2.804,8.652,4.021,13.406,3.366c0.039,0.036,0.072,0.073,0.111,0.106c2.062,1.732,3.682,3.698,4.998,5.956c-6.192,1.682-12.586,4.956-13.597,11.445c-0.507,3.264,4.479,4.667,4.99,1.378c0.974-6.257,9.54-8.054,14.981-8.904c3.456,4.948,8.346,9.135,14.126,10.879C49.867,41.517,51.224,36.523,48.039,35.562z M0,56.874h7.934L12.53,44.04H0V56.874z"/></svg>
                  Total Jumps
                </span>
                <span className="font-headline font-bold text-[26px] md:text-3xl text-white tabular-nums">{formatNumber(player.jumps)}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20 rounded-full mt-2">
                 <div className="h-full bg-primary-dim transition-all duration-1000 ease-out" style={{ width: barAnim ? `${Math.min(((player.jumps || 0) / 3000000) * 100, 100)}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-headline text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.669 122.669" className="w-5 h-5 shrink-0" fill="currentColor"><circle cx="62.216" cy="18.908" r="18.908"/><path d="M108.929,84.604c-7.869-2.955-12.972-12.27-17.907-21.276c-4.648-8.484-9.04-16.499-16.229-20.908c-0.315-0.194-0.647-0.331-0.978-0.472c-2.106-1.407-4.474-2.442-6.887-3.034l-4.711,4.741l-4.567-4.793c-0.015,0.003-0.031,0.005-0.046,0.009c-2.238,0.535-4.435,1.458-6.426,2.702c-0.731,0.176-1.453,0.433-2.128,0.848c-7.08,4.34-11.523,12.555-16.228,21.251c-5.192,9.599-10.561,19.522-18.57,21.875c-3.89,1.142-6.118,5.222-4.976,9.111c0.938,3.2,3.866,5.274,7.04,5.274c0.684,0,1.38-0.096,2.07-0.299c0.645-0.189,1.261-0.418,1.878-0.646c-1.201,1.295-1.953,2.938-2.21,5.064c-0.421,3.479,0.663,6.891,3.055,9.608c6.744,7.666,25.191,8.935,35.587,9.01c0.021,0,0.042,0,0.063,0c2.205,0,4.213-0.831,5.745-2.188c1.532,1.357,3.541,2.188,5.745,2.188c0.021,0,0.042,0,0.062,0c10.396-0.075,28.843-1.344,35.587-9.01c2.393-2.718,3.477-6.13,3.056-9.607c-0.295-2.437-1.234-4.224-2.729-5.579c0.705,0.215,1.417,0.346,2.123,0.346c2.971,0,5.769-1.817,6.874-4.764C114.646,90.26,112.725,86.027,108.929,84.604z M42.864,75.885v17.629c-6.544,0.516-11.94,0.967-16.017,2.039C33.812,90.749,38.677,83.331,42.864,75.885z M81.569,93.802V76.509c4.246,7.319,9.298,14.535,16.708,19.115C94.067,94.557,88.442,94.209,81.569,93.802z"/></svg>
                  Total Ducks
                </span>
                <span className="font-headline font-bold text-[26px] md:text-3xl text-white tabular-nums">{formatNumber(player.ducks)}</span>
              </div>
              <div className="h-1.5 bg-background overflow-hidden border border-outline-variant/20 rounded-full mt-2">
                 <div className="h-full bg-gray-500 transition-all duration-1000 ease-out" style={{ width: barAnim ? `${Math.min(((player.ducks || 0) / 2000000) * 100, 100)}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/10">
            {/* O W N A G E S */}
            <div className="relative bg-background/60 border border-outline-variant/20 p-3 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/40 via-white/5 to-yellow-500/20 pointer-events-none"></div>
              <p className="font-headline text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 51" className="w-5 h-5 shrink-0 text-white" fill="currentColor"><path d="M48.011,33.803c-6.846-0.848-13.729-1.594-20.619-2.086c-0.525-2.92-1-5.285-0.233-7.16c0.087-0.076,0.706-1.14,0.81-1.277c0.375-0.496,0.756-0.984,1.166-1.452c1.154-1.318,2.406-2.551,3.629-3.805c1.996-2.043,2.627-5.029,0.652-7.385c-0.826-0.987-2.127-1.649-3.474-1.837c-5.149-2.451-10.497-4.4-15.986-5.978c-4.179-1.2-6.498,5.179-2.281,6.392c3.825,1.1,7.579,2.38,11.246,3.884c-2.368,2.411-4.651,5.031-5.732,8.139c-1.136,3.264-0.982,6.644-0.498,9.991c-1.709-0.024-3.418-0.067-5.11-0.26c-3.004-0.342-6.531-0.463-9.103,1.424c-4.777,3.506-1.261,8.691-0.795,13.201c0.449,4.359,7.128,3.158,6.682-1.172c-0.224-2.166-1.231-4.107-1.584-6.232c-0.17-1.024-0.477-0.424,0.589-0.559c1.549-0.197,3,0.068,4.542,0.199c4.846,0.408,9.75,0.283,14.612,0.65c6.987,0.531,13.97,1.223,20.925,2.084C51.795,41.102,52.349,34.34,48.011,33.803z"/><circle cx="41.288" cy="11.292" r="5.323"/></svg>
                Ownages
              </p>
              <p className="font-headline font-black text-[26px] md:text-3xl text-white tabular-nums leading-none relative z-10">{formatNumber(player.ownages)}</p>
            </div>
            {/* W R E C K E R S */}
            <div className="relative bg-background/60 border border-outline-variant/20 p-3 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/40 via-white/5 to-[#792be0]/30 pointer-events-none"></div>
              <p className="font-headline text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55.759 55.759" className="w-5 h-5 shrink-0 text-white" fill="currentColor"><path d="M49.259,19.368c-5.932,3.152-11.836,6.407-17.604,9.868c-2.051-2.034-3.751-3.653-4.189-5.578c0.024-0.115-0.076-1.303-0.07-1.471c0.023-0.604,0.053-1.208,0.117-1.81c0.185-1.695,0.491-3.379,0.767-5.063c0.448-2.745-0.72-5.476-3.609-6.25c-1.027-0.275-2.196-0.171-3.247,0.234c-0.384-0.21-0.825-0.356-1.328-0.412C15.849,8.415,11.68,7.48,7.681,5.968c-3.993-1.509-5.701,4.878-1.756,6.37c3.9,1.475,7.937,2.335,12.046,2.891c-0.014,0.078-0.027,0.156-0.042,0.234c-4.799,0.921-9.505,2.222-14.138,3.818c-4.003,1.378-2.283,7.762,1.756,6.37c3.81-1.313,7.667-2.426,11.585-3.293c-0.004,1.442,0.142,2.863,0.529,4.229c0.92,3.238,2.931,5.846,5.19,8.244c-1.378,0.936-2.764,1.855-4.22,2.648c-2.586,1.409-5.464,3.284-6.459,6.228c-1.847,5.466,3.854,7.632,6.749,10.969c2.795,3.224,7.448-1.469,4.671-4.672c-1.389-1.601-3.277-2.586-4.749-4.083c-0.708-0.723-0.615-0.07,0.159-0.773c1.124-1.023,2.428-1.623,3.731-2.383c4.091-2.384,7.93-5.227,12.01-7.652c5.869-3.484,11.82-6.836,17.848-10.042C56.355,23.071,53.019,17.369,49.259,19.368z"/><circle cx="31.31" cy="5.183" r="5.183"/></svg>
                Wreckers
              </p>
              <p className="font-headline font-black text-[26px] md:text-3xl text-white tabular-nums leading-none relative z-10">{formatNumber(player.wreckers)}</p>
            </div>
          </div>
        </div>

        </div>

        {/* --- RIGHT COLUMN: Personal Bests --- */}
        <div className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-4 shrink-0">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Personal Bests</h3>
            <div className="flex bg-background border border-outline-variant/20 p-0.5">
              <button onClick={() => setJumpMode("PRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "PRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>PRE</button>
              <button onClick={() => setJumpMode("NOPRE")} className={`px-3 py-1 font-headline text-[10px] uppercase tracking-widest transition-colors ${jumpMode === "NOPRE" ? "bg-primary-dim text-white" : "text-gray-500 hover:text-white"}`}>NOPRE</button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar px-4 md:px-6 py-4">
             {/* Header Tabel */}
             <div className="grid grid-cols-[30px_1.5fr_1fr_1fr_1fr_1fr_1fr] md:grid-cols-[40px_1.5fr_1fr_1fr_1fr_1fr_1fr] text-center items-center text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-3 border-b border-outline-variant/10 px-2 shrink-0">
                <span className="text-left">Type</span>
                <span>Distance</span>
                <span>Max</span>
                <span>Height</span>
                <span>Pre</span>
                <span>Strafes</span>
                <span className="text-right">Sync</span>
             </div>
             
             {/* Continut Tabel */}
             <div className="flex-1 flex flex-col justify-between pt-3 gap-0">
                {getAllJumps(currentStats).map(j => {
                   const hasRecord = j.dist && parseFloat(j.dist) > 0;
                   const abbrColor = hasRecord ? getJumpColor(j.abbr, j.dist) : "text-gray-500";
                   const syncVal = parseFloat(j.sync || 0);
                   const syncColor = syncVal >= 90 ? "text-green-500" : "text-white";

                   return (
                     <div key={j.abbr} title={j.label} className="grid grid-cols-[30px_1.5fr_1fr_1fr_1fr_1fr_1fr] md:grid-cols-[40px_1.5fr_1fr_1fr_1fr_1fr_1fr] text-center items-center bg-gray/30 border border-white/5 py-3 md:py-3.5 px-2 rounded-sm hover:bg-white/[0.03] transition-colors shadow-inner">
                       
                       {/* ABREVIERE COLORATA */}
                       <span className={`font-headline text-xs md:text-sm font-bold uppercase tracking-widest text-left ${abbrColor}`}>{j.abbr}</span>
                       
                       {hasRecord ? (
                          <>
                            {/* DISTANTA MEREU ALBA */}
                            <span className="font-headline font-bold text-sm md:text-base text-white tracking-tighter tabular-nums">
                               {parseFloat(j.dist).toFixed(2)}
                            </span>
                            <span className="font-headline font-bold text-xs md:text-sm text-white">{parseFloat(j.max || 0).toFixed(0)}</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-white">{parseFloat(j.height || 0).toFixed(2)}</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-white">{parseFloat(j.pre || 0).toFixed(2)}</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-white">{j.str || 0}</span>
                            <span className={`font-headline font-bold text-xs md:text-sm ${syncColor} text-right`}>{syncVal.toFixed(0)}%</span>
                          </>
                       ) : (
                          <>
                            <span className="font-headline font-bold text-sm text-gray-700">-</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-gray-700">-</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-gray-700">-</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-gray-700">-</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-gray-700">-</span>
                            <span className="font-headline font-bold text-xs md:text-sm text-gray-700 text-right">-</span>
                          </>
                       )}
                     </div>
                   )
                })}
             </div>
          </div>
        </div>

      </section>
      </div>
    </div>
  );
}
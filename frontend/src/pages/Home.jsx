import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [servers, setServers] = useState([]);
  const [potw, setPotw] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [copiedServer, setCopiedServer] = useState(null);

  const slideshowImages = [
    "fj_mansion.webp", "hns_avenue.webp", "hns_backalot.webp", "hns_devblocks_remake.webp", "hns_freeway.webp", "hns_mini_bbcity.webp", "hns_mini_floppy.webp", "hns_mini_jukecity.webp", "hns_mini_rooftops.webp", "hns_rooftops_remake.webp", "hns_mini_tyo.webp", "hns_trickpark.webp", "hns_boost_bbcity.webp", "hns_skyline.webp", "hns_boost_dust2.webp", "hns_boost_qube.webp", "hns_boost_mafia.webp", "hns_boost_jukecity.webp", "hns_oilrig.webp", "hns_miami.webp", "hns_half.webp", "hns_sunset.webp", "hns_rooftops.webp", "hns_rooftops_v5.webp", "hns_virtual.webp", "hns_iceskating.webp", "hns_jhard.webp", "hns_zen.webp", "hns_ruins.webp", "hns_liberation.webp", "hns_kitty_pro.webp", "hns_funk.webp", "hns_flowtown.webp", "hns_floppytown.webp", "hns_esip.webp", "hns_brickworld.webp", "hns_bakgard.webp", "hns_assault_inside.webp", "hns_jukecity.webp", "hns_devblocks.webp", "hns_tyo.webp", "hns_bbcity.webp"
  ];

  useEffect(() => {
    const fetchPlayers = () => {
      fetch("/api/players/count")
        .then(res => res.text()) // Folosim text() pentru a nu pica la un număr simplu
        .then(text => setTotalPlayers(parseInt(text) || 0))
        .catch(err => console.error("Error fetching total players:", err));

      fetch("/api/players/potw")
        .then(res => {
            if (!res.ok) throw new Error("POTW not found");
            return res.json();
        })
        .then(data => {
            setPotw(data);
        })
        .catch(err => console.error("Error fetching POTW:", err));
    };

    const fetchServers = () => {
      fetch("/api/servers") 
        .then(res => res.json())
        .then(data => setServers(data))
        .catch(err => console.error("Error fetching servers:", err));
    };

    fetchPlayers();
    fetchServers();

    const playersInterval = setInterval(fetchPlayers, 30000);
    const serversInterval = setInterval(fetchServers, 10000);

    return () => {
      clearInterval(playersInterval);
      clearInterval(serversInterval);
    };
  }, []);

  const categorizeMaps = (maps) => {
    const categories = {
      boost: { title: "Boost Maps", maps: [] },
      mini: { title: "Mini Maps", maps: [] },
      fj: { title: "Funjump", maps: [] },
      holiday: { title: "Holiday Maps", maps: [] },
      classic: { title: "Classic Hide'N'Seek", maps: [] }
    };

    maps.forEach(map => {
      const mapLower = map.toLowerCase();
      if (mapLower.includes('iceskating') || mapLower.includes('xmas') || mapLower.includes('snow')) {
        categories.holiday.maps.push(map);
      }
      else if (mapLower.includes('boost')) categories.boost.maps.push(map);
      else if (mapLower.includes('mini')) categories.mini.maps.push(map);
      else if (mapLower.includes('fj_')) categories.fj.maps.push(map);
      else categories.classic.maps.push(map);
    });

    return categories;
  };

  const mapCategories = categorizeMaps(slideshowImages);

  const getServerData = (id) => {
    return servers.find(s => s.server === id) || { 
      name: "Loading...", map: "---", players: "0", maxplayers: "32", 
      terrorists: "", counterterrorists: "", spectators: "", funjumpers: "",
      serverip: "Loading..."
    };
  };

  const copyToClipboard = (ip, serverId) => {
    if(!ip || ip === "Loading...") return; 
    navigator.clipboard.writeText(ip).then(() => {
      setCopiedServer(serverId);
      setTimeout(() => setCopiedServer(null), 2000); 
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

// 1. Transformă Steam64 (17 cifre) în Account ID (ex: 371937544)
  const steam64ToAccountId = (steam64) => {
    if (!steam64) return "";
    const str = steam64.trim();
    
    // Dacă e Steam64 (17 cifre)
    if (/^\d{17}$/.test(str)) {
       try {
         const id64 = BigInt(str);
         const base = BigInt("76561197960265728");
         const accountId = id64 - base;
         
         // MAGIA AICI: Returnăm direct numărul (ex: 371937544)
         return accountId.toString(); 
       } catch(e) { return str; }
    }
    return str; 
  };

  // 2. Funcția care repară caracterele speciale din nume (UTF-8 Decode)
  const fixEncoding = (str) => {
    if (!str) return "";
    try {
      return decodeURIComponent(escape(str));
    } catch (e) {
      return str;
    }
  };

 const parsePlayerList = (rawString) => {
    if (!rawString || rawString.trim() === "") return [];
    return rawString.split(';')
      .filter(playerStr => playerStr.trim() !== "")
      .map(playerStr => {
        const [countryCode, playerName, steamId] = playerStr.split('|');
        return {
          flag: countryCode ? countryCode.toLowerCase() : 'un',
          name: fixEncoding(playerName) || 'Unknown',
          // Aici aplicăm noua funcție:
          id: steam64ToAccountId(steamId) 
        };
      });
  };

  const getRoleBadge = (player) => {
    const roleStr = (player.role || player.status || player.rankName || "").toLowerCase();
    const vipValue = parseInt(player.vip) || 0;
    
    if (roleStr.includes('developer') || roleStr.includes('dev')) {
      return <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Developer</span>;
    }
    if (roleStr.includes('head admin')) {
      return <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">Head Admin</span>;
    }
    if (roleStr.includes('admin')) {
      return <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Admin</span>;
    }
    if (roleStr.includes('helper')) {
      return <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">Helper</span>;
    }
    
    if (vipValue === 2) {
      return <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]">VIP Lifetime</span>;
    } else if (vipValue > 2) {
      const expiryDate = new Date(vipValue * 1000);
      const dateString = expiryDate.toLocaleDateString('ro-RO');
      return <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]">VIP Until: {dateString}</span>;
    }
    
    return null;
  };

  const PlayerColumn = ({ title, players, color }) => (
    <div className="flex flex-col min-w-0">
      <div className={`text-[10px] font-bold uppercase tracking-widest ${color} mb-2.5 border-b border-white/5 pb-1 flex justify-between`}>
        <span>{title}</span>
        <span className="opacity-60">{players.length}</span>
      </div>
      
      <div className="space-y-1.5 flex flex-col">
        {players.length > 0 ? players.map((player, index) => (
          
          <Link key={index} to={`/profile/${player.id}`} className="flex items-center gap-2 group/player" title={`View Profile: ${player.name}`}>
            {player.flag === 'un' || !player.flag ? (
               <span className="text-[10px] opacity-50 font-mono min-w-[16px] text-center">--</span>
            ) : (
               <img 
                 src={`/countryflags/${player.flag}.gif`} 
                 alt={player.flag}
                 loading="lazy"
                 className="w-4 h-[11px] object-cover rounded-[1px] opacity-70 group-hover/player:opacity-100 transition-opacity flex-shrink-0"
                 onError={(e) => { e.target.style.display = 'none'; }}
               />
            )}
            <span className="text-[11px] text-zinc-300 group-hover/player:text-primary-dim transition-colors truncate font-medium">
              {player.name}
            </span>
          </Link>

        )) : (
          <span className="text-[10px] text-zinc-600 italic">No players</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-8 animate-fade-in overflow-hidden">
      
      <style>{`
        .scanlines {
            position: fixed; inset: 0; z-index: 50; pointer-events: none;
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.05) 51%);
            background-size: 100% 4px;
            opacity: 0.1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(233, 0, 54, 0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(233, 0, 54, 0.4); }
      `}</style>

      <div className="scanlines"></div>

      <section className="mb-14 pt-10 flex flex-col items-center relative z-10 text-center">
        <div className="flex font-headline font-black tracking-tighter leading-none select-none gap-4 md:gap-6 group justify-center">
          {['S', 'W', 'A', 'Y'].map((letter, idx) => {
            const words = ["SEEKERS", "WONDER", "ABOUT", "YOU"];
            return (
              <div key={idx} className="flex flex-col items-center justify-center">
                <span className="text-8xl md:text-[9rem] text-primary-dim text-center transition-all duration-500 group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(233,0,54,0.4)] leading-none">
                  {letter}
                </span>
                <span className="text-[9px] md:text-[11px] tracking-[0.4em] text-primary-dim/60 uppercase font-bold mt-1 transition-colors duration-300 group-hover:text-white/80 ml-1">
                  {words[idx]}
                </span>
              </div>
            );
          })}
        </div>
        {/* Sloganul a fost scos complet de aici */}
      </section>

      {potw && (() => {
        const potwFlag = (potw.country || potw.flag || 'un').toLowerCase();
        return (
          <section className="mb-14 relative z-10 flex justify-center">
            <div className="bg-gradient-to-r from-surface-container-low/20 via-primary-dim/10 to-surface-container-low/20 border border-primary-dim/20 backdrop-blur-md rounded-2xl px-6 md:px-8 py-5 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(233,0,54,0.05)] hover:shadow-[0_0_30px_rgba(233,0,54,0.15)] transition-all duration-500">
              <div className="flex items-center gap-5">
                <Link to={`/profile/${potw.steamId || potw.steamid || potw.id}`} className="relative group/avatar cursor-pointer block">
                  <img 
                    src={potw.avatarUrl || potw.avatarurl || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} 
                    alt={potw.name}
                    loading="lazy"
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-primary-dim/30 shadow-[0_0_15px_rgba(233,0,54,0.2)] transition-transform duration-300 group-hover/avatar:scale-105 group-hover/avatar:border-primary-dim"
                    onError={(e) => { e.target.src = "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg" }}
                  />
                </Link>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-1">Player of the Week</span>
                  <div className="flex items-center gap-2.5">
                    {potwFlag !== 'un' && (
                      <img 
                        src={`/countryflags/${potwFlag}.gif`} 
                        alt={potwFlag}
                        loading="lazy"
                        className="w-5 shadow-sm rounded-[2px]"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <Link to={`/profile/${potw.steamId || potw.steamid || potw.id}`} className="font-headline text-2xl md:text-3xl font-black text-white hover:text-primary-dim transition-colors cursor-pointer leading-none">
                      {potw.name}
                    </Link>
                  </div>
                  <div className="mt-2">
                    {getRoleBadge(potw)}
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10 mx-2"></div>
              <div className="flex gap-8 text-center md:text-left mt-2 md:mt-0">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500">Weekly Time</span>
                  <span className="text-lg font-bold text-white font-mono drop-shadow-sm">{formatTime(potw.weektime)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500">Rank</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono drop-shadow-sm">#{potw.realHnsRank || potw.serverRank}</span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 relative z-10 items-start">
        {[1, 2, 3].map((sId) => {
          const sData = getServerData(sId);
          const percentage = (parseInt(sData.players) / (parseInt(sData.maxplayers) || 32)) * 100;
          
          const serverIP = sData.serverip || "Loading...";
          const currentMap = sData.map || "---";

          const terrorists = parsePlayerList(sData.terrorists);
          const counterTerrorists = parsePlayerList(sData.counterterrorists);
          const spectators = parsePlayerList(sData.spectators);
          const funjumpers = parsePlayerList(sData.funjumpers);
          const mapImageUrl = `/images/${currentMap}.webp`; 

          return (
            <div key={sId} className="group relative bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary-dim/20 hover:shadow-[0_0_40px_rgba(233,0,54,0.1)] hover:-translate-y-1.5 flex flex-col">
              
              <div className="relative aspect-[16/10] overflow-hidden border-b border-white/5">
                <img 
                  src={mapImageUrl} 
                  alt={`Map: ${currentMap}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/images/hns_backalot.webp'; 
                    e.target.style.filter = 'brightness(0.5) blur(2px)';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                  <div>
                    <h3 className="font-headline text-2xl font-black text-white tracking-tight uppercase group-hover:tracking-wider transition-all duration-500 drop-shadow-lg">{sData.name}</h3>
                    <span className="text-[11px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5 inline-block mt-1">
                      Map: {currentMap}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-widest animate-pulse bg-black/50 px-2 py-1 rounded backdrop-blur-sm">ONLINE</span>
                </div>
              </div>

              <div className="p-6 md:p-7 flex flex-col gap-6 flex-grow">
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-primary-dim transition-colors">
                      Players
                    </span>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-3xl font-black font-headline text-white drop-shadow-md">{sData.players}<span className="text-zinc-600">/{sData.maxplayers}</span></span>
                      <div className="h-1 w-20 bg-white/5 mt-1.5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-primary-dim transition-all duration-1000 ease-out shadow-[0_0_8px_#e90036]" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => copyToClipboard(serverIP, sId)}
                    className="bg-black/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-primary-dim/30 hover:bg-black/70 transition-all cursor-pointer group/btn"
                    title="Click to copy server IP"
                  >
                    <code className="text-[14px] md:text-[13px] font-mono font-bold text-gray-300 group-hover/btn:text-white transition-colors tracking-widest">
                      {serverIP}
                    </code>
                    
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] border px-2 py-1 rounded transition-colors ${copiedServer === sId ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-primary-dim border-primary-dim/20 bg-primary-dim/5'}`}>
                      {copiedServer === sId ? 'Copied!' : 'Copy'}
                    </span>
                  </div>

                  <a href={`steam://connect/${serverIP}`} className="w-full block text-center bg-primary-dim hover:bg-white hover:text-black text-white py-3.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg shadow-primary-dim/10 hover:shadow-white/5">
                    Connect Now
                  </a>
                </div>

                <div className="bg-black/25 rounded-xl p-5 border border-white/5 grid grid-cols-2 gap-x-6 gap-y-5 shadow-inner mt-auto">
                  <PlayerColumn title="T" players={terrorists} color="text-primary-container" />
                  <PlayerColumn title="CT" players={counterTerrorists} color="text-secondary-fixed-dim" />
                  
                  {spectators.length > 0 && (
                     <PlayerColumn title="SPEC" players={spectators} color="text-zinc-500" />
                  )}
                  {funjumpers.length > 0 && (
                     <PlayerColumn title="FUNJUMPERS" players={funjumpers} color="text-purple-400" />
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20 relative z-10">
        <Link to="/leaderboard" className="bg-surface-container-low/40 border border-white/10 p-10 rounded-xl flex flex-col justify-between min-h-[160px] hover:border-primary-dim/30 hover:bg-primary-dim/5 transition-all duration-700 group shadow-lg cursor-pointer">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-headline group-hover:text-primary-dim transition-colors">Unique Players</span>
          </div>
          <div className="flex items-baseline gap-6 mt-4">
            <span className="text-7xl font-black font-headline text-white tracking-tighter transition-transform duration-500 group-hover:scale-105">
              {totalPlayers.toLocaleString()}
            </span>
          </div>
        </Link>
        
        <div 
          onClick={() => setIsMapModalOpen(true)} 
          className="bg-surface-container-highest/20 backdrop-blur-md border border-white/5 p-10 rounded-xl flex flex-col justify-between min-h-[160px] hover:border-primary-dim/30 hover:bg-primary-dim/5 transition-all group cursor-pointer shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-headline group-hover:text-primary-dim transition-colors">Maps in Pool</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-primary-dim transition-colors">See All &rarr;</span>
          </div>
          <span className="text-7xl font-black font-headline text-white tracking-tighter transition-transform duration-500 group-hover:scale-105 mt-4">
            {slideshowImages.length}
          </span>
        </div>
      </section>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsMapModalOpen(false)}
          ></div>

          <div className="relative bg-[#0a0a0c] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-surface-container-low/80 backdrop-blur-md sticky top-0 z-20">
              <div>
                <h2 className="text-3xl font-black font-headline text-white uppercase tracking-tighter">Map <span className="text-primary-dim">Pool</span></h2>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)} 
                className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 rounded-md cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-gradient-to-b from-transparent to-black/40 space-y-12">
              {Object.keys(mapCategories).map((categoryKey) => {
                const category = mapCategories[categoryKey];
                
                if (category.maps.length === 0) return null;

                return (
                  <div key={categoryKey} className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className={`text-xl font-black font-headline uppercase tracking-widest drop-shadow-md ${categoryKey === 'holiday' ? 'text-blue-300' : 'text-white'}`}>
                        {category.title}
                      </h3>
                      <div className="h-px bg-white/10 flex-grow"></div>
                      <span className="text-primary-dim text-[10px] font-bold font-mono border border-primary-dim/20 bg-primary-dim/5 px-2 py-1 rounded">
                        {category.maps.length} MAPS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {category.maps.map((mapName, idx) => {
                        const cleanName = mapName.split('.')[0]; 
                        
                        return (
                          <div key={idx} className="group bg-surface-container-low border border-white/5 rounded-xl overflow-hidden hover:border-primary-dim/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(233,0,54,0.15)] hover:-translate-y-1">
                            <div className="aspect-video overflow-hidden relative bg-black/50">
                              <img 
                                src={`/images/${mapName}`} 
                                alt={cleanName}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = '/images/hns_backalot.webp'; 
                                  e.target.style.filter = 'brightness(0.5) blur(2px)';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity"></div>
                            </div>
                            
                            <div className="p-3.5 flex flex-col items-start bg-black/40 border-t border-white/5">
                               <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5 group-hover:text-primary-dim transition-colors">
                                 {categoryKey.toUpperCase()}
                               </span>
                               <span className="font-mono text-[13px] text-white/90 truncate w-full font-medium">
                                 {cleanName}
                               </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
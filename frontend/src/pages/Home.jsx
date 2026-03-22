import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [servers, setServers] = useState([]);
  const [potw, setPotw] = useState(null);

  const slideshowImages = [
    "fj_mansion.png", "hns_avenue.jpg", "hns_backalot.jpg", "hns_devblocks_remake.jpg", "hns_freeway.jpg", "hns_mini_bbcity.jpg", "hns_mini_floppy.jpg", "hns_mini_jukecity.jpg", "hns_mini_rooftops.jpg", "hns_rooftops_remake.jpg", "hns_mini_tyo.jpg", "hns_trickpark.jpg", "hns_boost_bbcity.jpg", "hns_skyline.jpg", "hns_boost_dust2.jpg", "hns_boost_qube.jpg", "hns_boost_mafia.jpg", "hns_boost_jukecity.jpg", "hns_oilrig.jpg", "hns_miami.jpg", "hns_half.jpg", "hns_sunset.jpg", "hns_rooftops.jpg", "hns_rooftops_v5.jpg", "hns_virtual.jpg", "hns_iceskating.jpg", "hns_jhard.jpg", "hns_zen.jpg", "hns_ruins.jpg", "hns_liberation.jpg", "hns_kitty_pro.jpg", "hns_funk.jpg", "hns_flowtown.jpg", "hns_floppytown.jpg", "hns_esip.jpg", "hns_brickworld.jpg", "hns_bakgard.jpg", "hns_assault_inside.jpg", "hns_jukecity.jpg", "hns_devblocks.jpg", "hns_tyo.jpg", "hns_bbcity.jpg"
  ];

  useEffect(() => {
    fetch("http://localhost:8080/api/players/all")
      .then(res => res.json())
      .then(data => {
        setTotalPlayers(data.length);
        
        if (data && data.length > 0) {
          const topPlayer = [...data].sort((a, b) => (b.weektime || 0) - (a.weektime || 0))[0];
          setPotw(topPlayer);
        }
      })
      .catch(err => console.error("Error fetching total players:", err));

    const fetchServers = () => {
      fetch("http://localhost:8080/api/servers") 
        .then(res => res.json())
        .then(data => setServers(data))
        .catch(err => console.error("Error fetching servers:", err));
    };

    fetchServers();
    const interval = setInterval(fetchServers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getServerData = (id) => {
    return servers.find(s => s.server === id) || { name: "Loading...", map: "---", players: "0", maxplayers: "32", terrorists: "", counterterrorists: "", spectators: "", funjumpers: "" };
  };

  const copyToClipboard = (ip) => {
    navigator.clipboard.writeText(ip);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const parsePlayerList = (rawString) => {
    if (!rawString || rawString.trim() === "") return [];
    return rawString.split(';')
      .filter(playerStr => playerStr.trim() !== "")
      .map(playerStr => {
        const [countryCode, playerName, steamId] = playerStr.split('|');
        return {
          flag: countryCode ? countryCode.toLowerCase() : 'un',
          name: playerName || 'Unknown',
          id: steamId
        };
      });
  };

  const PlayerColumn = ({ title, players, color }) => (
    <div className="flex flex-col min-w-0">
      <div className={`text-[10px] font-bold uppercase tracking-widest ${color} mb-2.5 border-b border-white/5 pb-1 flex justify-between`}>
        <span>{title}</span>
        <span className="opacity-60">{players.length}</span>
      </div>
      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1.5 custom-scrollbar">
        {players.length > 0 ? players.map((player, index) => (
          <div key={index} className="flex items-center gap-2 group/player" title={`SteamID: ${player.id}`}>
            {player.flag === 'un' || !player.flag ? (
               <span className="text-[10px] opacity-50 font-mono min-w-[16px] text-center">--</span>
            ) : (
               <img 
                 src={`https://community.fastly.steamstatic.com/public/images/countryflags/${player.flag}.gif`} 
                 alt={player.flag}
                 className="w-4 h-[11px] object-cover rounded-[1px] opacity-70 group-hover/player:opacity-100 transition-opacity flex-shrink-0"
                 onError={(e) => { e.target.style.display = 'none'; }}
               />
            )}
            <span className="text-[11px] text-zinc-300 group-hover/player:text-white transition-colors truncate font-medium">
              {player.name}
            </span>
          </div>
        )) : (
          <span className="text-[10px] text-zinc-600 italic">Empty</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-8 animate-fade-in overflow-hidden">
      
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
        .scanlines {
            position: fixed; inset: 0; z-index: 50; pointer-events: none;
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.05) 51%);
            background-size: 100% 4px;
            opacity: 0.1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(233, 0, 54, 0.2); rounded: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(233, 0, 54, 0.4); }
      `}</style>

      <div className="scanlines"></div>

      <div className="slideshow-container">
        {slideshowImages.map((img, index) => (
          <div 
            key={index} 
            className="slide" 
            style={{ 
              backgroundImage: `url(/images/${img})`, 
              animationDelay: `${index * 5}s`,
              animationDuration: `${slideshowImages.length * 1}s` 
            }}
          />
        ))}
      </div>

      <section className="mb-16 pt-20 flex flex-col items-center relative z-10 text-center">
        <div className="flex font-headline font-black tracking-tighter leading-none select-none gap-4 md:gap-6 group justify-center">
          {['S', 'W', 'A', 'Y'].map((letter, idx) => {
            const words = ["SEEKERS", "WONDER", "ABOUT", "YOU"];
            return (
              <div key={idx} className="flex flex-col items-center justify-center">
                <span className="text-8xl md:text-[9rem] text-primary-dim text-center transition-all duration-500 group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(233,0,54,0.4)] leading-none">
                  {letter}
                </span>
                <span className="text-[9px] md:text-[11px] tracking-[0.4em] text-primary-dim/60 uppercase font-bold mt-4 transition-colors duration-300 group-hover:text-white/80 ml-1">
                  {words[idx]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-16 space-y-4 relative group max-w-2xl mx-auto flex flex-col items-center">
          <p className="text-gray-300 font-headline font-medium text-xl leading-relaxed tracking-wide italic">
            "We are like a bunker! We got everything you need."
          </p>
          <div className="h-[2px] w-12 bg-primary-dim/40 rounded-full my-4 transition-all duration-500 group-hover:w-24 group-hover:bg-primary-dim"></div>
          <p className="text-gray-500 font-headline text-xs tracking-[0.3em] uppercase opacity-60">
            The most unique Hide'N'Seek server that ever existed
          </p>
        </div>
      </section>

      {potw && (() => {
        const potwFlag = (potw.country || potw.flag || 'un').toLowerCase();
        return (
          <section className="mb-16 relative z-10 flex justify-center">
            <div className="bg-gradient-to-r from-surface-container-low/20 via-primary-dim/10 to-surface-container-low/20 border border-primary-dim/20 backdrop-blur-md rounded-2xl px-6 md:px-8 py-5 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(233,0,54,0.05)] hover:shadow-[0_0_30px_rgba(233,0,54,0.15)] transition-all duration-500">
              <div className="flex items-center gap-5">
                <div className="relative group/avatar">
                  <img 
                    src={potw.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} 
                    alt={potw.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-primary-dim/30 shadow-[0_0_15px_rgba(233,0,54,0.2)] transition-transform duration-300 group-hover/avatar:scale-105 group-hover/avatar:border-primary-dim"
                    onError={(e) => { e.target.src = "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg" }}
                  />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">Player of the Week</span>
                  <div className="flex items-center gap-2.5">
                    {potwFlag !== 'un' && (
                      <img 
                        src={`https://community.fastly.steamstatic.com/public/images/countryflags/${potwFlag}.gif`} 
                        alt={potwFlag}
                        className="w-5 shadow-sm rounded-[2px]"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <Link to={`/profile/${potw.steamId || potw.steamid || potw.id}`} className="font-headline text-2xl md:text-3xl font-black text-white hover:text-primary-dim transition-colors cursor-pointer leading-none">
                      {potw.name}
                    </Link>
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
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500">Global Rank</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono drop-shadow-sm">#{potw.serverRank || potw.rank || "1"}</span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 relative z-10 items-start">
        {[1, 2, 3].map((sId) => {
          const sData = getServerData(sId);
          const percentage = (parseInt(sData.players) / (parseInt(sData.maxplayers) || 32)) * 100;
          const ip = sId === 1 ? 'hns.sway.ro:27015' : sId === 2 ? 'nopre.sway.ro:27015' : 'mix.sway.ro:27015';

          const terrorists = parsePlayerList(sData.terrorists);
          const counterTerrorists = parsePlayerList(sData.counterterrorists);
          const spectators = parsePlayerList(sData.spectators);
          const funjumpers = parsePlayerList(sData.funjumpers);
          const mapImageUrl = `/images/${sData.map}.jpg`; 

          return (
            <div key={sId} className="group relative bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary-dim/20 hover:shadow-[0_0_40px_rgba(233,0,54,0.1)] hover:-translate-y-1.5 flex flex-col">
              
              <div className="relative aspect-[16/10] overflow-hidden border-b border-white/5">
                <img 
                  src={mapImageUrl} 
                  alt={`Map: ${sData.map}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/images/hns_backalot.jpg'; 
                    e.target.style.filter = 'brightness(0.5) blur(2px)';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                  <div>
                    <h3 className="font-headline text-2xl font-black text-white tracking-tight uppercase group-hover:tracking-wider transition-all duration-500 drop-shadow-lg">{sData.name}</h3>
                    <span className="text-[11px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5 inline-block mt-1">
                      Map: {sData.map}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-widest animate-pulse bg-black/50 px-2 py-1 rounded backdrop-blur-sm">ONLINE</span>
                </div>
              </div>

              <div className="p-6 md:p-7 flex flex-col gap-6 flex-grow">
                
                {/* --- SECȚIUNEA FIXĂ DE SUS (Info + Butoane) --- */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-primary-dim transition-colors">
                      {sId === 3 ? 'Competitive Hub' : 'Public System'}
                    </span>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-3xl font-black font-headline text-white drop-shadow-md">{sData.players}<span className="text-zinc-600">/{sData.maxplayers}</span></span>
                      <div className="h-1 w-20 bg-white/5 mt-1.5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-primary-dim transition-all duration-1000 ease-out shadow-[0_0_8px_#e90036]" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* IP Box */}
                  <div 
                    onClick={() => copyToClipboard(ip)}
                    className="bg-black/40 p-3.5 rounded-lg flex items-center justify-between border border-white/5 hover:border-primary-dim/30 hover:bg-black/70 transition-all cursor-pointer group/btn"
                    title="Click to copy server IP"
                  >
                    <code className="text-[11px] font-mono text-gray-400 group-hover/btn:text-white transition-colors">{ip}</code>
                    <span className="text-[9px] font-bold text-primary-dim uppercase tracking-[0.2em] border border-primary-dim/20 px-2 py-1 rounded">Copy</span>
                  </div>

                  {/* Connect Now Button - MUTAT AICI */}
                  <a href={`steam://connect/${ip}`} className="w-full block text-center bg-primary-dim hover:bg-white hover:text-black text-white py-3.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg shadow-primary-dim/10 hover:shadow-white/5">
                    Connect Now
                  </a>
                </div>

                {/* --- RENDER CONDIȚIONAL LISTE (Containerul Flexibil) --- */}
                <div className="bg-black/25 rounded-xl p-5 border border-white/5 grid grid-cols-2 gap-x-6 gap-y-5 shadow-inner mt-auto">
                  <PlayerColumn title="T" players={terrorists} color="text-primary-container" />
                  <PlayerColumn title="CT" players={counterTerrorists} color="text-secondary-fixed-dim" />
                  
                  {/* Apar DOAR dacă array-ul are lungime mai mare de 0 */}
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

      {/* STATS BENTO */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-20 relative z-10">
        <div className="md:col-span-2 bg-surface-container-low/40 border border-white/10 p-10 rounded-xl flex flex-col justify-between min-h-[180px] hover:bg-primary-dim/5 transition-colors duration-700 group">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-headline group-hover:text-primary-dim transition-colors">Neural Network Population</span>
          <div className="flex items-baseline gap-6">
            <span className="text-8xl font-black font-headline text-white tracking-tighter">
              {totalPlayers.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="bg-surface-container-highest/20 backdrop-blur-md border border-white/5 p-10 rounded-xl flex flex-col justify-between hover:border-white/20 transition-all group">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-headline group-hover:text-white transition-colors">Network Rank</span>
          <span className="text-6xl font-black font-headline text-white tracking-tighter transition-transform duration-500 group-hover:scale-110">#01</span>
        </div>
        
        <Link to="/maps" className="bg-surface-container-highest/20 backdrop-blur-md border border-white/5 p-10 rounded-xl flex flex-col justify-between hover:border-primary-dim/30 hover:bg-primary-dim/5 transition-all group cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 font-headline group-hover:text-primary-dim transition-colors">Map Repository</span>
            <span className="material-symbols-outlined text-gray-500 group-hover:text-primary-dim transition-colors text-sm">arrow_outward</span>
          </div>
          <span className="text-6xl font-black font-headline text-white tracking-tighter transition-transform duration-500 group-hover:scale-110">{slideshowImages.length}</span>
        </Link>
      </section>

    </div>
  );
}
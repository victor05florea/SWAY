import React, { useState, useEffect } from 'react';

export default function Home() {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [servers, setServers] = useState([]);

  const mapImages = [
    "25I5jOZ.png", "avenue.jpg", "backlot.jpg", "devblocks_remake.jpg", "freeway.jpg", 
    "mini_bbcity.jpg", "mini_floppy.jpg", "mini_rooftops.jpg", 
    "rooft0ps_remake.jpg", "tourney_jukecity.jpg", "mini_tyo.jpg", "trickpark.jpg", 
    "bbcity_boost.jpg", "skyline.jpg", "dust2 boost.jpg", "qube.jpg", "boostmafia.jpg", 
    "jukecity_boost.jpg", "oilrig.jpg", "miami.jpg", "half.jpg", "sunset.jpg", 
    "rooftops.jpg", "rooftops_v5.jpg", "virtual.jpg", "iceskating.jpg", "jhard.jpg", 
    "zen.jpg", "ruins.jpg", "liberation.jpg", "kitty_pro.jpg", "funk.jpg", "flowtown.jpg", 
    "floppytown.jpg", "esip.jpg", "brickworld.jpg", "bakgard.jpg", "assault_inside.jpg", 
    "jukecity.jpg", "devblocks.jpg", "tyo.jpg", "bbcity.jpg"
  ];

  useEffect(() => {
    fetch("http://localhost:8080/api/players/all")
      .then(res => res.json())
      .then(data => setTotalPlayers(data.length));

    const fetchServers = () => {
      fetch("http://localhost:8080/api/players/status")
        .then(res => res.json())
        .then(data => setServers(data));
    };

    fetchServers();
    const interval = setInterval(fetchServers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getServerData = (id) => {
    return servers.find(s => s.server === id) || { name: "Loading...", map: "---", players: "0", maxplayers: "32" };
  };

  const copyToClipboard = (ip) => {
    navigator.clipboard.writeText(ip);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-8 animate-fade-in">
      
      <style>{`
        @keyframes slideshow {
            0% { opacity: 0; transform: scale(1.05); }
            5% { opacity: 1; }
            20% { opacity: 1; }
            25% { opacity: 0; transform: scale(1); }
            100% { opacity: 0; }
        }
        .slideshow-container { position: fixed; inset: 0; z-index: -10; background: #0e0e11; overflow: hidden; }
        .slide { 
            position: absolute; inset: 0; background-size: cover; background-position: center; 
            opacity: 0; animation: slideshow 40s linear infinite; 
            filter: brightness(0.2) blur(2px);
        }
      `}</style>

      <div className="slideshow-container">
        {mapImages.map((img, index) => (
          <div 
            key={index} 
            className="slide" 
            style={{ 
              backgroundImage: `url(/images/${img})`, 
              animationDelay: `${index * 4}s`,
              animationDuration: `${mapImages.length * 4}s` 
            }}
          />
        ))}
      </div>

      {/* HERO SECTION - REPROIECTAT PENTRU ACRONIM ALINIAT */}
      <section className="mb-24 pt-20 flex flex-col items-start">
        
        {/* Container pentru SWAY + Acronim */}
        <div className="flex font-headline font-black tracking-tighter leading-none select-none">
          {/* S - Seekers */}
          <div className="flex flex-col items-center">
            <span className="text-9xl md:text-[11rem] text-primary-dim">S</span>
            <span className="text-[10px] md:text-xs tracking-widest text-primary-dim/60 uppercase font-bold -mt-2 md:-mt-4">Seekers</span>
          </div>
          
          {/* W - Wonder */}
          <div className="flex flex-col items-center">
            <span className="text-9xl md:text-[11rem] text-primary-dim">W</span>
            <span className="text-[10px] md:text-xs tracking-widest text-primary-dim/60 uppercase font-bold -mt-2 md:-mt-4">Wonder</span>
          </div>

          {/* A - About */}
          <div className="flex flex-col items-center">
            <span className="text-9xl md:text-[11rem] text-primary-dim">A</span>
            <span className="text-[10px] md:text-xs tracking-widest text-primary-dim/60 uppercase font-bold -mt-2 md:-mt-4">About</span>
          </div>

          {/* Y - You */}
          <div className="flex flex-col items-center">
            <span className="text-9xl md:text-[11rem] text-primary-dim">Y</span>
            <span className="text-[10px] md:text-xs tracking-widest text-primary-dim/60 uppercase font-bold -mt-2 md:-mt-4">You</span>
          </div>
        </div>

        <div className="mt-12 space-y-2 border-l-2 border-primary-dim pl-6">
          <p className="max-w-xl text-gray-300 font-headline font-medium text-lg leading-relaxed tracking-wide italic">
            We are like a bunker! We got everything you need.
          </p>
          <p className="max-w-xl text-gray-400 font-headline font-light leading-relaxed tracking-wide italic">
            The most unique Hide'N'Seek server that ever existed!
          </p>
        </div>
      </section>

      {/* SERVERS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        {[1, 2, 3].map((sId) => {
          const sData = getServerData(sId);
          const percentage = (parseInt(sData.players) / parseInt(sData.maxplayers)) * 100;
          const ip = sId === 1 ? 'hns.sway.ro:27015' : sId === 2 ? 'nopre.sway.ro:27015' : 'mix.sway.ro:27015';

          return (
            <div key={sId} className="group relative bg-surface-container-low/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${sId === 1 ? 'bg-primary-dim' : 'bg-gray-600'}`}></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                      {sId === 3 ? 'Competitive' : 'Public Server'}
                    </span>
                    <h3 className="font-headline text-2xl font-black text-white tracking-tight uppercase">{sData.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black font-headline text-white">{sData.players}<span className="text-gray-600">/{sData.maxplayers}</span></span>
                    <div className="h-1 w-24 bg-white/5 mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-dim transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                   <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] uppercase text-gray-500">Current Map</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{sData.map}</span>
                   </div>
                   <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] uppercase text-gray-500">Tickrate</span>
                      <span className="text-[10px] font-bold text-gray-300">100 Tick</span>
                   </div>
                </div>
                
                <div 
                  onClick={() => copyToClipboard(ip)}
                  className="bg-black/20 p-4 rounded flex items-center justify-between mb-6 cursor-pointer border border-white/5 hover:border-primary-dim/30 transition-all"
                >
                  <code className="text-xs font-mono text-gray-400">{ip}</code>
                  <span className="text-[9px] font-bold text-primary-dim uppercase tracking-widest">Copy</span>
                </div>

                <a href={`steam://connect/${ip}`} className="w-full block text-center bg-primary-dim hover:bg-red-700 text-white py-4 rounded font-black uppercase tracking-widest text-xs transition-all">
                  Join Game
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
        <div className="md:col-span-2 bg-surface-container-low/40 border border-white/10 p-8 rounded-xl flex flex-col justify-between min-h-[180px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-headline">Unique Operators</span>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-black font-headline text-white tracking-tighter">
              {totalPlayers.toLocaleString()}
            </span>
            <span className="text-primary-dim font-bold text-xs tracking-widest animate-pulse underline decoration-2 offset-4">LIVE SYNC</span>
          </div>
        </div>
        
        <div className="bg-surface-container-highest/40 border border-white/5 p-8 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-headline">Network Rank</span>
          <span className="text-5xl font-black font-headline text-white tracking-tighter">#01</span>
        </div>
        
        <div className="bg-surface-container-highest/40 border border-white/5 p-8 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-headline">HNS Maps</span>
          <span className="text-5xl font-black font-headline text-white tracking-tighter">{mapImages.length}</span>
        </div>
      </section>

    </div>
  );
}
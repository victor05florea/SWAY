import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mode, setMode] = useState("HNS");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("KILLS"); 
  const [sortDirection, setSortDirection] = useState("DESC");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetch('http://localhost:8080/api/players/all')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Eroare la aducerea jucatorilor:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (mode === "HNS") setSortOrder("KILLS");
    if (mode === "MIX") setSortOrder("ELO");
  }, [mode, searchTerm]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-headline text-primary-dim text-2xl animate-pulse tracking-widest uppercase">Loading Database Records...</div>;

  // 1. Filtrare mod (MIX / HNS) pe baza întregii liste
  let baseData = players;
  if (mode === "MIX") {
    baseData = baseData.filter(p => (p.mixgames || p.mixGames || 0) > 0);
  }

  // 2. Sortare completă a listei de bază
  baseData = [...baseData].sort((a, b) => {
    let valA = 0; let valB = 0;
    if (mode === "HNS") {
      if (sortOrder === "KILLS") { valA = a.kills || 0; valB = b.kills || 0; } 
      else if (sortOrder === "WEEKTIME") { valA = a.weektime || 0; valB = b.weektime || 0; }
    } else if (mode === "MIX") {
      if (sortOrder === "ELO") { valA = a.mixelo || a.mixElo || 0; valB = b.mixelo || b.mixElo || 0; } 
      else if (sortOrder === "GAMES") { valA = a.mixgames || a.mixGames || 0; valB = b.mixgames || b.mixGames || 0; } 
      else if (sortOrder === "WON") { valA = a.mixwon || a.mixWon || 0; valB = b.mixwon || b.mixWon || 0; } 
      else if (sortOrder === "DISCONNECTS") { valA = a.mixdisconnects || a.mixDisconnects || 0; valB = b.mixdisconnects || b.mixDisconnects || 0; } 
      else if (sortOrder === "STABS") { valA = a.mixtotalstabs || a.mixTotalStabs || 0; valB = b.mixtotalstabs || b.mixTotalStabs || 0; }
    }
    return sortDirection === "DESC" ? valB - valA : valA - valB;
  });

  // 3. Atribuim Rank-ul Global ADEVĂRAT înainte de a căuta (index + 1)
  baseData = baseData.map((p, index) => ({ ...p, trueRank: index + 1 }));

  // 4. Căutare (Acum rank-ul real este salvat în interiorul obiectului)
  let processedData = baseData.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.steamid && p.steamid.toString().includes(searchTerm))
  );

  // 5. Paginare
  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlayers = processedData.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const formatNumber = (num) => num ? Number(num).toLocaleString('de-DE') : '0';

  const getRoleBadges = (player) => {
    const roleStr = (player.role || player.status || player.admin || "").toString().toLowerCase();
    const isVip = player.vip && parseInt(player.vip) > 0;
    
    let badges = [];

    if (roleStr.includes('developer') || roleStr.includes('dev')) {
      badges.push(<span key="dev" className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-1 font-bold uppercase tracking-widest">Developer</span>);
    }
    
    if (roleStr.includes('head admin')) {
      badges.push(<span key="hadmin" className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-1 font-bold uppercase tracking-widest">Head Admin</span>);
    } else if (roleStr.includes('admin') || roleStr === "1") {
      badges.push(<span key="admin" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 font-bold uppercase tracking-widest">Admin</span>);
    }

    if (isVip) {
      badges.push(<span key="vip" className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 font-bold uppercase tracking-widest">VIP</span>);
    }

    // Daca nu are nimic, returnam un div gol ca sa nu apara cuvantul "Player"
    if (badges.length === 0) return null;

    return <div className="flex flex-wrap justify-center gap-1">{badges}</div>;
  };

  // Paginare normală (stil clasic)
  const renderPaginationLinks = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">
          1
        </button>
      );
      if (startPage > 2) pages.push(<span key="dots1" className="text-gray-500 px-1">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === i ? 'bg-primary-dim text-white border-primary-dim shadow-lg' : 'bg-surface-container-highest border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="text-gray-500 px-1">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in min-h-screen flex flex-col">
      
      <div className="border-b border-primary-dim/30 pb-6 flex flex-col md:flex-row justify-between items-end gap-6 shrink-0">
        <div>
          <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
            Server <span className="text-primary-dim">Rankings</span>
          </h1>
          <p className="text-[16px] text-gray-500 font-headline tracking-[0.1em] uppercase mt-2">
            <span className="text-primary-dim">{players.length}</span> unique players
          </p>
        </div>
        
        <div className="flex bg-surface-container-low border border-white/10 p-1.5 rounded-sm">
           <button 
              onClick={() => setMode("HNS")}
              className={`px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.2em] transition-all ${mode === "HNS" ? "bg-primary-dim text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
           >
              Public HNS
           </button>
           <button 
              onClick={() => setMode("MIX")}
              className={`px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.2em] transition-all ${mode === "MIX" ? "bg-primary-dim text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
           >
              Competitive Mix
           </button>
        </div>
      </div>

      <div className="bg-surface-container-low/40 border border-white/5 p-4 flex flex-col md:flex-row gap-4 shrink-0">
        <input 
          type="text" 
          placeholder="SEARCH PLAYER... (by name or steamid)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-surface-container-highest border border-white/10 text-white font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim transition-colors uppercase tracking-widest placeholder:text-gray-600"
        />
        
        <button 
          onClick={() => setSortDirection(prev => prev === "DESC" ? "ASC" : "DESC")}
          className="bg-surface-container-highest border border-white/10 text-gray-300 hover:text-white font-headline text-xs px-4 py-3 focus:outline-none uppercase tracking-widest cursor-pointer transition-colors"
        >
          {sortDirection === "DESC" ? "▼ DESC" : "▲ ASC"}
        </button>

        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-surface-container-highest border border-white/10 text-gray-300 font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer min-w-[200px]"
        >
          {mode === "HNS" ? (
            <>
              <option value="KILLS" className="bg-[#121212] text-white">SORT BY KILLS</option>
              <option value="WEEKTIME" className="bg-[#121212] text-white">SORT BY WEEKLY TIME</option>
            </>
          ) : (
            <>
              <option value="ELO" className="bg-[#121212] text-white">SORT BY MIX ELO</option>
              <option value="GAMES" className="bg-[#121212] text-white">SORT BY MIX GAMES</option>
              <option value="WON" className="bg-[#121212] text-white">SORT BY WINS</option>
              <option value="DISCONNECTS" className="bg-[#121212] text-white">SORT BY DISCONNECTS</option>
              <option value="STABS" className="bg-[#121212] text-white">SORT BY STABS</option>
            </>
          )}
        </select>
      </div>

      <div className="flex-1 overflow-x-auto border border-white/10 bg-surface-container-low/30">
        <table className="w-full text-left font-mono whitespace-nowrap">
          {/* Aici am mărit fonturile la text-[12px] și font-bold */}
          <thead className="bg-surface-container-highest border-b border-white/10 text-gray-400 text-[12px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 w-16 text-center">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-center">Status</th>
              
              {mode === "HNS" ? (
                <>
                  <th className="px-6 py-4 text-center">Total Kills</th>
                  <th className="px-6 py-4 text-right">Weekly Time</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-center">Mix Games</th>
                  <th className="px-6 py-4 text-center">Mix Won</th>
                  <th className="px-6 py-4 text-center">Disconnects</th>
                  <th className="px-6 py-4 text-center">Stabs</th>
                  <th className="px-6 py-4 text-right text-primary-dim">Mix Elo</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300 text-[15px]">
            {currentPlayers.map((player, index) => {
              return (
                <tr key={player.id || index} className="hover:bg-white/[0.03] transition-colors group">
                  
                  {/* AFISARE RANK ADEVĂRAT */}
                  <td className="px-6 py-5 text-center font-bold text-gray-500">
                    {player.trueRank}
                  </td>

                  <td className="px-6 py-5">
                    <Link 
                      to={`/profile/${player.steamid || player.steamId}`} 
                      className="flex items-center gap-4 cursor-pointer"
                    >
                      {player.country && player.country.length > 0 && player.country !== 'un' ? (
                        <img 
                          src={`https://community.fastly.steamstatic.com/public/images/countryflags/${player.country.toLowerCase()}.gif`} 
                          alt={player.country} 
                          className="w-[24px] h-[18px] shadow-[0_0_5px_rgba(0,0,0,0.5)] opacity-90 group-hover:opacity-100 transition-opacity"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <span className="text-[10px] text-gray-600 uppercase border border-white/5 px-1 bg-white/5">UNK</span>
                      )}

                      <img 
                        src={player.avatarurl || player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundColor=e90036`} 
                        alt="avatar" 
                        className="w-10 h-10 object-cover border border-white/10 group-hover:border-primary-dim transition-colors"
                      />
                      
                      <span className="font-headline font-bold text-white uppercase text-[17px] truncate max-w-[250px] group-hover:text-primary-dim transition-colors">
                        {player.name}
                      </span>
                    </Link>
                  </td>

                  <td className="px-6 py-5 text-center">
                    {getRoleBadges(player)}
                  </td>

                  {mode === "HNS" && (
                    <>
                      <td className="px-6 py-5 text-center font-bold text-gray-300">
                        {formatNumber(player.kills)}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-white">
                        {((player.weektime || 0) / 3600).toFixed(1)} <span className="text-xs text-gray-600 ml-1">HRS</span>
                      </td>
                    </>
                  )}

                  {mode === "MIX" && (
                    <>
                      <td className="px-6 py-5 text-center text-gray-300 font-bold">{formatNumber(player.mixgames || player.mixGames)}</td>
                      <td className="px-6 py-5 text-center text-emerald-400 font-bold">{formatNumber(player.mixwon || player.mixWon)}</td>
                      <td className="px-6 py-5 text-center text-red-500 font-bold">{formatNumber(player.mixdisconnects || player.mixDisconnects)}</td>
                      <td className="px-6 py-5 text-center text-gray-400 font-bold">{formatNumber(player.mixtotalstabs || player.mixTotalStabs)}</td>
                      <td className="px-6 py-5 text-right font-black text-primary-dim text-[18px] drop-shadow-md">{formatNumber(player.mixelo || player.mixElo)}</td>
                    </>
                  )}

                </tr>
              );
            })}
          </tbody>
        </table>

        {currentPlayers.length === 0 && (
          <div className="w-full py-16 text-center">
            <p className="font-headline text-primary-dim text-xl uppercase tracking-widest">No matching records found.</p>
          </div>
        )}
      </div>

      {/* PAGINARE CLASICĂ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center border-t border-white/10 pt-8 shrink-0">
           <div className="flex items-center gap-2">
             <button 
               onClick={goToPrevPage} 
               disabled={currentPage === 1}
               className="h-8 md:h-10 px-3 md:px-4 border border-white/10 bg-surface-container-highest text-white font-headline text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors flex items-center"
             >
               &larr; PREV
             </button>
             
             <div className="flex gap-1 md:gap-2 mx-2">
               {renderPaginationLinks()}
             </div>

             <button 
               onClick={goToNextPage} 
               disabled={currentPage === totalPages}
               className="h-8 md:h-10 px-3 md:px-4 border border-white/10 bg-surface-container-highest text-white font-headline text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors flex items-center"
             >
               NEXT &rarr;
             </button>
           </div>
        </div>
      )}

    </div>
  );
}
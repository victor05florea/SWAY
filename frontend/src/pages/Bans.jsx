import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Bans() {
  const [cheaters, setCheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReason, setFilterReason] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetch('http://localhost:8080/api/cheaters')
      .then(res => res.json())
      .then(data => {
        setCheaters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Eroare la baza de date de bans:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterReason, sortOrder]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-headline text-primary-dim text-2xl animate-pulse tracking-widest uppercase">Loading Database Records...</div>;

  let processedData = cheaters.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.steamid && c.steamid.toString().includes(searchTerm))
  );

  if (filterReason !== "ALL") {
    processedData = processedData.filter(c => {
      if (filterReason === "BHOP") return c.bhophack > 0;
      if (filterReason === "GSTRAFE") return c.gstrafehack > 0;
      if (filterReason === "STRAFE") return c.strafehack > 0;
      if (filterReason === "DLL") return c.dll > 0;
      if (filterReason === "MANUAL") return c.bhophack === 0 && c.gstrafehack === 0 && c.strafehack === 0 && c.dll === 0;
      return true;
    });
  }

  processedData = [...processedData].sort((a, b) => {
    return sortOrder === "NEWEST" ? b.id - a.id : a.id - b.id;
  });

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCheaters = processedData.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const renderCrimes = (cheater) => {
    const crimes = [];
    if (cheater.bhophack > 0) crimes.push("Bhop Script");
    if (cheater.gstrafehack > 0) crimes.push("G-Strafe Hack");
    if (cheater.strafehack > 0) crimes.push("Strafe Optimizer");
    if (cheater.dll > 0) crimes.push("DLL Injection");

    if (crimes.length === 0) crimes.push("Manual Ban");

    return crimes.map((crime, idx) => (
      <span key={idx} className="text-[10px] bg-primary-dim/10 text-primary-dim border border-primary-dim/30 px-1.5 py-0.5 font-bold uppercase tracking-widest whitespace-nowrap">
        {crime}
      </span>
    ));
  };

  const renderBanStatus = (bannedVal) => {
    if (bannedVal === 0) {
      return (
        <span className="inline-block text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-600/30 px-2 py-1 bg-white/5">
          UNBANNED
        </span>
      );
    } else if (bannedVal === 1 || bannedVal === 2) {
      return (
        <span className="inline-block text-[10px] font-bold text-primary-dim uppercase tracking-widest border border-primary-dim/30 px-2 py-1 bg-primary-dim/10 animate-pulse">
          PERMANENT
        </span>
      );
    } else if (bannedVal > 2) {
      const date = new Date(bannedVal * 1000);
      const formattedDate = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      return (
        <span className="inline-block text-[10px] font-bold text-yellow-500 uppercase tracking-widest border border-yellow-500/30 px-2 py-1 bg-yellow-500/10">
          UNTIL {formattedDate}
        </span>
      );
    }
    return <span className="inline-block text-[10px] text-gray-500">UNKNOWN</span>;
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
            Hall of <span className="text-primary-dim">Shame</span>
          </h1>
          <p className="text-[16px] text-gray-500 font-headline tracking-[0.1em] uppercase mt-2">
            <span className="text-red-500">{cheaters.length}</span> BANNED PLAYERS
          </p>
        </div>
      </div>

      <div className="bg-surface-container-low/40 border border-white/5 p-4 flex flex-col md:flex-row gap-4 shrink-0">
        <input 
          type="text" 
          placeholder="SEARCH OFFENDER..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-surface-container-highest border border-white/10 text-white font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim transition-colors uppercase tracking-widest placeholder:text-gray-600"
        />
        
        <select 
          value={filterReason} 
          onChange={(e) => setFilterReason(e.target.value)}
          className="bg-surface-container-highest border border-white/10 text-gray-300 font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer"
        >
          <option value="ALL" className="bg-[#121212] text-white">ALL REASONS</option>
          <option value="DLL" className="bg-[#121212] text-white">DLL INJECTION</option>
          <option value="BHOP" className="bg-[#121212] text-white">BHOP SCRIPT</option>
          <option value="GSTRAFE" className="bg-[#121212] text-white">G-STRAFE HACK</option>
          <option value="STRAFE" className="bg-[#121212] text-white">STRAFE OPTIMIZER</option>
          <option value="MANUAL" className="bg-[#121212] text-white">MANUAL BANS</option>
        </select>

        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-surface-container-highest border border-white/10 text-gray-300 font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer"
        >
          <option value="NEWEST" className="bg-[#121212] text-white">NEWEST FIRST</option>
          <option value="OLDEST" className="bg-[#121212] text-white">OLDEST FIRST</option>
        </select>
      </div>

      <div className="flex-1 overflow-x-auto border border-white/10 bg-surface-container-low/30">
        <table className="w-full text-left font-mono whitespace-nowrap">
          {/* FONT MĂRIT LA th: text-[12px] font-bold */}
          <thead className="bg-surface-container-highest border-b border-white/10 text-gray-400 text-[12px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Using</th>
              <th className="px-6 py-4 text-center w-[150px]">Status</th>
              <th className="px-6 py-4 text-right">Date of Ban</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300 text-[15px]">
            {currentCheaters.map((cheater) => (
              <tr key={cheater.id} className="hover:bg-white/[0.03] transition-colors group">
                
                <td className="px-6 py-5">
                  <Link 
                    to={`/profile/${cheater.steamid}`} 
                    className="flex items-center gap-4 cursor-pointer"
                    title="View Sway Profile"
                  >
                    {cheater.country && cheater.country.length > 0 ? (
                      <img 
                        src={`https://community.fastly.steamstatic.com/public/images/countryflags/${cheater.country.toLowerCase()}.gif`} 
                        alt={cheater.country} 
                        className="w-[24px] h-[18px] shadow-[0_0_5px_rgba(0,0,0,0.5)] opacity-90 group-hover:opacity-100 transition-opacity"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                    ) : (
                      <span className="text-[10px] text-gray-600 uppercase border border-white/5 px-1 bg-white/5">UNK</span>
                    )}

                    <img 
                      src={cheater.avatarurl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cheater.name}&backgroundColor=e90036`} 
                      alt="avatar" 
                      className="w-10 h-10 object-cover border border-primary-dim/30 grayscale opacity-80 group-hover:grayscale-0 group-hover:border-primary-dim transition-all"
                    />
                    
                    <span className="font-headline font-bold text-white uppercase text-[17px] truncate max-w-[200px] group-hover:text-primary-dim transition-colors">
                      {cheater.name}
                    </span>
                  </Link>
                </td>

                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    {renderCrimes(cheater)}
                  </div>
                </td>

                <td className="px-6 py-5 text-center">
                  {renderBanStatus(cheater.banned)}
                </td>

                <td className="px-6 py-5 text-sm text-gray-500 font-bold text-right">
                  {cheater.date || 'UNKNOWN'}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {currentCheaters.length === 0 && (
          <div className="w-full py-16 text-center">
            <p className="font-headline text-primary-dim text-xl uppercase tracking-widest">No matching records found.</p>
          </div>
        )}
      </div>

      {/* PAGINARE CLASICĂ (la fel ca la Leaderboard) */}
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
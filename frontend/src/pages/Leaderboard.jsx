import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const getSteamId64 = (rawId) => {
  if (!rawId) return "";
  let idStr = String(rawId).trim();
  try {
    const steam64Base = BigInt("76561197960265728"); 
    
    if (idStr.toLowerCase().startsWith("steam_")) {
      const parts = idStr.split(":");
      if (parts.length === 3) {
        const y = BigInt(parts[1]);
        const z = BigInt(parts[2]);
        return ((z * BigInt(2)) + y + steam64Base).toString(); 
      }
    }
    if (/^\d+$/.test(idStr) && idStr.length < 16) {
      return (BigInt(idStr) + steam64Base).toString();
    }
  } catch (e) {
    return "";
  }
  return idStr; 
};

const steamToAccountId = (steamId) => {
  if (!steamId) return "";
  const idStr = String(steamId).trim().toLowerCase();
  if (idStr.startsWith("steam_")) {
    const parts = idStr.split(":");
    if (parts.length === 3) {
      const y = parseInt(parts[1], 10);
      const z = parseInt(parts[2], 10);
      return (z * 2 + y).toString();
    }
  }
  return idStr;
};

const steamToSteam2Z = (steamId) => {
  if (!steamId) return "";
  const idStr = String(steamId).trim();
  if (idStr.toLowerCase().startsWith("steam_")) {
    const parts = idStr.split(":");
    if (parts.length === 3) {
      return String(parts[2]);
    }
  }
  return "";
};

const resolveJumpStats = (map, rawSteamId) => {
  if (!rawSteamId) return null;
  const raw = String(rawSteamId).trim().toLowerCase();
  const candidates = [raw];

  const accountId = steamToAccountId(rawSteamId);
  if (accountId) candidates.push(String(accountId).toLowerCase());

  const steam2z = steamToSteam2Z(rawSteamId);
  if (steam2z) candidates.push(String(steam2z).toLowerCase());

  if (/^\d+$/.test(raw)) {
    const asNum = Number(raw);
    if (Number.isFinite(asNum) && asNum > 0) {
      candidates.push(String(Math.floor(asNum / 2)));
      candidates.push(String(asNum * 2));
      candidates.push(String(asNum * 2 + 1));
    }
  }

  for (const key of candidates) {
    if (map[key]) return map[key];
  }
  return null;
};

const parseNum = (val) => {
  if (val === null || val === undefined) return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

const getStatsObject = (player, server) => {
  if (!player) return {};
  if (server === "pre") return player.jumpStatsPre || player.jumpstatspre || {};
  return player.jumpStatsNoPre || player.jumpstatsnopre || {};
};

const getJumpDistance = (p, server, type) => {
  const stats = getStatsObject(p, server);
  switch(type) {
    case 'LONGJUMP': return parseNum(stats.longjump || stats.ljRecord || stats.LJ_record);
    case 'COUNTJUMP': return parseNum(stats.countjump || stats.cjRecord || stats.CJ_record);
    case 'BHOP': return parseNum(stats.bhop || stats.bjRecord || stats.BJ_record);
    case 'WEIRDJUMP': return parseNum(stats.wjRecord || stats.WJ_record);
    case 'LADDERJUMP': return parseNum(stats.lajRecord || stats.LAJ_record);
    case 'DROPBHOP': return parseNum(stats.dsbjRecord || stats.DBJ_record);
    case 'LJBLOCK': return parseNum(stats.lbrRecord || stats.LJB_record);
    default: return 0;
  }
};

const getJumpStrafes = (p, server, type) => {
  const stats = getStatsObject(p, server);
  switch(type) {
    case 'LONGJUMP': return parseNum(stats.ljStrafes || stats.LJ_strafes);
    case 'COUNTJUMP': return parseNum(stats.cjStrafes || stats.CJ_strafes);
    case 'BHOP': return parseNum(stats.bjStrafes || stats.BJ_strafes);
    case 'WEIRDJUMP': return parseNum(stats.wjStrafes || stats.WJ_strafes);
    case 'LADDERJUMP': return parseNum(stats.lajStrafes || stats.LAJ_strafes);
    case 'DROPBHOP': return parseNum(stats.dsbjStrafes || stats.DBJ_strafes);
    case 'LJBLOCK': return parseNum(stats.lbrStrafes || stats.LJB_strafes);
    default: return 0;
  }
};

const getJumpSync = (p, server, type) => {
  const stats = getStatsObject(p, server);
  switch(type) {
    case 'LONGJUMP': return parseNum(stats.ljSync || stats.LJ_sync);
    case 'COUNTJUMP': return parseNum(stats.cjSync || stats.CJ_sync);
    case 'BHOP': return parseNum(stats.bjSync || stats.BJ_sync);
    case 'WEIRDJUMP': return parseNum(stats.wjSync || stats.WJ_sync);
    case 'LADDERJUMP': return parseNum(stats.lajSync || stats.LAJ_sync);
    case 'DROPBHOP': return parseNum(stats.dsbjSync || stats.DBJ_sync);
    case 'LJBLOCK': return parseNum(stats.lbrSync || stats.LJB_sync);
    default: return 0;
  }
};

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [jumpPlayers, setJumpPlayers] = useState([]);
  const [jumpDataLoaded, setJumpDataLoaded] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPagesFromApi, setTotalPagesFromApi] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [mode, setMode] = useState("HNS"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  const [sortOrder, setSortOrder] = useState("KILLS"); 
  const [sortDirection, setSortDirection] = useState("DESC");

  const [jumpServer, setJumpServer] = useState("pre");
  const [jumpType, setJumpType] = useState("LONGJUMP");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    if (mode === "JUMPS") return;
    setLoading(true);

    const sortMap = {
      KILLS: "kills",
      WEEKTIME: "time",
      ELO: "mixelo",
      GAMES: "mixgames",
      WON: "mixwon",
      DISCONNECTS: "mixdisconnects",
      STABS: "mixtotalstabs"
    };

    // Fallback puternic pentru MIX
    const fallbackSort = mode === "MIX" ? "mixelo" : "kills";
    const sortBy = sortMap[sortOrder] || fallbackSort;
    
    const params = new URLSearchParams({
      mode,
      page: String(Math.max(currentPage - 1, 0)),
      size: String(itemsPerPage),
      sortBy,
      direction: sortDirection,
      search: searchTerm.trim()
    });

    fetch(`/api/players/page?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error("Nu s-a putut încărca leaderboard.");
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data.content)) {
          throw new Error("Răspuns invalid pentru leaderboard paginat.");
        }
        setPlayers(data.content);
        setTotalPlayers(Number(data.totalElements) || 0);
        setTotalPagesFromApi(Math.max(Number(data.totalPages) || 1, 1));
        setLoading(false);

        if (data.hasNext) {
          const prefetchParams = new URLSearchParams({
            mode,
            page: String(Math.max(currentPage, 0)),
            size: String(itemsPerPage),
            sortBy,
            direction: sortDirection,
            search: searchTerm.trim()
          });
          fetch(`/api/players/page?${prefetchParams.toString()}`).catch(() => {});
        }
      })
      .catch(err => {
        console.error("Eroare la aducerea datelor:", err);
        // Fallback stil Hall of Shame: endpoint simplu, randare locală.
        fetch('/api/players/all')
          .then(res => res.ok ? res.json() : [])
          .then(allPlayers => {
            const term = searchTerm.trim().toLowerCase();
            let filtered = Array.isArray(allPlayers) ? allPlayers : [];

            if (mode === "MIX") {
              filtered = filtered.filter(p => (p.mixgames || p.mixGames || 0) > 0);
            }

            if (term) {
              filtered = filtered.filter(p => String(p.name || "").toLowerCase().includes(term));
            }

            const comparator = (a, b) => {
              const dir = sortDirection === "ASC" ? 1 : -1;
              if (mode === "MIX") {
                const getVal = (obj, key1, key2) => Number(obj[key1] || obj[key2] || 0);
                if (sortOrder === "ELO" || !sortMap[sortOrder]) return (getVal(a, 'mixelo', 'mixElo') - getVal(b, 'mixelo', 'mixElo')) * dir;
                if (sortOrder === "GAMES") return (getVal(a, 'mixgames', 'mixGames') - getVal(b, 'mixgames', 'mixGames')) * dir;
                if (sortOrder === "WON") return (getVal(a, 'mixwon', 'mixWon') - getVal(b, 'mixwon', 'mixWon')) * dir;
                if (sortOrder === "DISCONNECTS") return (getVal(a, 'mixdisconnects', 'mixDisconnects') - getVal(b, 'mixdisconnects', 'mixDisconnects')) * dir;
                if (sortOrder === "STABS") return (getVal(a, 'mixtotalstabs', 'mixTotalStabs') - getVal(b, 'mixtotalstabs', 'mixTotalStabs')) * dir;
              }
              if (sortOrder === "WEEKTIME") return ((a.time || a.weektime || 0) - (b.time || b.weektime || 0)) * dir;
              return ((a.kills || 0) - (b.kills || 0)) * dir;
            };

            filtered = [...filtered].sort(comparator);
            const localTotal = filtered.length;
            const from = Math.max(currentPage - 1, 0) * itemsPerPage;
            const pageItems = filtered.slice(from, from + itemsPerPage);

            setPlayers(pageItems);
            setTotalPlayers(localTotal);
            setTotalPagesFromApi(Math.max(Math.ceil(localTotal / itemsPerPage), 1));
            setLoading(false);
          })
          .catch(() => {
            setPlayers([]);
            setTotalPlayers(0);
            setTotalPagesFromApi(1);
            setLoading(false);
          });
      });
  }, [mode, currentPage, sortOrder, sortDirection, searchTerm]);

  useEffect(() => {
    if (mode !== "JUMPS" || jumpDataLoaded) return;
    setLoading(true);
    Promise.all([
      fetch('/api/players/all').then(res => res.json()),
      fetch('/api/jumps/pre').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/jumps/nopre').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/cheaters').then(res => res.ok ? res.json() : []).catch(() => [])
    ])
      .then(([playersData, preData, nopreData, cheatersData]) => {
        const preMap = {};
        preData.forEach(j => {
          if (!j.steamid) return;
          const accountId = steamToAccountId(j.steamid);
          const steam2z = steamToSteam2Z(j.steamid);
          if (accountId) preMap[String(accountId).toLowerCase()] = j;
          if (steam2z) preMap[String(steam2z).toLowerCase()] = j;
          preMap[String(j.steamid).toLowerCase()] = j;
        });

        const nopreMap = {};
        nopreData.forEach(j => {
          if (!j.steamid) return;
          const accountId = steamToAccountId(j.steamid);
          const steam2z = steamToSteam2Z(j.steamid);
          if (accountId) nopreMap[String(accountId).toLowerCase()] = j;
          if (steam2z) nopreMap[String(steam2z).toLowerCase()] = j;
          nopreMap[String(j.steamid).toLowerCase()] = j;
        });

        const combinedPlayers = playersData.map(p => {
          const rawPlayerSteam = p.steamid || p.steamId;
          const accId = steamToAccountId(rawPlayerSteam);
          const foundCheater = cheatersData.find(c => steamToAccountId(c.steamid || c.steamId) === accId);
          return {
            ...p,
            jumpStatsPre: p.jumpStatsPre || resolveJumpStats(preMap, rawPlayerSteam) || null,
            jumpStatsNoPre: p.jumpStatsNoPre || resolveJumpStats(nopreMap, rawPlayerSteam) || null,
            cheaterInfo: foundCheater || null
          };
        });

        setJumpPlayers(combinedPlayers);
        setJumpDataLoaded(true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Eroare la aducerea datelor jumps:", err);
        setLoading(false);
      });
  }, [mode, jumpDataLoaded]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, sortDirection, jumpServer, jumpType]);

  const processedData = useMemo(() => {
    if (mode !== "JUMPS") {
      return players.map((p, index) => ({
        ...p,
        trueRank: ((currentPage - 1) * itemsPerPage) + index + 1
      }));
    }

    let baseData = [...jumpPlayers];
    baseData = baseData.filter(p => getJumpDistance(p, jumpServer, jumpType) > 0);
    baseData = baseData.sort((a, b) => getJumpDistance(b, jumpServer, jumpType) - getJumpDistance(a, jumpServer, jumpType));

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      baseData = baseData.filter(p => {
        const pName = String(p.name || "").toLowerCase();
        const pSteamId = String(p.steamid || p.steamId || "").toLowerCase();
        const calculated64 = getSteamId64(pSteamId);
        return pName.includes(term) || pSteamId.includes(term) || calculated64.includes(term);
      });
    }

    return baseData.map((p, index) => ({ ...p, trueRank: index + 1 }));
  }, [players, jumpPlayers, mode, searchTerm, currentPage, jumpServer, jumpType]);

  const totalPages = mode === "JUMPS"
    ? (Math.ceil(processedData.length / itemsPerPage) || 1)
    : totalPagesFromApi;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlayers = mode === "JUMPS"
    ? processedData.slice(startIndex, startIndex + itemsPerPage)
    : processedData;

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const formatNumber = (num) => num ? Number(num).toLocaleString('de-DE') : '0';

  const getRoleBadges = (player) => {
    const roleStr = (player.role || player.status || player.admin || "").toString().toLowerCase();
    const vipValue = parseInt(player.vip) || 0; 
    
    let badges = [];
    
    if (roleStr.includes('developer') || roleStr.includes('dev')) badges.push(<span key="dev" className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-1 font-bold uppercase tracking-widest">Developer</span>);
    if (roleStr.includes('head admin')) {badges.push(<span key="hadmin" className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-1 font-bold uppercase tracking-widest">Head Admin</span>);
    }else if (roleStr.includes('admin') || roleStr === "1") {badges.push(<span key="admin" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 font-bold uppercase tracking-widest">Admin</span>);}
    else if (roleStr.includes('helper')) { badges.push(<span key="helper" className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-1 font-bold uppercase tracking-widest">Helper</span>);}

    if (vipValue === 2) {
      badges.push(<span key="vip-life" className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 font-bold uppercase tracking-widest">VIP Lifetime</span>);
    } else if (vipValue > 2) {
      const expiryDate = new Date(vipValue * 1000);
      const dateString = expiryDate.toLocaleDateString('ro-RO');
      badges.push(<span key="vip-until" className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 font-bold uppercase tracking-widest">VIP Until: {dateString}</span>);
    } 
    if (player.cheaterInfo) {
        badges.push(<span key="cheater" className="text-[10px] bg-red-600 text-white border border-red-800 px-2 py-1 font-bold uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]">CHEATER</span>);
    }

    if (badges.length === 0) return null;
    return <div className="flex flex-wrap justify-center gap-1">{badges}</div>;
  };

  const renderPaginationLinks = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
      pages.push(<button key={1} onClick={() => setCurrentPage(1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">1</button>);
      if (startPage > 2) pages.push(<span key="dots1" className="text-gray-500 px-1">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === i ? 'bg-primary-dim text-white border-primary-dim shadow-lg' : 'bg-surface-container-highest border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'}`}>{i}</button>);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="text-gray-500 px-1">...</span>);
      pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">{totalPages}</button>);
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
            <span className="text-primary-dim">{mode === "JUMPS" ? jumpPlayers.length : totalPlayers}</span> unique players
          </p>
        </div>
        
        <div className="flex bg-surface-container-low border border-white/10 p-1.5 rounded-sm overflow-x-auto">
           <button onClick={() => { setSortOrder("KILLS"); setSortDirection("DESC"); setCurrentPage(1); setMode("HNS"); }} className={`px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${mode === "HNS" ? "bg-primary-dim text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>Public HNS</button>
           <button onClick={() => { setSortOrder("ELO"); setSortDirection("DESC"); setCurrentPage(1); setMode("MIX"); }} className={`px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${mode === "MIX" ? "bg-primary-dim text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>Competitive Mix</button>
           <button onClick={() => { setJumpType("LONGJUMP"); setCurrentPage(1); setMode("JUMPS"); }} className={`px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${mode === "JUMPS" ? "bg-primary-dim text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>Jump Stats</button>
        </div>
      </div>

      <div className="bg-surface-container-low/40 border border-white/5 p-4 flex flex-col md:flex-row gap-4 shrink-0">
        <input 
          type="text" 
          placeholder="SEARCH PLAYER... (name, id or profile link)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-surface-container-highest border border-white/10 text-white font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim transition-colors uppercase tracking-widest placeholder:text-gray-600"
        />
        
        {mode !== "JUMPS" ? (
          <>
            <button onClick={() => setSortDirection(prev => prev === "DESC" ? "ASC" : "DESC")} className="bg-surface-container-highest border border-white/10 text-gray-300 hover:text-white font-headline text-xs px-4 py-3 focus:outline-none uppercase tracking-widest cursor-pointer transition-colors">
              {sortDirection === "DESC" ? "▼ DESC" : "▲ ASC"}
            </button>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-surface-container-highest border border-white/10 text-gray-300 font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer min-w-[200px]">
              {mode === "HNS" && (
                <>
                  <option value="KILLS" className="bg-[#121212] text-white">SORT BY KILLS</option>
                  <option value="WEEKTIME" className="bg-[#121212] text-white">SORT BY TOTAL TIME</option>
                </>
              )}
              {mode === "MIX" && (
                <>
                  <option value="ELO" className="bg-[#121212] text-white">SORT BY MIX ELO</option>
                  <option value="GAMES" className="bg-[#121212] text-white">SORT BY MIX GAMES</option>
                  <option value="WON" className="bg-[#121212] text-white">SORT BY WINS</option>
                  <option value="DISCONNECTS" className="bg-[#121212] text-white">SORT BY DISCONNECTS</option>
                  <option value="STABS" className="bg-[#121212] text-white">SORT BY STABS</option>
                </>
              )}
            </select>
          </>
        ) : (
          <>
            <select value={jumpServer} onChange={(e) => setJumpServer(e.target.value)} className="bg-surface-container-highest border border-white/10 text-primary-dim font-bold font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer">
              <option value="pre" className="bg-[#121212] text-white">PRE</option>
              <option value="nopre" className="bg-[#121212] text-white">NOPRE</option>
            </select>

            <select value={jumpType} onChange={(e) => setJumpType(e.target.value)} className="bg-surface-container-highest border border-white/10 text-gray-300 font-headline text-xs px-4 py-3 focus:outline-none focus:border-primary-dim uppercase tracking-widest cursor-pointer min-w-[200px]">
              <option value="LONGJUMP" className="bg-[#121212] text-white">LONGJUMP (LJ)</option>
              <option value="COUNTJUMP" className="bg-[#121212] text-white">COUNTJUMP (CJ)</option>
              <option value="BHOP" className="bg-[#121212] text-white">BUNNYHOP (BJ)</option>
              <option value="WEIRDJUMP" className="bg-[#121212] text-white">WEIRDJUMP (WJ)</option>
              <option value="LADDERJUMP" className="bg-[#121212] text-white">LADDERJUMP (LAJ)</option>
              <option value="DROPBHOP" className="bg-[#121212] text-white">DROP-BHOP (DBJ)</option>
              <option value="LJBLOCK" className="bg-[#121212] text-white">LJ BLOCK (LJB)</option>
            </select>
          </>
        )}
      </div>

      <div className="flex-1 overflow-x-auto border border-white/10 bg-surface-container-low/30">
        <table className="w-full text-left font-mono whitespace-nowrap">
          <thead className="bg-surface-container-highest border-b border-white/10 text-gray-400 text-[12px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 w-16 text-center">#</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4 text-center">Status</th>
              
              {mode === "HNS" && (
                <>
                  <th className="px-6 py-4 text-center">Total Kills</th>
                  <th className="px-6 py-4 text-right">Total Time</th>
                </>
              )}
              {mode === "MIX" && (
                <>
                  <th className="px-6 py-4 text-center text-primary-dim">Mix Elo</th>
                  <th className="px-6 py-4 text-center">Mix Games</th>
                  <th className="px-6 py-4 text-center">Mix Won</th>
                  <th className="px-6 py-4 text-center">Stabs</th>
                  <th className="px-6 py-4 text-right">Disconnects</th>
                </>
              )}
              {mode === "JUMPS" && (
                <>
                  <th className="px-6 py-4 text-center text-primary-dim">Distance</th>
                  <th className="px-6 py-4 text-center">Strafes</th>
                  <th className="px-6 py-4 text-center">Sync</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300 text-[15px]">
            {loading ? (
              [...Array(15)].map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-4 mx-auto"></div></td>
                  <td className="px-6 py-5 flex items-center gap-4"><div className="w-10 h-10 bg-white/10 rounded-full"></div><div className="h-4 bg-white/10 rounded w-48"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-16 mx-auto"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-12 mx-auto"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : currentPlayers.map((player, index) => {
              
              let validAvatar = player.avatarurl || player.avatarUrl || player.avatar;
              const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.name || "fallback")}&backgroundColor=e90036`;
              
              if (!validAvatar || validAvatar.includes("null") || validAvatar.trim() === "") {
                validAvatar = fallbackAvatar;
              } else {
                validAvatar = validAvatar.replace('http://', 'https://');
              }

              const jumpDist = getJumpDistance(player, jumpServer, jumpType);

              return (
                <tr key={player.id || index} className="hover:bg-white/[0.03] transition-colors group">
                  
                  <td className="px-6 py-5 text-center font-bold text-gray-500">{player.trueRank}</td>

                  <td className="px-6 py-5">
                    <Link to={`/profile/${player.steamid || player.steamId}`} className="flex items-center gap-4 cursor-pointer">
                      {player.country && player.country.length > 0 && player.country !== 'un' ? (
                        <img src={`/countryflags/${player.country.toLowerCase()}.gif`} alt={player.country} loading="lazy" className="w-[24px] h-[18px] shadow-[0_0_5px_rgba(0,0,0,0.5)] opacity-90 group-hover:opacity-100 transition-opacity" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span className="text-[10px] text-gray-600 uppercase border border-white/5 px-1 bg-white/5">UNK</span>
                      )}

                      <img 
                        src={validAvatar} 
                        alt="avatar" 
                        loading="lazy"
                        className="w-10 h-10 object-cover border border-white/10 group-hover:border-primary-dim transition-colors"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = fallbackAvatar; 
                        }}
                      />
                      
                      <span className="font-headline font-bold text-white uppercase text-[17px] truncate max-w-[250px] group-hover:text-primary-dim transition-colors">{player.name}</span>
                    </Link>
                  </td>

                  <td className="px-6 py-5 text-center">{getRoleBadges(player)}</td>

                  {mode === "HNS" && (
                    <>
                      <td className="px-6 py-5 text-center font-bold text-gray-300">{formatNumber(player.kills)}</td>
                      <td className="px-6 py-5 text-right font-bold text-white">{Math.floor((player.time || player.weektime || 0) / 3600)} <span className="text-xs text-gray-600 ml-1">HRS</span></td>
                    </>
                  )}

                  {mode === "MIX" && (
                    <>
                      <td className="px-6 py-5 text-center font-black text-primary-dim text-[18px] drop-shadow-md">{formatNumber(player.mixelo || player.mixElo)}</td>
                      <td className="px-6 py-5 text-center text-gray-300 font-bold">{formatNumber(player.mixgames || player.mixGames)}</td>
                      <td className="px-6 py-5 text-center text-emerald-400 font-bold">{formatNumber(player.mixwon || player.mixWon)}</td>
                      <td className="px-6 py-5 text-center text-gray-400 font-bold">{formatNumber(player.mixtotalstabs || player.mixTotalStabs)}</td>
                      <td className="px-6 py-5 text-right text-red-500 font-bold">{formatNumber(player.mixdisconnects || player.mixDisconnects)}</td>
                    </>
                  )}

                  {mode === "JUMPS" && (
                    <>
                      <td className="px-6 py-5 text-center font-black text-primary-dim text-[18px] drop-shadow-md">
                        {jumpDist > 0 ? Number(jumpDist).toFixed(2) : "-"}
                      </td>
                      <td className="px-6 py-5 text-center text-gray-300 font-bold">
                        {jumpDist > 0 ? getJumpStrafes(player, jumpServer, jumpType) : "-"}
                      </td>
                      <td className="px-6 py-5 text-right text-gray-400 font-bold">
                        {jumpDist > 0 ? `${Number(getJumpSync(player, jumpServer, jumpType)).toFixed(2)}%` : "-"}
                      </td>
                    </>
                  )}

                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && currentPlayers.length === 0 && (
          <div className="w-full py-16 text-center"><p className="font-headline text-primary-dim text-xl uppercase tracking-widest">No players found.</p></div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center border-t border-white/10 pt-8 shrink-0">
           <div className="flex items-center gap-2">
             <button onClick={goToPrevPage} disabled={currentPage === 1} className="h-8 md:h-10 px-3 md:px-4 border border-white/10 bg-surface-container-highest text-white font-headline text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors flex items-center">&larr; PREV</button>
             <div className="flex gap-1 md:gap-2 mx-2">{renderPaginationLinks()}</div>
             <button onClick={goToNextPage} disabled={currentPage === totalPages} className="h-8 md:h-10 px-3 md:px-4 border border-white/10 bg-surface-container-highest text-white font-headline text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors flex items-center">NEXT &rarr;</button>
           </div>
        </div>
      )}

    </div>
  );
}
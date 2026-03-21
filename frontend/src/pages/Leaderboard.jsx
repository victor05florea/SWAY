import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/players/all")
      .then(response => response.json())
      .then(data => {
        const sortedData = data.sort((a, b) => b.kills - a.kills);
        setPlayers(sortedData);
      })
      .catch(error => console.error("Eroare la backend:", error));
  }, []);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedPlayers = filteredPlayers.slice(0, 100);

  return (
    <section className="px-8 md:px-12 py-12 bg-surface-container-low/80 backdrop-blur-sm border-y border-outline-variant/15 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-baseline justify-between border-b border-outline-variant/20 pb-6 mb-8 gap-6">
          <h2 className="text-4xl font-black font-headline uppercase tracking-tighter">Global <span className="text-primary-dim">Rankings</span></h2>
          
          <div className="w-full md:w-96 relative">
            <span className="absolute -top-5 left-0 text-[10px] text-primary-dim font-headline uppercase tracking-[0.2em]">Database Query</span>
            <input
              type="text"
              placeholder="SEARCH OPERATOR..."
              className="w-full bg-surface-container-high border border-outline-variant/30 text-white font-headline text-lg px-4 py-3 focus:outline-none focus:border-sway-red focus:bg-background transition-all uppercase placeholder-gray-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 px-4">
          <span className="text-gray-500 font-headline text-xs tracking-[0.2em] uppercase">
            {searchTerm ? `Found ${filteredPlayers.length} matches` : 'Live Database Sync'}
          </span>
          <span className="text-primary-dim font-headline text-xs tracking-[0.2em] uppercase font-bold">
            Displaying Top {displayedPlayers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-500 font-headline text-xs uppercase tracking-[0.2em] border-b border-outline-variant/20 bg-surface-container-high/50">
              <tr>
                <th className="py-4 pl-4 pr-8 font-normal">Rank</th>
                <th className="py-4 px-8 font-normal">Operator</th>
                <th className="py-4 px-8 font-normal">Kills</th>
                <th className="py-4 px-8 font-normal">Deaths</th>
                <th className="py-4 px-8 font-normal text-primary-dim">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {displayedPlayers.map((player, index) => (
                <tr key={player.id || index} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-4 pr-8 font-headline font-bold text-xl text-gray-500 group-hover:text-white transition-colors">
                    {index < 9 ? `0${index + 1}` : index + 1}
                  </td>
                  <td className="py-4 px-8 font-headline font-bold text-lg text-white uppercase tracking-wider">
                    {player.name}
                  </td>
                  <td className="py-4 px-8 text-gray-300">{player.kills}</td>
                  <td className="py-4 px-8 text-gray-500">{player.deaths}</td>
                  <td className="py-4 px-8 font-headline font-bold text-primary-dim text-xl bg-primary-dim/5">
                    {(player.kills / (player.deaths || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && (
            <div className="py-20 text-center font-headline tracking-widest text-primary-dim uppercase animate-pulse">
              Establishing uplink to database...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
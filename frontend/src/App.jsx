import React, { useState, useEffect } from 'react';

function App() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/players/top")
      .then(response => response.json())
      .then(data => setPlayers(data))
      .catch(error => console.error("Eroare la backend:", error));
  }, []);

  const filteredPlayers = players.filter((player) =>
  player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="bg-slate-800 shadow-xl border-b border-slate-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-black text-blue-500 tracking-tighter">SWAY</div>
          <nav className="space-x-8 font-semibold text-slate-300">
            <a href="##" className="hover:text-white transition">Home</a>
            <a href="#" className="text-blue-400 border-b-2 border-blue-400 pb-1">Leaderboard</a>
            <a href="#" className="hover:text-white transition">Discord</a>
            <a href="steam://connect/IP_AICI" className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-500 transition">CONNECT</a>
          </nav>
        </div>
      </header>

      {/* LEADERBOARD TABLE */}
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Top 10</h1>

      <div className="mb-6 max-w-md mx-auto">
       <input
        type="text"
        placeholder="Caută un jucător după nume..."
        className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 transition-all text-white"
        onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>


        
        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase text-sm font-bold">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Jucător</th>
                <th className="px-6 py-4">Kills</th>
                <th className="px-6 py-4">Deaths</th>
                <th className="px-6 py-4 text-blue-400">K/D Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPlayers.map((player, index) => (
                <tr key={player.id} className="hover:bg-slate-750 transition bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-slate-400">#{index + 1}</td>
                  <td className="px-6 py-4 font-bold flex items-center">
                    <img 
                      src={player.avatarUrl || "https://via.placeholder.com/32"} 
                      className="w-8 h-8 rounded-full mr-3 border border-slate-600"
                      alt="avatar"
                    />
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-semibold">{player.kills}</td>
                  <td className="px-6 py-4 text-red-400">{player.deaths}</td>
                  <td className="px-6 py-4 font-bold text-blue-400">
                    {(player.kills / (player.deaths || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {players.length === 0 && (
            <div className="p-10 text-center text-slate-500">Se încarcă datele de pe server</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
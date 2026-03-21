import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Profile() {
  const { id } = useParams(); // Scoatem ID-ul jucătorului din adresa URL
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cerem datele STRICT pentru acest jucător de la noul endpoint Java
    fetch(`http://localhost:8080/api/players/${id}`)
      .then(response => {
        if (!response.ok) throw new Error("Jucătorul nu a fost găsit");
        return response.json();
      })
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Eroare:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary-dim font-headline text-2xl animate-pulse">Establishing secure connection...</div>;
  }

  if (!player) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-headline text-2xl">Operator Identity Not Found in Database.</div>;
  }

  // Calculăm Ratio real
  const kdRatio = (player.kills / (player.deaths || 1)).toFixed(2);

  return (
    <div className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Buton de Înapoi (Brutalist) */}
      <Link to="/leaderboard" className="inline-flex items-center text-gray-500 hover:text-primary-dim font-headline uppercase tracking-widest text-sm transition-colors mb-4 border border-outline-variant/30 px-4 py-2 bg-surface-container-high">
         &larr; Return to Rankings
      </Link>

      {/* Player Identity Section (Adaptat din HTML-ul tău) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          
          {/* Avatar Area */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary-dim/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-48 h-48 bg-surface-container-highest overflow-hidden border-2 border-primary-dim/20">
              <img 
                src={player.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + player.name} // Avatar generat automat dacă nu are
                alt="Player Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          {/* Nume și Rang */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-2">
                <span className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none">{player.name}</span>
              </div>
              <span className="font-headline text-primary-dim tracking-[0.4em] text-sm md:text-base font-semibold uppercase">
                 Rank #{player.id} {/* Aici poți pune logica de rank real pe viitor */}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Metrics (Legat la datele MySQL) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        
        {/* Primary Metrics Card */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 group hover:bg-surface-container-high transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Combat Record</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Kills</p>
              <p className="font-headline text-4xl font-bold text-white">{player.kills}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Deaths</p>
              <p className="font-headline text-4xl font-bold text-gray-400">{player.deaths}</p>
            </div>
            <div className="space-y-1">
              <p className="text-primary-dim text-[10px] font-bold uppercase tracking-wider">K/D Ratio</p>
              <p className="font-headline text-4xl font-bold text-primary-dim">{kdRatio}</p>
            </div>
          </div>
        </div>

        {/* Placeholder pentru HNS Stats (Jumps/Ducks) - Acestea trebuie adăugate în MySQL pe viitor */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-md p-8 border border-outline-variant/20 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] opacity-50">
           <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Kinetics (Needs Database Update)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Jumps</p>
              <p className="font-headline text-2xl font-bold text-gray-600">NO DATA</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Ducks</p>
              <p className="font-headline text-2xl font-bold text-gray-600">NO DATA</p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
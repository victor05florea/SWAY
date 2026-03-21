import React from 'react';

export default function Home() {
  return (
    <section className="px-8 md:px-12 mb-20 relative animate-fade-in">
      <div className="absolute top-0 right-0 w-1/2 h-full hero-gradient pointer-events-none"></div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12 relative z-10">
        
        <div className="max-w-3xl">
          <span className="inline-block bg-primary-dim/10 text-primary-dim font-headline text-xs tracking-[0.3em] uppercase py-1 px-3 mb-6 border-l-2 border-primary-dim">Elite Movement Community</span>
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter uppercase leading-[0.9] text-white">
            SWAY: THE <br/>ART OF <span className="text-sway-red">EVASION</span>
          </h1>
          <p className="mt-8 text-xl text-gray-400 font-light max-w-xl leading-relaxed">
            Master the movement. Survive the hunt. Minimalist HNS for the elite digital athlete. Velocity is your only protection.
          </p>
        </div>

        {/* Status Box */}
        <div className="w-full md:w-80 flex flex-col gap-px bg-outline-variant/20">
          <div className="bg-surface-container-high/90 backdrop-blur-md p-6">
            <span className="block text-[10px] text-gray-400 font-headline uppercase tracking-[0.2em] mb-2">Active Runners</span>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-bold text-white tracking-tighter">42/64</span>
              <div className="h-1 flex-1 bg-black overflow-hidden">
                <div className="h-full bg-primary-dim w-[65%]"></div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-high/90 backdrop-blur-md p-6">
            <span className="block text-[10px] text-gray-400 font-headline uppercase tracking-[0.2em] mb-2">Current Map</span>
            <span className="text-2xl font-headline font-bold text-white uppercase tracking-tighter">bbcity</span>
          </div>
        </div>

      </div>
    </section>
  );
}
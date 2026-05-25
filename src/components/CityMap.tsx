import { useState } from 'react';
import { MapPin, Plane } from 'lucide-react';
import { travelToCity } from '@/utils/gameLogic';

const cities = [
  { name: 'București', risk: 'Mediu', desc: 'Capitala. Oportunități mari, pericole pe măsură.', color: 'text-crimson', cost: 0 },
  { name: 'Cluj-Napoca', risk: 'Scăzut', desc: 'Centru IT. Mai sigur, câștiguri moderate.', color: 'text-blue-400', cost: 100 },
  { name: 'Timișoara', risk: 'Mediu', desc: 'Vestul sălbatic. Contrabandă și afaceri.', color: 'text-gold', cost: 150 },
  { name: 'Constanța', risk: 'Ridicat', desc: 'Port maritim. Smuggling capital.', color: 'text-red-400', cost: 200 },
  { name: 'Iași', risk: 'Scăzut', desc: 'Est liniștit. Bun pentru începători.', color: 'text-green-400', cost: 180 },
  { name: 'Brașov', risk: 'Mediu', desc: 'Munte. Safehouses și ascunzători.', color: 'text-cyan-400', cost: 120 },
];

const CityMap = ({ player, onUpdate }: { player: any; onUpdate?: () => void }) => {
  const [traveling, setTraveling] = useState<string | null>(null);

  const travel = async (city: typeof cities[0]) => {
    if (!player || traveling) return;
    setTraveling(city.name);
    
    const result = await travelToCity(player, city.name);
    if (result?.error) {
      alert(result.error);
    } else if (result?.success) {
      onUpdate?.();
    }
    
    setTraveling(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display text-sm tracking-wider mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" /> HARTA ROMÂNIEI
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Locația ta: <span className="text-gold font-medium">{player?.city}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cities.map(city => {
          const isCurrent = player?.city === city.name;
          return (
            <div
              key={city.name}
              className={`p-3 rounded border transition-all ${
                isCurrent
                  ? 'border-gold/50 bg-gold/5'
                  : 'border-border hover:border-crimson/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-display text-xs tracking-wider ${city.color}`}>{city.name}</span>
                <span className="text-[10px] text-muted-foreground">Risc: {city.risk}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{city.desc}</p>
              {!isCurrent && (
                <button
                  onClick={() => travel(city)}
                  disabled={traveling === city.name || (player?.money || 0) < city.cost}
                  className="w-full py-1.5 text-xs bg-crimson text-white rounded hover:bg-crimson/80 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plane className="w-3 h-3" />
                  Călătorește (${city.cost})
                </button>
              )}
              {isCurrent && (
                <div className="text-xs text-gold text-center py-1.5">Ești aici</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityMap;

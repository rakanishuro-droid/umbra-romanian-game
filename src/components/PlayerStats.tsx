import { Heart, Zap, DollarSign, Flame, Star, Shield, Swords, Gauge, Landmark } from 'lucide-react';
import StatBar from './StatBar';

const PlayerStats = ({ player, onBankClick }: { player: any; onBankClick?: () => void }) => {
  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider">STATISTICI</h2>
        <span className="text-xs text-gold font-display">LVL {player.level}</span>
      </div>

      <StatBar label="Viață" value={player.health} max={player.max_health} color="hsl(120, 60%, 40%)" icon={<Heart className="w-3 h-3" />} />
      <StatBar label="Energie" value={player.energy} max={player.max_energy} color="hsl(200, 80%, 50%)" icon={<Zap className="w-3 h-3" />} />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-secondary rounded p-3 text-center">
          <DollarSign className="w-4 h-4 text-gold mx-auto mb-1" />
          <div className="text-sm font-bold text-gold">${player.money?.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Cash</div>
        </div>
        <button 
          onClick={onBankClick}
          className="bg-secondary rounded p-3 text-center hover:bg-secondary/70 transition-colors"
        >
          <Landmark className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-sm font-bold text-green-400">${player.bank?.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Bancă</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <Star className="w-3 h-3 text-gold" />
          <span className="text-muted-foreground">Rep:</span>
          <span className="font-medium">{player.reputation}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Flame className="w-3 h-3 text-crimson" />
          <span className="text-muted-foreground">Heat:</span>
          <span className="font-medium text-crimson">{player.heat}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Swords className="w-3 h-3 text-red-400" />
          <span className="text-muted-foreground">Atac:</span>
          <span>{player.attack}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-muted-foreground">Apăr:</span>
          <span>{player.defense}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Gauge className="w-3 h-3 text-cyan-400" />
          <span className="text-muted-foreground">Vit:</span>
          <span>{player.speed}</span>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
        📍 {player.city} · XP: {player.xp} · Crime: {player.crimes_success}/{player.crimes_done}
      </div>
    </div>
  );
};

export default PlayerStats;

import { useState } from 'react';
import { AlertTriangle, Scale, Shield } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const AdvancedPoliticsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [corruptionRate, setCorruptionRate] = useState(0);
  const [taxRate, setTaxRate] = useState(10);
  const [publicApproval, setPublicApproval] = useState(50);

  const loadPolitics = async () => {
    if (!player) return;
    // În implementare real, aceste date ar veni din baza de date
    setCorruptionRate(Math.floor(Math.random() * 30));
    setTaxRate(10);
    setPublicApproval(50);
  };

  useState(() => { loadPolitics(); });

  const manipulateMedia = async () => {
    if (!player) return;
    if (player.money < 1000) {
      alert('Cost: $1,000');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - 1000,
    });

    setPublicApproval(Math.min(100, publicApproval + 5));
    onUpdate();
  };

  const bribeOfficial = async () => {
    if (!player) return;
    if (player.money < 5000) {
      alert('Cost: $5,000');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - 5000,
      heat: Math.max(0, player.heat - 10),
    });

    setCorruptionRate(Math.min(100, corruptionRate + 5));
    onUpdate();
  };

  const adjustTaxes = async (newRate: number) => {
    if (!player) return;
    if (player.level < 15) {
      alert('Nivel 15 necesar!');
      return;
    }

    setTaxRate(newRate);
    setPublicApproval(Math.max(0, publicApproval - Math.abs(newRate - taxRate) * 2));
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Scale className="w-4 h-4 text-gold" /> POLITICĂ AVANSATĂ
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded bg-secondary/50 text-center">
          <div className="text-xs text-muted-foreground">Corupție</div>
          <div className="text-lg font-bold text-red-400">{corruptionRate}%</div>
        </div>
        <div className="p-3 rounded bg-secondary/50 text-center">
          <div className="text-xs text-muted-foreground">Taxe</div>
          <div className="text-lg font-bold text-gold">{taxRate}%</div>
        </div>
        <div className="p-3 rounded bg-secondary/50 text-center">
          <div className="text-xs text-muted-foreground">Popularitate</div>
          <div className="text-lg font-bold text-green-400">{publicApproval}%</div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> MANIPULARE MEDIA
        </h3>
        <button
          onClick={manipulateMedia}
          className="w-full p-3 rounded bg-purple-900/30 border border-purple-900/50 text-purple-300 text-sm hover:bg-purple-900/40"
        >
          Propagandă (+5% popularitate, -$1,000)
        </button>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-crimson" /> CORUPȚIE
        </h3>
        <button
          onClick={bribeOfficial}
          className="w-full p-3 rounded bg-red-900/30 border border-red-900/50 text-red-300 text-sm hover:bg-red-900/40"
        >
          Mituiește Ofițer (-10 heat, +5% corupție, -$5,000)
        </button>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">ADJUSTARE TAXE</h3>
        <div className="flex gap-2 mb-2">
          {[5, 10, 15, 20, 25].map(rate => (
            <button
              key={rate}
              onClick={() => adjustTaxes(rate)}
              className={`flex-1 py-2 text-xs rounded transition-colors ${
                taxRate === rate 
                  ? 'bg-gold text-black font-medium' 
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Taxele mari scad popularitatea dar cresc venituri
        </p>
      </div>
    </div>
  );
};

export default AdvancedPoliticsPanel;

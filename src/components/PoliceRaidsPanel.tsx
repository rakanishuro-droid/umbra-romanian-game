import { useState, useEffect } from 'react';
import { Siren, Search, AlertTriangle, FileText } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const PoliceRaidsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [wantedLevel, setWantedLevel] = useState(0);
  const [investigation, setInvestigation] = useState<any>(null);
  const [raidTimer, setRaidTimer] = useState<number | null>(null);
  const [myCrimes, setMyCrimes] = useState<any[]>([]);

  const loadPoliceData = async () => {
    if (!player) return;
    
    setWantedLevel(Math.min(5, Math.floor(player.heat / 20)));
    
    const inv = await db.query('police_investigations', { 
      target_id: `eq.${player._row_id}`,
      status: 'eq.active'
    });
    setInvestigation(inv.length > 0 ? inv[0] : null);
    
    // Get my recent crimes
    const crimes = await db.query('crime_log', { player_id: `eq.${player._row_id}`, order: '_created_at.desc', limit: '10' });
    setMyCrimes(crimes);
  };

  useEffect(() => { loadPoliceData(); }, [player]);

  useEffect(() => {
    if (raidTimer && raidTimer > 0) {
      const timeout = setTimeout(() => setRaidTimer(raidTimer - 1), 1000);
      return () => clearTimeout(timeout);
    } else if (raidTimer === 0) {
      // Raid incoming!
      performRaid();
    }
  }, [raidTimer]);

  const performRaid = async () => {
    if (!player) return;
    
    const stolen = Math.floor(player.money * 0.3);
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - stolen,
      health: Math.max(1, player.health - 50),
    });

    alert(`🚔 RAID! Poliția a furat $${stolen} și te-a rănit!`);
    setRaidTimer(null);
    onUpdate();
  };

  const bribeInvestigator = async () => {
    if (!player || !investigation) return;
    if (player.money < 10000) {
      alert('Cost: $10,000');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - 10000,
    });

    await db.update('police_investigations', { _row_id: `eq.${investigation._row_id}` }, {
      status: 'dropped'
    });

    setInvestigation(null);
    onUpdate();
  };

  const layLow = async () => {
    if (!player) return;
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      heat: Math.max(0, player.heat - 5),
    });
    onUpdate();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Siren className="w-4 h-4 text-red-500 animate-pulse" /> POLIȚIE & RAZII
      </h2>

      <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-300">Nivel Căutat</span>
          <span className="text-2xl font-bold text-red-500">
            {'★'.repeat(wantedLevel)}
            {'☆'.repeat(5 - wantedLevel)}
          </span>
        </div>
        <p className="text-xs text-red-400">
          {wantedLevel === 0 && 'Ești curat'}
          {wantedLevel === 1 && 'Sub supraveghere'}
          {wantedLevel === 2 && 'Căutat activ'}
          {wantedLevel === 3 && 'Pericol public'}
          {wantedLevel === 4 && 'Enemy #1'}
          {wantedLevel >= 5 && 'TERORIST - RAID IMINENT'}
        </p>
      </div>

      {investigation && (
        <div className="p-3 rounded bg-yellow-900/20 border border-yellow-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">Investigație Activă</span>
          </div>
          <p className="text-xs text-yellow-200 mb-2">
            Severitate: {investigation.severity}/5 · Dovezi: {investigation.evidence}%
          </p>
          <button
            onClick={bribeInvestigator}
            className="w-full py-2 bg-yellow-900/50 text-yellow-300 text-sm rounded hover:bg-yellow-900/60"
          >
            Mituiește -$10,000
          </button>
        </div>
      )}

      {raidTimer !== null && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 animate-bounce" />
          <div className="text-lg font-bold">RAID ÎN {raidTimer}s</div>
          <div className="text-sm opacity-90">Poliția vine după tine!</div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-medium mb-2">ACȚIUNI</h3>
        <div className="space-y-2">
          <button
            onClick={layLow}
            className="w-full p-3 bg-blue-900/30 border border-blue-900/50 text-blue-300 text-sm rounded hover:bg-blue-900/40"
          >
            Ține-te După (-5 heat, 5 energie)
          </button>
          {wantedLevel >= 3 && !raidTimer && (
            <button
              onClick={() => setRaidTimer(30)}
              className="w-full p-3 bg-red-900/30 border border-red-900/50 text-red-300 text-sm rounded hover:bg-red-900/40"
            >
              Simulează Raid (30s countdown)
            </button>
          )}
        </div>
      </div>

      {/* Recent Crimes */}
      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> CRIME RECENTE
        </h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {myCrimes.slice(0, 5).map((crime, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-xs">
              <span>{crime.crime_type}</span>
              <span className={crime.success ? 'text-green-400' : 'text-red-400'}>
                {crime.success ? '✓' : '✗'}
              </span>
            </div>
          ))}
          {myCrimes.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Niciun comis recent.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoliceRaidsPanel;

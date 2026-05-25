import { useState, useEffect } from 'react';
import { Swords, Target, DollarSign } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const PvPPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [targets, setTargets] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [battleLog, setBattleLog] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadTargets();
    loadBounties();
    loadBattleLog();
  }, [player]);

  const loadTargets = async () => {
    if (!player) return;
    const all = await db.query('players', {
      _row_id: `neq.${player._row_id}`,
      order: 'level.desc',
      limit: '20'
    });
    // Filter to similar level
    const filtered = all.filter((p: any) => Math.abs(p.level - player.level) <= 3 && p.status === 'free');
    setTargets(filtered);
  };

  const loadBounties = async () => {
    const active = await db.query('bounties', { status: 'eq.active', order: 'reward.desc' });
    setBounties(active);
  };

  const loadBattleLog = async () => {
    if (!player) return;
    const log = await db.query('pvp_battles', {
      or: `attacker_id.eq.${player._row_id},defender_id.eq.${player._row_id}`,
      order: '_created_at.desc',
      limit: '10'
    });
    setBattleLog(log);
  };

  const calculatePower = (p: any) => {
    return (p.attack || 5) + (p.defense || 5) + (p.speed || 5);
  };

  const attack = async () => {
    if (!selectedTarget || !player || attacking) return;
    setAttacking(true);
    setResult(null);

    const myPower = calculatePower(player);
    const theirPower = calculatePower(selectedTarget);
    
    // Battle calculation with randomness
    const myRoll = myPower * (0.7 + Math.random() * 0.6);
    const theirRoll = theirPower * (0.7 + Math.random() * 0.6);
    
    const iWin = myRoll > theirRoll;
    const myDamage = Math.floor(theirPower * (0.5 + Math.random() * 1.5));
    const theirDamage = Math.floor(calculatePower(player) * (0.5 + Math.random() * 1.5));
    
    // Steal money (max 10% of target's cash, or all if less than $100)
    const stealPercent = Math.min(0.1, Math.random() * 0.15);
    const moneyStolen = iWin ? Math.floor(selectedTarget.money * stealPercent) : 0;
    const xpGained = iWin ? Math.floor(10 + selectedTarget.level * 2) : Math.floor(5 + selectedTarget.level);
    
    // Update attacker
    const newMyMoney = player.money + moneyStolen;
    const newMyHp = Math.max(0, iWin ? player.health - Math.floor(myDamage * 0.3) : player.health - myDamage);
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: newMyMoney,
      health: newMyHp,
      xp: player.xp + xpGained,
      level: Math.floor((player.xp + xpGained) / 100) + 1,
    });
    
    // Update defender
    const newTheirMoney = selectedTarget.money - moneyStolen;
    const newTheirHp = Math.max(0, iWin ? selectedTarget.health - theirDamage : selectedTarget.health - Math.floor(theirDamage * 0.3));
    await db.update('players', { _row_id: `eq.${selectedTarget._row_id}` }, {
      money: newTheirMoney,
      health: newTheirHp,
    });
    
    // Check bounty
    const bounty = bounties.find(b => b.target_id === selectedTarget._row_id);
    let bountyWon = 0;
    if (bounty && iWin) {
      bountyWon = bounty.reward;
      await db.update('bounties', { _row_id: `eq.${bounty._row_id}` }, { status: 'claimed' });
      await db.update('players', { _row_id: `eq.${player._row_id}` }, {
        money: newMyMoney + bountyWon
      });
    }
    
    // Log battle
    await db.insert('pvp_battles', {
      attacker_id: player._row_id,
      defender_id: selectedTarget._row_id,
      attacker_won: iWin ? 1 : 0,
      attacker_damage: myDamage,
      defender_damage: theirDamage,
      money_stolen: moneyStolen,
      xp_gained: xpGained,
    });
    
    setResult({
      won: iWin,
      myDamage,
      theirDamage,
      moneyStolen,
      xpGained,
      bountyWon,
    });
    
    setAttacking(false);
    onUpdate();
    loadTargets();
    loadBounties();
    loadBattleLog();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Swords className="w-4 h-4 text-crimson" /> PvP
      </h2>

      {result && (
        <div className={`p-3 rounded text-sm ${result.won ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          <div className="font-medium mb-1">{result.won ? '✅ VICTORIE!' : '❌ ÎNFRÂNGERE'}</div>
          <div className="text-xs space-y-0.5">
            <div>Daune: {result.myDamage} / Primit: {result.theirDamage}</div>
            {result.moneyStolen > 0 && <div className="text-gold">+${result.moneyStolen} furat</div>}
            <div>+{result.xpGained} XP</div>
            {result.bountyWon > 0 && <div className="text-gold">RECOMPENSĂ: +${result.bountyWon}</div>}
          </div>
        </div>
      )}

      {selectedTarget ? (
        <div className="space-y-3">
          <div className="p-3 rounded bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{selectedTarget.username}</span>
              <span className="text-xs text-muted-foreground">Lvl {selectedTarget.level}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div>⚔️ {selectedTarget.attack}</div>
              <div>🛡️ {selectedTarget.defense}</div>
              <div>💨 {selectedTarget.speed}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Viață: {selectedTarget.health}/{selectedTarget.max_health} · Cash: ${selectedTarget.money?.toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={attack}
              disabled={attacking || player.energy < 10}
              className="flex-1 py-2 bg-crimson text-white text-sm rounded hover:bg-crimson/80 disabled:opacity-50"
            >
              {attacking ? 'Ataci...' : 'ATACĂ (10 Energie)'}
            </button>
            <button
              onClick={() => setSelectedTarget(null)}
              className="px-4 py-2 border border-border text-sm rounded hover:bg-secondary"
            >
              Înapoi
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> ȚINTE ({targets.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {targets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Niciun țintă disponibilă.</p>
              ) : (
                targets.map(t => {
                  const myPower = calculatePower(player);
                  const theirPower = calculatePower(t);
                  const powerDiff = myPower - theirPower;
                  return (
                    <button
                      key={t._row_id}
                      onClick={() => setSelectedTarget(t)}
                      className="w-full p-2 rounded bg-secondary/50 hover:bg-secondary text-left text-xs transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{t.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Lvl {t.level}</span>
                          <span className={powerDiff > 10 ? 'text-green-400' : powerDiff < -10 ? 'text-red-400' : 'text-yellow-400'}>
                            {powerDiff > 10 ? 'Ușor' : powerDiff < -10 ? 'Greu' : 'Echilibrat'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <span>⚔️{t.attack}</span>
                        <span>🛡️{t.defense}</span>
                        <span>💨{t.speed}</span>
                        <span className="text-gold">${t.money?.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {bounties.length > 0 && (
            <div>
              <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gold" /> RECOMPENSE
              </h3>
              <div className="space-y-1">
                {bounties.map(b => (
                  <div key={b._row_id} className="p-2 rounded bg-gold/5 border border-gold/20 text-xs">
                    <div className="flex items-center justify-between">
                      <span>{b.target_username}</span>
                      <span className="text-gold font-medium">${b.reward?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PvPPanel;

import { useState } from 'react';
import { Lock, Clock, Crosshair } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

interface Crime {
  id: string;
  name: string;
  energyCost: number;
  minLevel: number;
  minReward: number;
  maxReward: number;
  successRate: number;
  xp: number;
  heat: number;
}

const CRIMES: Crime[] = [
  { id: 'pickpocket', name: 'Buzunărit', energyCost: 5, minLevel: 1, minReward: 10, maxReward: 50, successRate: 80, xp: 5, heat: 1 },
  { id: 'vandalism', name: 'Vandalism', energyCost: 8, minLevel: 2, minReward: 30, maxReward: 100, successRate: 70, xp: 8, heat: 2 },
  { id: 'carjack', name: 'Furt Auto', energyCost: 10, minLevel: 2, minReward: 50, maxReward: 200, successRate: 65, xp: 12, heat: 3 },
  { id: 'store_rob', name: 'Jaf Magazin', energyCost: 15, minLevel: 3, minReward: 100, maxReward: 500, successRate: 55, xp: 20, heat: 5 },
  { id: 'blackmail', name: 'Șantaj', energyCost: 18, minLevel: 4, minReward: 150, maxReward: 600, successRate: 50, xp: 25, heat: 6 },
  { id: 'smuggling', name: 'Contrabandă', energyCost: 20, minLevel: 5, minReward: 200, maxReward: 1000, successRate: 50, xp: 30, heat: 7 },
  { id: 'kidnapping', name: 'Răpire', energyCost: 25, minLevel: 6, minReward: 300, maxReward: 1500, successRate: 45, xp: 40, heat: 10 },
  { id: 'bank_heist', name: 'Jaf Bancă', energyCost: 35, minLevel: 8, minReward: 500, maxReward: 3000, successRate: 35, xp: 60, heat: 15 },
  { id: 'contract_kill', name: 'Asasinat', energyCost: 40, minLevel: 10, minReward: 1000, maxReward: 5000, successRate: 30, xp: 80, heat: 20 },
  { id: 'corruption', name: 'Corupție', energyCost: 30, minLevel: 12, minReward: 800, maxReward: 4000, successRate: 40, xp: 70, heat: 12 },
];

const CrimePanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState<string | null>(null);

  if (!player) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
        Se încarcă...
      </div>
    );
  }

  const doCrime = async (crime: Crime) => {
    if (busy) return;
    if (player.energy < crime.energyCost) {
      setResult({ success: false, message: 'Nu ai destulă energie!' });
      return;
    }
    if (player.level < crime.minLevel) return;
    if (player.status === 'jail') {
      setResult({ success: false, message: 'Ești în închisoare!' });
      return;
    }

    setBusy(true);
    setCooldown(crime.id);

    const roll = Math.random() * 100;
    const success = roll < crime.successRate + (player.speed * 0.5);
    const reward = success ? Math.floor(crime.minReward + Math.random() * (crime.maxReward - crime.minReward)) : 0;
    const heatGain = success ? crime.heat : Math.floor(crime.heat * 0.5);
    const jailed = !success && Math.random() * 100 < 15 + player.heat * 0.5;

    // Update player
    const newEnergy = Math.max(0, player.energy - crime.energyCost);
    const newMoney = player.money + reward;
    const newHeat = Math.min(100, player.heat + heatGain);
    const newXp = player.xp + (success ? crime.xp : Math.floor(crime.xp * 0.2));
    const newLevel = Math.floor(newXp / 100) + 1;
    const newCrimes = player.crimes_done + 1;
    const newSuccess = player.crimes_success + (success ? 1 : 0);

    const updateData: any = {
      energy: newEnergy,
      money: newMoney,
      heat: newHeat,
      xp: newXp,
      level: newLevel,
      crimes_done: newCrimes,
      crimes_success: newSuccess,
    };

    if (jailed) {
      updateData.status = 'jail';
      updateData.jail_until = Math.floor(Date.now() / 1000) + 60;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, updateData);

    // Log the crime
    await db.insert('crime_log', {
      player_id: player._row_id,
      crime_type: crime.id,
      success: success ? 1 : 0,
      money_gained: reward,
      xp_gained: success ? crime.xp : Math.floor(crime.xp * 0.2),
      heat_gained: heatGain,
      message: jailed ? 'Prins de poliție!' : (success ? `Ai câștigat $${reward}` : 'Eșuat'),
    });

    let msg = '';
    if (jailed) msg = `🚔 Ai fost prins! Închisoare 60s. +${heatGain} heat`;
    else if (success) msg = `✅ Succes! +$${reward} +${crime.xp}XP +${heatGain} heat`;
    else msg = `❌ Eșuat. +${heatGain} heat`;

    setResult({ success: success && !jailed, message: msg });
    onUpdate();

    setTimeout(() => {
      setCooldown(null);
      setBusy(false);
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display text-sm tracking-wider mb-4 flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-crimson" /> CRIME
      </h2>

      {result && (
        <div className={`text-xs p-2 rounded mb-3 ${result.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {result.message}
        </div>
      )}

      <div className="space-y-2">
        {CRIMES.map(crime => {
          const locked = (player?.level ?? 0) < crime.minLevel;
          const noEnergy = (player?.energy ?? 0) < crime.energyCost;
          const onCooldown = cooldown === crime.id;

          return (
            <button
              key={crime.id}
              onClick={() => doCrime(crime)}
              disabled={locked || noEnergy || onCooldown || busy}
              className={`w-full flex items-center justify-between p-3 rounded border transition-all text-left
                ${locked ? 'border-border/50 opacity-40 cursor-not-allowed' : 
                  onCooldown ? 'border-gold/30 bg-gold/5' :
                  'border-border hover:border-crimson/40 hover:bg-crimson/5 cursor-pointer'}`}
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {locked && <Lock className="w-3 h-3" />}
                  {onCooldown && <Clock className="w-3 h-3 text-gold animate-spin" />}
                  {crime.name}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {locked ? `Nivel ${crime.minLevel} necesar` : `$${crime.minReward}-$${crime.maxReward} · ${crime.successRate}% · +${crime.heat} heat`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">⚡ {crime.energyCost}</div>
                <div className="text-[10px] text-gold">+{crime.xp} XP</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CrimePanel;

import { useState, useEffect } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { INITIAL_MISSIONS } from '@/data/gameData';

const MissionsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);

  const loadMissions = async () => {
    if (!player) return;
    const my = await db.query('missions', { player_id: `eq.${player._row_id}`, status: 'eq.active' });
    setMissions(my);
    
    const all = await db.query('shop_missions', {});
    if (all.length === 0) {
      for (const m of INITIAL_MISSIONS) {
        await db.insert('shop_missions', { ...m, rewards: JSON.stringify(m.rewards) });
      }
      setAvailable(INITIAL_MISSIONS);
    } else {
      setAvailable(all);
    }
  };

  useEffect(() => { loadMissions(); }, [player]);

  const acceptMission = async (mission: any) => {
    if (!player) return;
    if (player.level < mission.level_req) {
      alert(`Nivel ${mission.level_req} necesar!`);
      return;
    }

    await db.insert('missions', {
      player_id: player._row_id,
      mission_id: mission.mission_id,
      title: mission.title,
      description: mission.description,
      progress: 0,
      target: mission.target_value,
      status: 'active',
      rewards: mission.rewards,
    });

    loadMissions();
  };

  const checkMission = async (mission: any) => {
    // This would be called after crimes/PvP/etc
    // For now just placeholder
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Target className="w-4 h-4 text-gold" /> MISIUNI
      </h2>

      <div>
        <h3 className="text-xs font-medium mb-2">ACTIVE ({missions.length})</h3>
        {missions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nu ai misiuni active.</p>
        ) : (
          <div className="space-y-2">
            {missions.map(m => {
              const rewards = JSON.parse(m.rewards || '{}');
              const progress = Math.min(100, (m.progress / m.target) * 100);
              return (
                <div key={m._row_id} className="p-3 rounded bg-secondary/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{m.title}</span>
                    <span className="text-muted-foreground">{m.progress}/{m.target}</span>
                  </div>
                  <p className="text-muted-foreground mb-2">{m.description}</p>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[10px] text-gold">
                    Recompense: +{rewards.xp}XP ${rewards.money}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">DISPONIBILE</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {available.filter(m => m.level_req <= player.level).map(mission => {
            const alreadyActive = missions.find((m: any) => m.mission_id === mission.mission_id);
            const rewards = JSON.parse(mission.rewards || '{}');
            return (
              <div key={mission.mission_id} className="p-3 rounded border border-border">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-xs">{mission.title}</span>
                  {alreadyActive && <CheckCircle2 className="w-4 h-4 text-gold" />}
                </div>
                <p className="text-muted-foreground text-[10px] mb-2">{mission.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gold">+{rewards.xp}XP ${rewards.money}</span>
                  {!alreadyActive && (
                    <button
                      onClick={() => acceptMission(mission)}
                      className="px-2 py-1 bg-crimson text-white rounded text-xs"
                    >
                      Acceptă
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MissionsPanel;

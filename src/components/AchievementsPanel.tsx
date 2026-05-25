import { useState, useEffect } from 'react';
import { Trophy, Award } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { INITIAL_ACHIEVEMENTS } from '@/data/gameData';

const AchievementsPanel = ({ player }: { player: any }) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState<any[]>([]);

  const loadAchievements = async () => {
    if (!player) return;
    const my = await db.query('achievements', { player_id: `eq.${player._row_id}` });
    setUnlocked(my);
    
    const all = await db.query('shop_achievements', {});
    if (all.length === 0) {
      for (const a of INITIAL_ACHIEVEMENTS) {
        await db.insert('shop_achievements', a);
      }
      setAchievements(INITIAL_ACHIEVEMENTS);
    } else {
      setAchievements(all);
    }
  };

  useEffect(() => { loadAchievements(); }, [player]);

  const checkAndUnlock = async () => {
    if (!player) return;
    
    for (const ach of achievements) {
      const has = unlocked.find((u: any) => u.achievement_id === ach.achievement_id);
      if (has) continue;
      
      let shouldUnlock = false;
      
      if (ach.requirement_type === 'crimes_done' && player.crimes_done >= ach.requirement_value) {
        shouldUnlock = true;
      } else if (ach.requirement_type === 'level' && player.level >= ach.requirement_value) {
        shouldUnlock = true;
      } else if (ach.requirement_type === 'total_wealth' && (player.money + player.bank) >= ach.requirement_value) {
        shouldUnlock = true;
      }
      
      if (shouldUnlock) {
        await db.insert('achievements', {
          player_id: player._row_id,
          achievement_id: ach.achievement_id,
          unlocked_at: Math.floor(Date.now() / 1000),
        });
        
        // Grant rewards
        await db.update('players', { _row_id: `eq.${player._row_id}` }, {
          xp: player.xp + ach.reward_xp,
          money: player.money + ach.reward_money,
        });
        
        loadAchievements();
      }
    }
  };

  useEffect(() => { checkAndUnlock(); }, [player, achievements]);

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Trophy className="w-4 h-4 text-gold" /> REALIZĂRI
      </h2>

      <div className="grid grid-cols-4 gap-2">
        {achievements.map(ach => {
          const has = unlocked.find((u: any) => u.achievement_id === ach.achievement_id);
          return (
            <div
              key={ach.achievement_id}
              className={`p-3 rounded text-center transition-all ${
                has ? 'bg-gold/20 border border-gold/40' : 'bg-secondary/50 opacity-50'
              }`}
              title={`${ach.title}\n${ach.description}`}
            >
              <div className="text-2xl mb-1">{ach.icon}</div>
              <div className="text-[10px] font-medium truncate">{ach.title}</div>
              {has && <div className="text-[8px] text-gold">✓</div>}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-gold" />
          DEBLOCATE ({unlocked.length}/{achievements.length})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {unlocked.map(u => {
            const ach = achievements.find((a: any) => a.achievement_id === u.achievement_id);
            if (!ach) return null;
            return (
              <div key={u._row_id} className="p-2 rounded bg-gold/10 border border-gold/30 text-xs flex items-center gap-2">
                <span className="text-xl">{ach.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{ach.title}</div>
                  <div className="text-[10px] text-muted-foreground">{ach.description}</div>
                </div>
                <div className="text-gold text-[10px]">
                  +{ach.reward_xp}XP ${ach.reward_money}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;

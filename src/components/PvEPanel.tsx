import { useState, useEffect } from 'react';
import { Skull, Sword, Gift, Crosshair } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const PvEPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [enemies, setEnemies] = useState<any[]>([]);
  const [worldBoss, setWorldBoss] = useState<any | null>(null);
  const [fighting, setFighting] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<any[]>([]);

  const loadEnemies = async () => {
    const all = await db.query('pve_enemies', { order: 'level.asc' });
    setEnemies(all.filter((e: any) => e.type !== 'world_boss'));
    
    const boss = all.find((e: any) => e.type === 'world_boss');
    setWorldBoss(boss || null);
    
    const log = await db.query('pve_battles', { 
      player_id: `eq.${player?._row_id}`,
      order: '_created_at.desc',
      limit: '10'
    });
    setBattleLog(log);
  };

  useEffect(() => { loadEnemies(); }, [player]);

  const fightEnemy = async (enemy: any) => {
    if (!player || fighting) return;
    if (player.energy < 10) {
      alert('Nu ai destulă energie!');
      return;
    }

    setFighting(enemy.enemy_id);

    const myPower = (player.attack || 5) + (player.speed || 5);
    const enemyPower = enemy.attack + enemy.defense;
    
    let myHealth = player.health;
    let enemyHealth = enemy.health;
    const damageDealt = [];
    
    while (myHealth > 0 && enemyHealth > 0) {
      const myDamage = Math.max(1, Math.floor((player.attack || 5) * (0.5 + Math.random())));
      enemyHealth -= myDamage;
      damageDealt.push(myDamage);
      
      if (enemyHealth <= 0) break;
      
      const enemyDamage = Math.max(1, Math.floor(enemy.attack * (0.5 + Math.random()) - (player.defense || 5) * 0.3));
      myHealth -= enemyDamage;
    }

    const playerWon = myHealth > 0;
    const rewards = JSON.parse(enemy.rewards || '{}');
    
    if (playerWon) {
      const newMoney = player.money + (rewards.money || 0);
      const newXP = player.xp + (rewards.xp || 0);
      
      await db.update('players', { _row_id: `eq.${player._row_id}` }, {
        money: newMoney,
        xp: newXP,
        energy: player.energy - 10,
        health: Math.max(1, myHealth),
        level: Math.floor(newXP / 100) + 1,
      });

      // Grant item if reward
      if (rewards.item) {
        await db.insert('items', {
          player_id: player._row_id,
          item_type: 'weapon',
          item_id: rewards.item,
          name: rewards.item.replace('_', ' ').toUpperCase(),
          attack_bonus: 10,
          defense_bonus: 0,
          speed_bonus: 0,
          crime_bonus: 0,
          equipped: 0,
        });
      }
    } else {
      await db.update('players', { _row_id: `eq.${player._row_id}` }, {
        energy: player.energy - 10,
        health: 1,
      });
    }

    await db.insert('pve_battles', {
      player_id: player._row_id,
      enemy_id: enemy.enemy_id,
      enemy_name: enemy.name,
      player_won: playerWon ? 1 : 0,
      damage_dealt: damageDealt.reduce((a: number, b: number) => a + b, 0),
      rewards_received: playerWon ? JSON.stringify(rewards) : '{}',
    });

    setFighting(null);
    onUpdate();
    loadEnemies();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Skull className="w-4 h-4 text-crimson" /> PVE BATTLE
      </h2>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5" /> INAMICI ({enemies.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {enemies.map(enemy => (
            <div key={enemy.enemy_id} className="p-3 rounded border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs">{enemy.name}</span>
                <span className="text-xs text-crimson">Lvl {enemy.level}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground mb-2">
                <div>❤️ {enemy.health}</div>
                <div>⚔️ {enemy.attack}</div>
                <div>🛡️ {enemy.defense}</div>
              </div>
              <button
                onClick={() => fightEnemy(enemy)}
                disabled={fighting === enemy.enemy_id || player.energy < 10}
                className="w-full py-1.5 bg-crimson text-white text-xs rounded disabled:opacity-50"
              >
                {fighting === enemy.enemy_id ? '...' : 'Luptă (10⚡)'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {worldBoss && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-red-900/30 border border-purple-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm text-gold flex items-center gap-1.5">
              <Gift className="w-4 h-4" /> WORLD BOSS
            </span>
            <span className="text-xs text-crimson">Lvl {worldBoss.level}</span>
          </div>
          <div className="text-sm font-medium mb-1">{worldBoss.name}</div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div>❤️ {worldBoss.health}</div>
            <div>⚔️ {worldBoss.attack}</div>
            <div>🛡️ {worldBoss.defense}</div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">
            Rewards: ${JSON.parse(worldBoss.rewards || '{}').money?.toLocaleString()} + {JSON.parse(worldBoss.rewards || '{}').xp}XP
          </div>
          <button
            onClick={() => fightEnemy(worldBoss)}
            disabled={fighting === worldBoss.enemy_id || player.energy < 20}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-red-600 text-white text-sm rounded font-medium disabled:opacity-50"
          >
            {fighting === worldBoss.enemy_id ? 'Battle...' : 'CHALLENGE (20⚡)'}
          </button>
        </div>
      )}

      {battleLog.length > 0 && (
        <div>
          <h3 className="text-xs font-medium mb-2">RECENT BATTLES</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {battleLog.map(battle => (
              <div key={battle._row_id} className={`p-2 rounded text-xs ${battle.player_won ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                <div className="font-medium">{battle.enemy_name}</div>
                <div className="text-[10px]">
                  {battle.player_won ? 'Victory!' : 'Defeat'} · {battle.damage_dealt} damage dealt
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvEPanel;

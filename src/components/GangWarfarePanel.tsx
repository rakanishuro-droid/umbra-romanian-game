import { useState, useEffect } from 'react';
import { Shield, Flag, TrendingUp } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const GangWarfarePanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [territories, setTerritories] = useState<any[]>([]);
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  const loadData = async () => {
    if (!player) return;
    
    const myGang = await db.query('gang_members', { player_id: `eq.${player._row_id}` });
    if (myGang.length === 0) return;
    
    const gangId = myGang[0].gang_id;
    const terr = await db.query('gang_territories', { gang_id: `eq.${gangId}` });
    setTerritories(terr);
    
    const upg = await db.query('gang_upgrades', { gang_id: `eq.${gangId}` });
    setUpgrades(upg);
  };

  useEffect(() => { loadData(); });

  const raidTerritory = async (city: string) => {
    if (!player) return;
    
    const myGang = await db.query('gang_members', { player_id: `eq.${player._row_id}` });
    if (myGang.length === 0) {
      alert('Nu ești într-o gască!');
      return;
    }

    const gangId = myGang[0].gang_id;
    const existing = territories.find((t: any) => t.city === city);
    
    if (existing && existing.control_level >= 100) {
      alert('Controlați deja acest oraș!');
      return;
    }

    if (player.energy < 30) {
      alert('Nu ai destulă energie!');
      return;
    }

    const success = Math.random() > 0.4;
    const controlGain = success ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10);
    
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      energy: player.energy - 30,
    });

    if (existing) {
      await db.update('gang_territories', { 
        _row_id: `eq.${existing._row_id}` 
      }, {
        control_level: Math.min(100, existing.control_level + (success ? controlGain : -controlGain)),
        last_raided: Math.floor(Date.now() / 1000),
      });
    } else {
      await db.insert('gang_territories', {
        gang_id: gangId,
        city: city,
        control_level: controlGain,
        income_multiplier: 100,
        last_raided: Math.floor(Date.now() / 1000),
      });
    }

    onUpdate();
    loadData();
  };

  const buyUpgrade = async (type: string) => {
    if (!player) return;
    
    const myGang = await db.query('gang_members', { player_id: `eq.${player._row_id}` });
    if (myGang.length === 0) return;
    if (myGang[0].role !== 'leader') {
      alert('Doar liderul poate face upgrade-uri!');
      return;
    }

    const gangId = myGang[0].gang_id;
    const existing = upgrades.find((u: any) => u.upgrade_type === type);
    const newLevel = existing ? existing.level + 1 : 1;
    const cost = newLevel * 5000;

    if (player.money < cost) {
      alert(`Nu ai destui bani! Cost: $${cost}`);
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - cost,
    });

    if (existing) {
      await db.update('gang_upgrades', { _row_id: `eq.${existing._row_id}` }, { level: newLevel });
    } else {
      await db.insert('gang_upgrades', {
        gang_id: gangId,
        upgrade_type: type,
        level: newLevel,
      });
    }

    onUpdate();
    loadData();
  };

  if (!player) return null;

  const cities = ['București', 'Cluj-Napoca', 'Timișoara', 'Constanța', 'Iași', 'Brașov'];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Flag className="w-4 h-4 text-crimson" /> WARFARE
      </h2>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> TERITORII
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cities.map(city => {
            const territory = territories.find((t: any) => t.city === city);
            const control = territory?.control_level || 0;
            return (
              <div key={city} className="p-3 rounded border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs">{city}</span>
                  <span className={control > 50 ? 'text-green-400' : 'text-crimson'}>{control}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all ${control > 50 ? 'bg-green-500' : 'bg-crimson'}`} 
                    style={{ width: `${control}%` }} 
                  />
                </div>
                <button
                  onClick={() => raidTerritory(city)}
                  className="w-full py-1.5 bg-crimson/90 text-white text-xs rounded hover:bg-crimson/80"
                >
                  Raid (30⚡)
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> UPGRADE-uri
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { type: 'income', name: 'Income', desc: '+10% venituri' },
            { type: 'defense', name: 'Defense', desc: '+5% apărare' },
            { type: 'attack', name: 'Attack', desc: '+5% atac' },
            { type: 'member', name: 'Members', desc: '+2 membri' },
          ].map(upgrade => {
            const current = upgrades.find((u: any) => u.upgrade_type === upgrade.type);
            const level = current?.level || 0;
            const cost = (level + 1) * 5000;
            return (
              <div key={upgrade.type} className="p-3 rounded bg-secondary/50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{upgrade.name}</span>
                  <span className="text-gold">Lvl {level}</span>
                </div>
                <p className="text-muted-foreground text-[10px] mb-2">{upgrade.desc}</p>
                <button
                  onClick={() => buyUpgrade(upgrade.type)}
                  className="w-full py-1.5 bg-gold/20 border border-gold/40 text-gold text-xs rounded hover:bg-gold/30"
                >
                  Upgrade (${cost.toLocaleString()})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GangWarfarePanel;

import { useState } from 'react';
import { Building, DollarSign, Shield } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { INITIAL_PROPERTIES } from '@/data/gameData';

const PropertiesPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);

  const loadProperties = async () => {
    if (!player) return;
    const owned = await db.query('properties', { player_id: `eq.${player._row_id}` });
    setMyProperties(owned);
    
    const all = await db.query('shop_properties', {});
    if (all.length === 0) {
      for (const prop of INITIAL_PROPERTIES) {
        await db.insert('shop_properties', prop);
      }
      setAvailable(INITIAL_PROPERTIES);
    } else {
      setAvailable(all);
    }
  };

  useState(() => { loadProperties(); });
  
  const buyProperty = async (prop: any) => {
    if (!player) return;
    if (player.money < prop.price) {
      alert('Nu ai destui bani!');
      return;
    }
    if (player.level < prop.level_req) {
      alert(`Nivel ${prop.level_req} necesar!`);
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - prop.price
    });

    await db.insert('properties', {
      player_id: player._row_id,
      property_type: prop.type,
      property_id: prop.property_id,
      name: prop.name,
      city: 'București',
      income: prop.base_income,
      level: 1,
      defense_bonus: prop.defense_bonus,
    });

    onUpdate();
    loadProperties();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Building className="w-4 h-4 text-gold" /> PROPRIETĂȚI
      </h2>

      <div>
        <h3 className="text-xs font-medium mb-2">DEȚINUTE ({myProperties.length})</h3>
        {myProperties.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nu ai niciun proprietate.</p>
        ) : (
          <div className="space-y-2">
            {myProperties.map(prop => (
              <div key={prop._row_id} className="p-3 rounded bg-secondary/50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{prop.name}</span>
                  <span className="text-gold">${prop.income}/zi</span>
                </div>
                <div className="text-muted-foreground">
                  {prop.property_type === 'residence' && '🏠 Reședință'}
                  {prop.property_type === 'business' && '💼 Afacere'}
                  {prop.property_type === 'safehouse' && '🛡️ Safehouse'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">DE CUMPĂRAT</h3>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {available.map(prop => {
            const owned = myProperties.find((p: any) => p.property_id === prop.property_id);
            const canAfford = player.money >= prop.price;
            return (
              <div key={prop.property_id} className={`p-3 rounded border text-xs ${owned ? 'border-gold/30 bg-gold/5' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium">{prop.name}</span>
                  {owned && <span className="text-gold">✓</span>}
                </div>
                <p className="text-muted-foreground text-[10px] mb-2">{prop.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  {prop.base_income > 0 && <span className="text-gold">+${prop.base_income}/zi</span>}
                  {prop.defense_bonus > 0 && <span className="text-blue-400">+{prop.defense_bonus} DEF</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${canAfford ? 'text-gold' : 'text-red-400'}`}>
                    ${prop.price.toLocaleString()}
                  </span>
                  {!owned && (
                    <button
                      onClick={() => buyProperty(prop)}
                      disabled={!canAfford}
                      className="px-2 py-1 bg-crimson text-white rounded text-xs disabled:opacity-50"
                    >
                      Cumpără
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

export default PropertiesPanel;

import { useState, useEffect } from 'react';
import { ShoppingCart, Zap } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { INITIAL_SHOP_ITEMS } from '@/data/shopItems';

const ShopPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'weapon' | 'vehicle' | 'armor' | 'tool'>('all');
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    loadShop();
    loadMyItems();
  }, [player]);

  const loadShop = async () => {
    const existing = await db.query('shop_items', {});
    if (existing.length === 0) {
      // Initialize shop
      for (const item of INITIAL_SHOP_ITEMS) {
        await db.insert('shop_items', item);
      }
      setItems(INITIAL_SHOP_ITEMS);
    } else {
      setItems(existing);
    }
  };

  const loadMyItems = async () => {
    if (!player) return;
    const inv = await db.query('items', { player_id: `eq.${player._row_id}` });
    setMyItems(inv);
  };

  const buyItem = async (shopItem: any) => {
    if (!player || buying) return;
    if (player.money < shopItem.price) {
      alert('Nu ai destui bani!');
      return;
    }
    if (player.level < shopItem.level_req) {
      alert(`Nivel ${shopItem.level_req} necesar!`);
      return;
    }

    setBuying(shopItem.item_id);

    // Check if already owns
    const owns = myItems.find(i => i.item_id === shopItem.item_id);
    if (owns) {
      alert('Ai deja acest item!');
      setBuying(null);
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - shopItem.price
    });

    await db.insert('items', {
      player_id: player._row_id,
      item_type: shopItem.type,
      item_id: shopItem.item_id,
      name: shopItem.name,
      attack_bonus: shopItem.attack_bonus || 0,
      defense_bonus: shopItem.defense_bonus || 0,
      speed_bonus: shopItem.speed_bonus || 0,
      crime_bonus: shopItem.crime_bonus || 0,
      equipped: 0,
    });

    onUpdate();
    loadMyItems();
    setBuying(null);
  };

  const equipItem = async (item: any) => {
    if (!player) return;
    
    // Unequip same type first
    const sameType = myItems.filter(i => i.item_type === item.item_type && i.equipped === 1);
    for (const other of sameType) {
      if (other._row_id !== item._row_id) {
        await db.update('items', { _row_id: `eq.${other._row_id}` }, { equipped: 0 });
      }
    }

    const newEquipped = item.equipped === 1 ? 0 : 1;
    await db.update('items', { _row_id: `eq.${item._row_id}` }, { equipped: newEquipped });

    // Recalculate stats
    const equippedItems = myItems.filter(i => {
      if (i._row_id === item._row_id) return newEquipped === 1;
      if (sameType.find(o => o._row_id === i._row_id)) return false;
      return i.equipped === 1;
    });

    const baseStats = { attack: 5, defense: 5, speed: 5 };
    const bonuses = equippedItems.reduce((acc, i) => ({
      attack: acc.attack + (i.attack_bonus || 0),
      defense: acc.defense + (i.defense_bonus || 0),
      speed: acc.speed + (i.speed_bonus || 0),
    }), { attack: 0, defense: 0, speed: 0 });

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      attack: baseStats.attack + bonuses.attack,
      defense: baseStats.defense + bonuses.defense,
      speed: baseStats.speed + bonuses.speed,
    });

    loadMyItems();
    onUpdate();
  };

  const filteredItems = filter === 'all' ? items : items.filter((i: any) => i.type === filter);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-gold" /> MAGAZIN
      </h2>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {(['all', 'weapon', 'vehicle', 'armor', 'tool'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              filter === f ? 'bg-crimson text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all' ? 'Toate' : f === 'weapon' ? 'Arme' : f === 'vehicle' ? 'Vehicule' : f === 'armor' ? 'Armuri' : 'Unelte'}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">DE CUMPĂRAT</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filteredItems.map(item => {
            const owned = myItems.find(i => i.item_id === item.item_id);
            const canAfford = player && player.money >= item.price;
            const levelOk = player && player.level >= item.level_req;

            return (
              <div
                key={item.item_id}
                className={`p-3 rounded border text-xs ${
                  owned ? 'border-gold/30 bg-gold/5' : 'border-border hover:border-crimson/40'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  {owned && <span className="text-gold">✓</span>}
                </div>
                <p className="text-muted-foreground text-[10px] mb-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.attack_bonus > 0 && <span className="px-1.5 py-0.5 bg-red-900/30 text-red-400 rounded">+{item.attack_bonus} ATK</span>}
                  {item.defense_bonus > 0 && <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded">+{item.defense_bonus} DEF</span>}
                  {item.speed_bonus > 0 && <span className="px-1.5 py-0.5 bg-cyan-900/30 text-cyan-400 rounded">+{item.speed_bonus} SPD</span>}
                  {item.crime_bonus > 0 && <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded">+{item.crime_bonus} CRIME</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${canAfford ? 'text-gold' : 'text-red-400'}`}>
                      ${item.price?.toLocaleString()}
                    </span>
                    {!levelOk && <span className="text-red-400 text-[10px] ml-1">(Lvl {item.level_req})</span>}
                  </div>
                  {!owned && (
                    <button
                      onClick={() => buyItem(item)}
                      disabled={!canAfford || !levelOk || buying === item.item_id}
                      className="px-2 py-1 bg-crimson text-white rounded text-xs disabled:opacity-50"
                    >
                      {buying === item.item_id ? '...' : 'Cumpără'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> INVENTARUL TĂU ({myItems.length})
        </h3>
        {myItems.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nu ai niciun item.</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {myItems.map(item => (
              <button
                key={item._row_id}
                onClick={() => equipItem(item)}
                className={`w-full p-2 rounded text-left text-xs transition-colors flex items-center justify-between ${
                  item.equipped === 1 ? 'bg-gold/20 border border-gold/40' : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {item.attack_bonus > 0 && <span className="text-red-400">+{item.attack_bonus}</span>}
                    {item.defense_bonus > 0 && <span className="text-blue-400">+{item.defense_bonus}</span>}
                    {item.speed_bonus > 0 && <span className="text-cyan-400">+{item.speed_bonus}</span>}
                  </div>
                  {item.equipped === 1 && <span className="text-gold">●</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPanel;

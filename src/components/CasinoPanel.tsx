import { useState } from 'react';
import { Dices, TrendingUp, TrendingDown } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const CasinoPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [bet, setBet] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    if (!player) return;
    const h = await db.query('casino_bets', { player_id: `eq.${player._row_id}`, order: '_created_at.desc', limit: '10' });
    setHistory(h);
  };

  useState(() => { loadHistory(); });

  const playGame = async (game: 'slots' | 'roulette' | 'coinflip', choice?: string) => {
    if (!player) return;
    const betAmount = parseInt(bet);
    if (!betAmount || betAmount <= 0) return;
    if (betAmount > player.money) {
      alert('Nu ai destui bani!');
      return;
    }

    let winnings = 0;
    let result = '';

    if (game === 'slots') {
      const symbols = ['🍒', '🍋', '🍊', '💎', '7️⃣'];
      const r1 = symbols[Math.floor(Math.random() * symbols.length)];
      const r2 = symbols[Math.floor(Math.random() * symbols.length)];
      const r3 = symbols[Math.floor(Math.random() * symbols.length)];
      
      if (r1 === r2 && r2 === r3) {
        winnings = betAmount * (r1 === '7️⃣' ? 50 : r1 === '💎' ? 20 : 10);
        result = `${r1} ${r2} ${r3} - JACKPOT! +$${winnings}`;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        winnings = Math.floor(betAmount * 1.5);
        result = `${r1} ${r2} ${r3} - Mic câștig +$${winnings}`;
      } else {
        result = `${r1} ${r2} ${r3} - Ai pierdut`;
      }
    } else if (game === 'coinflip') {
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = (choice === 'heads' && flip === 'heads') || (choice === 'tails' && flip === 'tails');
      winnings = won ? betAmount * 2 : 0;
      result = `Ai ales ${choice} - A căzut ${flip}. ${won ? 'AI CÂȘTIGAT!' : 'Ai pierdut.'}`;
    } else if (game === 'roulette') {
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const rolled = numbers[Math.floor(Math.random() * numbers.length)];
      const betNum = parseInt(choice || '0');
      winnings = rolled === betNum ? betAmount * 35 : 0;
      result = `A căzut ${rolled}. ${rolled === betNum ? 'JACKPOT!' : 'Ai pierdut.'}`;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - betAmount + winnings
    });

    await db.insert('casino_bets', {
      player_id: player._row_id,
      game_type: game,
      bet_amount: betAmount,
      choice: choice || '',
      result: result,
      winnings: winnings,
    });

    setBet('');
    onUpdate();
    loadHistory();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Dices className="w-4 h-4 text-gold" /> CASINO
      </h2>

      <div className="p-3 bg-red-900/20 border border-red-900/50 rounded">
        <p className="text-xs text-red-300">⚠️ Atenție: Jocurile de noroc pot crea dependență. Joacă responsabil!</p>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Miză</label>
        <input
          type="number"
          value={bet}
          onChange={e => setBet(e.target.value)}
          placeholder="100"
          className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-medium mb-2">🎰 SLOTS</h3>
          <button
            onClick={() => playGame('slots')}
            className="w-full py-2 bg-purple-900/30 border border-purple-900/50 text-purple-300 rounded text-sm hover:bg-purple-900/40"
          >
            ÎNVRĂTEște (10x jackpot)
          </button>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2">🪙 STERS MONEDĂ</h3>
          <div className="flex gap-2">
            <button
              onClick={() => playGame('coinflip', 'heads')}
              className="flex-1 py-2 bg-blue-900/30 border border-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/40"
            >
              STema (2x)
            </button>
            <button
              onClick={() => playGame('coinflip', 'tails')}
              className="flex-1 py-2 bg-blue-900/30 border border-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/40"
            >
              Pilă (2x)
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2">🎡 ROULETTE</h3>
          <div className="grid grid-cols-5 gap-1">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={() => playGame('roulette', n.toString())}
                className="py-1 bg-green-900/30 border border-green-900/50 text-green-300 rounded text-xs hover:bg-green-900/40"
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">35x câștig pe număr</p>
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-medium mb-2">ISTORIC</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.map(h => (
              <div key={h._row_id} className={`text-xs p-2 rounded ${h.winnings > 0 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                {h.result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoPanel;

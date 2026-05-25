import { useState, useEffect } from 'react';
import { Landmark, ArrowDownToLine, ArrowUpFromLine, Percent } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const BankPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState(0);

  useEffect(() => {
    if (!player) return;
    // Calculate daily interest (1% of bank balance)
    setInterest(Math.floor(player.bank * 0.01));
  }, [player]);

  const deposit = async () => {
    if (!player) return;
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return;
    if (amt > player.money) {
      alert('Nu ai destui bani!');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - amt,
      bank: player.bank + amt
    });

    setAmount('');
    onUpdate();
  };

  const withdraw = async () => {
    if (!player) return;
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return;
    if (amt > player.bank) {
      alert('Nu ai destui bani în bancă!');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money + amt,
      bank: player.bank - amt
    });

    setAmount('');
    onUpdate();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Landmark className="w-4 h-4 text-gold" /> BANCĂ
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Cash</div>
          <div className="text-lg font-bold text-green-400">${player.money?.toLocaleString()}</div>
        </div>
        <div className="bg-secondary rounded p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Cont Bancar</div>
          <div className="text-lg font-bold text-gold">${player.bank?.toLocaleString()}</div>
        </div>
      </div>

      <div className="p-3 bg-gold/5 border border-gold/20 rounded">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-gold">
            <Percent className="w-3.5 h-3.5" />
            Dobândă zilnică
          </span>
          <span className="font-medium">+${interest?.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Sumă</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={deposit}
            className="flex-1 py-2 bg-green-900/30 border border-green-900/50 text-green-400 text-sm rounded hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Depune
          </button>
          <button
            onClick={withdraw}
            className="flex-1 py-2 bg-crimson/90 text-white text-sm rounded hover:bg-crimson/80 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Retrage
          </button>
        </div>
        <button
          onClick={() => setAmount(player.money.toString())}
          className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Toți banii
        </button>
      </div>
    </div>
  );
};

export default BankPanel;

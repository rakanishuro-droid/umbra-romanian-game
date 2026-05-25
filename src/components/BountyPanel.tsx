import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const BountyPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [target, setTarget] = useState('');
  const [reward, setReward] = useState('');
  const [reason, setReason] = useState('');

  const placeBounty = async () => {
    if (!player) return;
    const amt = parseInt(reward);
    if (!amt || amt <= 0) return;
    if (amt > player.money) {
      alert('Nu ai destui bani!');
      return;
    }
    if (!target.trim()) {
      alert('Specifică numele!');
      return;
    }

    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - amt
    });

    await db.insert('bounties', {
      target_id: 0,
      target_username: target.trim(),
      placed_by_id: player._row_id,
      reward: amt,
      reason: reason.trim(),
      status: 'active',
    });

    setTarget('');
    setReward('');
    setReason('');
    onUpdate();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-gold" /> RECOMPENSE
      </h2>

      <div className="space-y-3">
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Numele țintei..."
          className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={reward}
          onChange={e => setReward(e.target.value)}
          placeholder="Recompensă ($)"
          className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm"
        />
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motiv (opțional)..."
          rows={2}
          className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={placeBounty}
          className="w-full py-2 bg-crimson text-white text-sm rounded hover:bg-crimson/80"
        >
          PLAȘEAZĂ RECOMPENSĂ
        </button>
      </div>
    </div>
  );
};

export default BountyPanel;

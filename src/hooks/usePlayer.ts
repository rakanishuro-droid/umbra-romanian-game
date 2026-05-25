import { useState, useEffect, useCallback } from 'react';
import db from '@/lib/shared/kliv-database.js';

export function usePlayer(user: any) {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayer = useCallback(async () => {
    if (!user) { setPlayer(null); setLoading(false); return; }
    const rows = await db.query('players', { _created_by: `eq.${user.userUuid}` });
    if (rows.length > 0) {
      setPlayer(rows[0]);
    } else {
      // Create new player with better username handling
      const existingPlayer = await db.query('players', { _created_by: `eq.${user.userUuid}` });
      if (existingPlayer.length > 0) {
        setPlayer(existingPlayer[0]);
        setLoading(false);
        return;
      }
      
      const name = user.firstName || user.email?.split('@')[0] || 'Player';
      const p = await db.insert('players', { username: name });
      setPlayer(p);
      // Also add to leaderboard
      await db.insert('leaderboard_cache', {
        player_id: p._row_id,
        username: name,
        level: 1, reputation: 0, money: 500, crimes_success: 0
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlayer(); }, [fetchPlayer]);

  const refreshPlayer = async () => {
    if (!user) return;
    const rows = await db.query('players', { _created_by: `eq.${user.userUuid}` });
    if (rows.length > 0) setPlayer(rows[0]);
  };

  return { player, loading, refreshPlayer };
}

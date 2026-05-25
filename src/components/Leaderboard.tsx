import { useState, useEffect } from 'react';
import { Trophy, Crown } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const Leaderboard = () => {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch all players
        const allPlayers = await db.query('players', { order: 'reputation.desc', limit: '50' });
        
        // Fetch admin role assignments
        const adminAssignments = await db.query('admin_role_assignments', {});
        
        // Get all player IDs that have admin roles
        const adminPlayerIds = new Set(adminAssignments.map((a: any) => a.player_id));
        
        // Filter out admin players from leaderboard
        const regularPlayers = allPlayers.filter((p: any) => !adminPlayerIds.has(p._row_id));
        
        // Take top 10 non-admin players and add position numbers
        const topPlayers = regularPlayers.slice(0, 10).map((p: any, index: number) => ({
          ...p,
          position: index + 1,
          is_staff: false
        }));
        
        setPlayers(topPlayers);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display text-sm tracking-wider mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-gold" /> CLASAMENT
      </h2>
      <div className="space-y-1.5">
        {players.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Niciun jucător încă.</p>
        )}
        {players.map((p, i) => (
          <div key={p._row_id} className={`flex items-center justify-between p-2 rounded text-xs ${p.is_staff ? 'bg-red-900/10 border border-red-900/20' : 'bg-secondary/50'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-display w-5 text-center ${i === 0 ? 'text-gold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {i === 0 ? <Crown className="w-3.5 h-3.5 text-gold inline" /> : `#${p.position}`}
              </span>
              <span className="font-medium">{p.username}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>Lvl {p.level}</span>
              <span className="text-gold">⭐ {p.reputation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

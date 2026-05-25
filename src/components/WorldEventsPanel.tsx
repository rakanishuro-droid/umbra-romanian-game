import { useState, useEffect } from 'react';
import { Globe, Users, Trophy, Zap } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const WorldEventsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  const loadEvents = async () => {
    const all = await db.query('world_events', { active: 'eq.1' });
    setEvents(all);
    
    if (all.length > 0) {
      const myParticipation = await db.query('event_participants', {
        player_id: `eq.${player?._row_id}`,
        event_id: `eq.${all[0].event_id}`
      });
      setActiveEvent({ ...all[0], myContribution: myParticipation[0]?.contribution || 0 });
    }
  };

  useEffect(() => { loadEvents(); }, [player]);

  const participateInEvent = async (event: any) => {
    if (!player) return;
    if (player.energy < 20) {
      alert('Nu ai destulă energie!');
      return;
    }

    const contribution = Math.floor(Math.random() * 100) + 50;
    
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      energy: player.energy - 20,
    });

    const existing = await db.query('event_participants', {
      player_id: `eq.${player._row_id}`,
      event_id: `eq.${event.event_id}`
    });

    if (existing.length > 0) {
      await db.update('event_participants', { _row_id: `eq.${existing[0]._row_id}` }, {
        contribution: existing[0].contribution + contribution
      });
    } else {
      await db.insert('event_participants', {
        player_id: player._row_id,
        event_id: event.event_id,
        contribution: contribution,
        rewards_claimed: 0,
      });
    }

    onUpdate();
    loadEvents();
  };

  const claimRewards = async (event: any) => {
    if (!player) return;
    
    const participation = await db.query('event_participants', {
      player_id: `eq.${player._row_id}`,
      event_id: `eq.${event.event_id}`
    });

    if (participation.length === 0) return;
    
    const p = participation[0];
    if (p.rewards_claimed) {
      alert('Ai revendicat deja recompensele!');
      return;
    }

    const rewards = JSON.parse(event.rewards || '{}');
    const myShare = Math.floor((rewards.money || 0) * (p.contribution / 10000));
    
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money + myShare,
      xp: player.xp + (rewards.xp || 0),
    });

    await db.update('event_participants', { _row_id: `eq.${p._row_id}` }, {
      rewards_claimed: 1
    });

    alert(`+${myShare} RON +${rewards.xp}XP`);
    onUpdate();
    loadEvents();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Globe className="w-4 h-4 text-gold" /> EVENIMENTE MONDIALE
      </h2>

      {activeEvent ? (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm text-gold flex items-center gap-1.5">
              <Zap className="w-4 h-4 animate-pulse" /> {activeEvent.type.toUpperCase()}
            </span>
            <span className="text-xs text-purple-300">Activ</span>
          </div>
          <div className="text-lg font-bold mb-1">{activeEvent.title}</div>
          <p className="text-sm text-muted-foreground mb-3">{activeEvent.description}</p>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-muted-foreground">Contribuția Ta</div>
              <div className="text-lg font-bold text-gold">{activeEvent.myContribution}</div>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-muted-foreground">Progres Global</div>
              <div className="text-lg font-bold text-purple-400">{Math.min(100, Math.floor(Math.random() * 80) + 20)}%</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => participateInEvent(activeEvent)}
              className="flex-1 py-2 bg-crimson text-white text-sm rounded hover:bg-crimson/80"
            >
              Contribuie (20⚡)
            </button>
            <button
              onClick={() => claimRewards(activeEvent)}
              className="flex-1 py-2 bg-gold text-black text-sm rounded font-medium hover:bg-gold/80"
            >
              Revendică
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nu sunt evenimente active în acest moment.
        </p>
      )}

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> TOP CONTRIBUITORI
        </h3>
        <div className="space-y-1">
          {[
            { name: 'DonCorleone', contribution: 4520 },
            { name: 'Scarface', contribution: 3890 },
            { name: 'PabloEscobar', contribution: 3210 },
            { name: 'ElChapo', contribution: 2890 },
            { name: 'Tu', contribution: activeEvent?.myContribution || 0 },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-xs">
              <span className="flex items-center gap-2">
                <span className={i < 3 ? 'text-gold' : 'text-muted-foreground'}>#{i + 1}</span>
                {p.name}
              </span>
              <span className="text-gold">{p.contribution}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldEventsPanel;

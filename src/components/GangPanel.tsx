import { useState, useEffect } from 'react';
import { Users, Shield, Crown, Plus, UserPlus } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const GangPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [gang, setGang] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [gangs, setGangs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGangName, setNewGangName] = useState('');
  const [newGangDesc, setNewGangDesc] = useState('');

  const loadData = async () => {
    if (!player) return;
    
    // Check if player is in a gang
    const myMembership = await db.query('gang_members', { player_id: `eq.${player._row_id}` });
    if (myMembership.length > 0) {
      const g = await db.query('gangs', { _row_id: `eq.${myMembership[0].gang_id}` });
      if (g.length > 0) setGang(g[0]);
      const m = await db.query('gang_members', { gang_id: `eq.${myMembership[0].gang_id}` });
      setMembers(m);
    } else {
      setGang(null);
      setMembers([]);
    }
    
    // Load all gangs
    const all = await db.query('gangs', { order: 'level.desc', limit: '20' });
    setGangs(all);
    
    // Load my applications
    const a = await db.query('gang_applications', { player_id: `eq.${player._row_id}` });
    setApps(a);
  };

  useEffect(() => { loadData(); }, [player]);

  const createGang = async () => {
    if (!newGangName.trim() || !player) return;
    if (player.money < 5000) {
      alert('Nu ai destui bani! Cost: $5,000');
      return;
    }
    
    const g = await db.insert('gangs', {
      name: newGangName.trim(),
      leader_id: player._row_id,
      description: newGangDesc.trim(),
      money: 0,
    });
    
    await db.insert('gang_members', {
      gang_id: g._row_id,
      player_id: player._row_id,
      role: 'leader',
      joined_at: Math.floor(Date.now() / 1000),
    });
    
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      money: player.money - 5000
    });
    
    setNewGangName('');
    setNewGangDesc('');
    setShowCreate(false);
    onUpdate();
    loadData();
  };

  const applyToGang = async (gangId: number) => {
    if (!player) return;
    await db.insert('gang_applications', {
      gang_id: gangId,
      player_id: player._row_id,
      status: 'pending',
    });
    loadData();
  };

  if (gang) {
    const isLeader = gang.leader_id === player._row_id;
    const pendingApps = apps.filter(a => a.gang_id === gang._row_id && a.status === 'pending');

    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-crimson" /> {gang.name}
          </h2>
          <span className="text-xs text-gold font-display">Lvl {gang.level}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-secondary rounded p-2 text-center">
            <div className="text-gold font-display">{gang.member_count}</div>
            <div className="text-muted-foreground">Membri</div>
          </div>
          <div className="bg-secondary rounded p-2 text-center">
            <div className="text-gold font-display">${gang.money?.toLocaleString()}</div>
            <div className="text-muted-foreground">Trezorerie</div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> MEMBRI ({members.length})
          </h3>
          <div className="space-y-1">
            {members.map(m => (
              <div key={m._row_id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-xs">
                <span className="flex items-center gap-1.5">
                  {m.role === 'leader' && <Crown className="w-3 h-3 text-gold" />}
                  {m.username}
                </span>
                <span className="text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {isLeader && pendingApps.length > 0 && (
          <div>
            <h3 className="text-xs font-medium mb-2">CERERI ({pendingApps.length})</h3>
            <div className="space-y-1">
              {pendingApps.map(app => (
                <div key={app._row_id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-xs">
                  <span>{app.username}</span>
                  <div className="flex gap-1">
                    <button onClick={async () => {
                      await db.update('gang_applications', { _row_id: `eq.${app._row_id}` }, { status: 'accepted' });
                      await db.insert('gang_members', {
                        gang_id: gang._row_id,
                        player_id: app.player_id,
                        role: 'member',
                        joined_at: Math.floor(Date.now() / 1000),
                      });
                      await db.update('gangs', { _row_id: `eq.${gang._row_id}` }, { member_count: gang.member_count + 1 });
                      loadData();
                    }} className="p-1 bg-green-900/30 text-green-400 rounded">✓</button>
                    <button onClick={async () => {
                      await db.update('gang_applications', { _row_id: `eq.${app._row_id}` }, { status: 'rejected' });
                      loadData();
                    }} className="p-1 bg-red-900/30 text-red-400 rounded">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Shield className="w-4 h-4 text-crimson" /> GĂSȚI
      </h2>

      {!showCreate ? (
        <>
          <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded hover:border-crimson/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" /> Creează o Gască ($5,000)
          </button>

          <div className="space-y-2">
            <h3 className="text-xs font-medium">GĂȘTI DISPONIBILE</h3>
            {gangs.map(g => {
              const myApp = apps.find(a => a.gang_id === g._row_id);
              return (
                <div key={g._row_id} className="p-3 rounded border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{g.name}</span>
                    <span className="text-xs text-gold">Lvl {g.level}</span>
                  </div>
                  {g.description && <p className="text-xs text-muted-foreground mb-2">{g.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{g.member_count} membri</span>
                    {myApp ? (
                      <span className="text-xs text-yellow-400">
                        {myApp.status === 'pending' ? 'În așteptare...' : myApp.status}
                      </span>
                    ) : (
                      <button onClick={() => applyToGang(g._row_id)} className="text-xs flex items-center gap-1 text-crimson hover:underline">
                        <UserPlus className="w-3 h-3" /> Aplică
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-medium">CREEAZĂ GASKĂ</h3>
          <input
            value={newGangName}
            onChange={e => setNewGangName(e.target.value)}
            placeholder="Numele gștii..."
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm"
          />
          <textarea
            value={newGangDesc}
            onChange={e => setNewGangDesc(e.target.value)}
            placeholder="Descriere (opțional)..."
            rows={2}
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm resize-none"
          />
          <div className="flex gap-2">
            <button onClick={createGang} className="flex-1 py-2 bg-crimson text-white text-sm rounded hover:bg-crimson/80">
              Creează ($5,000)
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border text-sm rounded hover:bg-secondary">
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GangPanel;

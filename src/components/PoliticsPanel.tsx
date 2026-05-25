import { useState, useEffect } from 'react';
import { Vote, Scale, Users, TrendingUp } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const PoliticsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [elections, setElections] = useState<any[]>([]);
  const [laws, setLaws] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [showLawCreate, setShowLawCreate] = useState(false);
  const [lawTitle, setLawTitle] = useState('');
  const [lawDesc, setLawDesc] = useState('');

  const loadData = async () => {
    if (!player) return;
    
    const activeElections = await db.query('elections', { status: 'eq.active' });
    setElections(activeElections);
    
    const activeLaws = await db.query('laws', { status: 'eq.active', order: '_created_at.desc' });
    setLaws(activeLaws);
    
    const votes = await db.query('votes', { player_id: `eq.${player._row_id}` });
    setMyVotes(votes);
  };

  useEffect(() => { loadData(); }, [player]);

  const voteForCandidate = async (electionId: number) => {
    if (!player) return;
    
    const alreadyVoted = myVotes.find(v => v.target_type === 'election' && v.target_id === electionId);
    if (alreadyVoted) {
      alert('Ai votat deja la aceste alegeri!');
      return;
    }

    await db.insert('votes', {
      player_id: player._row_id,
      target_type: 'election',
      target_id: electionId,
      choice: 'support',
    });

    await db.update('elections', { _row_id: `eq.${electionId}` }, {
      votes: (elections.find((e: any) => e._row_id === electionId)?.votes || 0) + 1
    });

    loadData();
  };

  const createLaw = async () => {
    if (!player || !lawTitle.trim()) return;
    if (player.level < 10) {
      alert('Nivel 10 necesar pentru a propune legi!');
      return;
    }

    await db.insert('laws', {
      title: lawTitle.trim(),
      description: lawDesc.trim(),
      proposed_by: player._row_id,
      votes_for: 0,
      votes_against: 0,
      status: 'active',
      type: 'economic',
      effect_value: 0,
    });

    setLawTitle('');
    setLawDesc('');
    setShowLawCreate(false);
    loadData();
  };

  const voteLaw = async (lawId: number, choice: 'for' | 'against') => {
    if (!player) return;
    
    const alreadyVoted = myVotes.find(v => v.target_type === 'law' && v.target_id === lawId);
    if (alreadyVoted) {
      alert('Ai votat deja la această lege!');
      return;
    }

    await db.insert('votes', {
      player_id: player._row_id,
      target_type: 'law',
      target_id: lawId,
      choice: choice,
    });

    const law = laws.find((l: any) => l._row_id === lawId);
    await db.update('laws', { _row_id: `eq.${lawId}` }, {
      votes_for: law.votes_for + (choice === 'for' ? 1 : 0),
      votes_against: law.votes_against + (choice === 'against' ? 1 : 0),
    });

    loadData();
  };

  if (!player) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="font-display text-sm tracking-wider flex items-center gap-2">
        <Scale className="w-4 h-4 text-gold" /> POLITICĂ
      </h2>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Vote className="w-3.5 h-3.5" /> ALEGERI ACTIVE
        </h3>
        {elections.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            Nu sunt alegeri active în acest moment.
          </div>
        ) : (
          <div className="space-y-2">
            {elections.map(election => {
              const hasVoted = myVotes.find(v => v.target_type === 'election' && v.target_id === election._row_id);
              return (
                <div key={election._row_id} className="p-3 rounded bg-secondary/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Candidat #{election.candidate_id}</span>
                    <span className="text-gold">{election.votes} voturi</span>
                  </div>
                  <button
                    onClick={() => voteForCandidate(election._row_id)}
                    disabled={hasVoted}
                    className="w-full py-1.5 bg-crimson text-white rounded disabled:opacity-50"
                  >
                    {hasVoted ? 'Ai votat ✓' : 'VOTEAZĂ'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5" /> LEGI PROPUSE
        </h3>
        {!showLawCreate && player.level >= 10 && (
          <button
            onClick={() => setShowLawCreate(true)}
            className="w-full py-2 mb-3 border border-dashed border-border text-xs text-muted-foreground hover:text-foreground rounded hover:border-crimson/40 transition-colors"
          >
            + Propune o Lege
          </button>
        )}

        {showLawCreate && (
          <div className="p-3 rounded border border-border space-y-2 mb-3">
            <input
              value={lawTitle}
              onChange={e => setLawTitle(e.target.value)}
              placeholder="Titlul legii..."
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm"
            />
            <textarea
              value={lawDesc}
              onChange={e => setLawDesc(e.target.value)}
              placeholder="Descriere..."
              rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm resize-none"
            />
            <div className="flex gap-2">
              <button onClick={createLaw} className="flex-1 py-2 bg-crimson text-white text-sm rounded">Propune</button>
              <button onClick={() => setShowLawCreate(false)} className="px-4 py-2 border border-border text-sm rounded">Anulează</button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {laws.map(law => {
            const hasVoted = myVotes.find(v => v.target_type === 'law' && v.target_id === law._row_id);
            const totalVotes = law.votes_for + law.votes_against;
            const supportPct = totalVotes > 0 ? Math.round((law.votes_for / totalVotes) * 100) : 0;
            return (
              <div key={law._row_id} className="p-3 rounded border border-border text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{law.title}</span>
                  <span className={supportPct > 50 ? 'text-green-400' : 'text-red-400'}>{supportPct}% suport</span>
                </div>
                {law.description && <p className="text-muted-foreground mb-2">{law.description}</p>}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-green-500" style={{ width: `${supportPct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                  <span>✓ {law.votes_for}</span>
                  <span>✕ {law.votes_against}</span>
                  <span>Total: {totalVotes}</span>
                </div>
                {!hasVoted && (
                  <div className="flex gap-1">
                    <button onClick={() => voteLaw(law._row_id, 'for')} className="flex-1 py-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/40">Pentru</button>
                    <button onClick={() => voteLaw(law._row_id, 'against')} className="flex-1 py-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/40">Împotrivă</button>
                  </div>
                )}
                {hasVoted && <div className="text-center text-gold text-[10px] py-1">Ai votat ✓</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoliticsPanel;

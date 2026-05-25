import { useState, useEffect } from 'react';
import { Ticket, MessageSquare, Bug, AlertTriangle, CheckCircle, Clock, User, Filter, Search } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const SupportPanel = ({ player }: { player: any }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'bugs' | 'my_tickets'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewBug, setShowNewBug] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, [player]);

  const loadData = async () => {
    if (!player) return;

    try {
      const allTickets = await db.query('support_tickets', {});
      const allBugs = await db.query('bug_reports', {});
      
      setTickets(allTickets);
      setBugs(allBugs);
      setMyTickets(allTickets.filter((t: any) => t.player_id === player._row_id));
    } catch (error) {
      console.error('Error loading support data:', error);
    }
  };

  const createTicket = async (title: string, description: string, category: string, priority: string) => {
    try {
      await db.insert('support_tickets', {
        title,
        description,
        category,
        priority,
        player_id: player._row_id,
        created_by: player._row_id,
        status: 'open'
      });

      alert('Tichet creat cu succes!');
      setShowNewTicket(false);
      loadData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Eroare la creare tichet: ' + error);
    }
  };

  const createBugReport = async (title: string, description: string, category: string, severity: string, reproducible: boolean, steps: string) => {
    try {
      await db.insert('bug_reports', {
        title,
        description,
        category,
        severity,
        reproducible: reproducible ? 1 : 0,
        reproduction_steps: steps,
        player_id: player._row_id,
        created_by: player._row_id,
        status: 'open'
      });

      alert('Raport bug trimis!');
      setShowNewBug(false);
      loadData();
    } catch (error) {
      console.error('Error creating bug report:', error);
      alert('Eroare la trimitere raport: ' + error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-900/30 text-red-400';
      case 'in_progress': return 'bg-yellow-900/30 text-yellow-400';
      case 'resolved': return 'bg-green-900/30 text-green-400';
      case 'closed': return 'bg-gray-900/30 text-gray-400';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-900/50 text-red-300';
      case 'high': return 'bg-orange-900/50 text-orange-300';
      case 'normal': return 'bg-blue-900/50 text-blue-300';
      case 'low': return 'bg-gray-900/50 text-gray-300';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 text-red-300';
      case 'high': return 'bg-orange-900/50 text-orange-300';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300';
      case 'low': return 'bg-blue-900/50 text-blue-300';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === 'all') return true;
    return ticket.status === filterStatus;
  });

  const filteredBugs = bugs.filter(bug => {
    if (filterStatus === 'all') return true;
    return bug.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Ticket className="w-6 h-6 text-gold" />
            SUPORT & BUG REPORTS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ai probleme? Raportează-ne și te ajutăm!
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowNewTicket(true)}
            className="px-4 py-2 bg-gold/90 text-black rounded-lg font-medium hover:bg-gold/80 transition-colors"
          >
            + Tichet Nou
          </button>
          <button 
            onClick={() => setShowNewBug(true)}
            className="px-4 py-2 bg-red-900/90 text-white rounded-lg font-medium hover:bg-red-900/80 transition-colors"
          >
            🐛 Raportează Bug
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'tickets'
              ? 'text-gold border-b-2 border-gold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ticket className="w-4 h-4 inline mr-2" />
          Toate Tichetele ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'bugs'
              ? 'text-gold border-b-2 border-gold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bug className="w-4 h-4 inline mr-2" />
          Bug Reports ({bugs.length})
        </button>
        <button
          onClick={() => setActiveTab('my_tickets')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my_tickets'
              ? 'text-gold border-b-2 border-gold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Tichetele Mele ({myTickets.length})
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-secondary border border-border rounded px-3 py-1 text-sm"
        >
          <option value="all">Toate Statusurile</option>
          <option value="open">Deschise</option>
          <option value="in_progress">În Progres</option>
          <option value="resolved">Rezolvate</option>
          <option value="closed">Închise</option>
        </select>
      </div>

      {/* Content */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          <h3 className="text-lg font-display">TICHETE SUPORT</h3>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Nu sunt tichete de suport.
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div key={ticket._row_id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Player #{ticket.player_id}</span>
                      <span>{ticket.category}</span>
                      <span>🕐 {new Date(ticket._created_at * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {ticket.response && (
                  <div className="mt-3 p-3 bg-secondary/50 rounded text-sm">
                    <div className="font-medium text-gold mb-1">Răspuns Admin:</div>
                    <div>{ticket.response}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'bugs' && (
        <div className="space-y-3">
          <h3 className="text-lg font-display">RAPORTE BUG</h3>
          {filteredBugs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Nu sunt rapoarte de bug-uri.
            </div>
          ) : (
            filteredBugs.map(bug => (
              <div key={bug._row_id} className="bg-card border border-red-900/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        {bug.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(bug.status)}`}>
                        {bug.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(bug.severity)}`}>
                        {bug.severity.toUpperCase()}
                      </span>
                      {bug.reproducible ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-400">
                          REPRODUCIBIL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-900/30 text-gray-400">
                          NU REPRODUCIBIL
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bug.description}</p>
                    {bug.reproduction_steps && (
                      <div className="mb-2">
                        <div className="font-medium text-xs mb-1">Pași de reproducere:</div>
                        <div className="text-xs text-muted-foreground">{bug.reproduction_steps}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Player #{bug.player_id}</span>
                      <span>{bug.category}</span>
                      <span>🕐 {new Date(bug._created_at * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {bug.response && (
                  <div className="mt-3 p-3 bg-secondary/50 rounded text-sm">
                    <div className="font-medium text-gold mb-1">Răspuns Developer:</div>
                    <div>{bug.response}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'my_tickets' && (
        <div className="space-y-3">
          <h3 className="text-lg font-display">TICHETELE MELE</h3>
          {myTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Nu ai tichete deschise.
            </div>
          ) : (
            myTickets.map(ticket => (
              <div key={ticket._row_id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  </div>
                </div>
                {ticket.response && (
                  <div className="mt-3 p-3 bg-gold/10 rounded text-sm border border-gold/20">
                    <div className="font-medium text-gold mb-1">Răspuns Admin:</div>
                    <div>{ticket.response}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-display mb-4">Tichet Suport Nou</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titlu</label>
                <input 
                  type="text" 
                  id="ticket-title"
                  placeholder="Descriere scurtă a problemei..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descriere Detaliată</label>
                <textarea 
                  id="ticket-description"
                  rows={4}
                  placeholder="Descrie problema în detaliu..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Categorie</label>
                  <select id="ticket-category" className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                    <option value="general">General</option>
                    <option value="account">Cont</option>
                    <option value="payment">Plată</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Cerere Funcționalitate</option>
                    <option value="abuse">Abuz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioritate</label>
                  <select id="ticket-priority" className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                    <option value="low">Scăzută</option>
                    <option value="normal">Normală</option>
                    <option value="high">Ridicată</option>
                    <option value="urgent">Urgentă</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const title = (document.getElementById('ticket-title') as HTMLInputElement).value;
                    const description = (document.getElementById('ticket-description') as HTMLInputElement).value;
                    const category = (document.getElementById('ticket-category') as HTMLSelectElement).value;
                    const priority = (document.getElementById('ticket-priority') as HTMLSelectElement).value;
                    if (title && description) {
                      createTicket(title, description, category, priority);
                    } else {
                      alert('Completează toate câmpurile!');
                    }
                  }}
                  className="flex-1 py-2 bg-gold text-black rounded font-medium hover:bg-gold/80"
                >
                  Trimite Tichet
                </button>
                <button 
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 py-2 bg-secondary text-white rounded hover:bg-secondary/80"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Bug Report Modal */}
      {showNewBug && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border border-red-900/50 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-display mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Raportează Bug
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titlu Bug</label>
                <input 
                  type="text" 
                  id="bug-title"
                  placeholder="Ce bug ai descoperit?..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descriere Detaliată</label>
                <textarea 
                  id="bug-description"
                  rows={4}
                  placeholder="Descrie bug-ul în detaliu..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pași de Reproducere</label>
                <textarea 
                  id="bug-steps"
                  rows={3}
                  placeholder="1. Mergi la...
2. Click pe...
3. Apare bug..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Severitate</label>
                  <select id="bug-severity" className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                    <option value="low">Scăzută</option>
                    <option value="medium">Medie</option>
                    <option value="high">Ridicată</option>
                    <option value="critical">CRITICĂ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categorie</label>
                  <select id="bug-category" className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                    <option value="general">General</option>
                    <option value="ui">Interfață</option>
                    <option value="gameplay">Gameplay</option>
                    <option value="performance">Performanță</option>
                    <option value="crash">Crash</option>
                    <option value="security">Securitate</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="bug-reproducible" className="rounded" defaultChecked />
                <label htmlFor="bug-reproducible" className="text-sm">Bug reproductibil</label>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const title = (document.getElementById('bug-title') as HTMLInputElement).value;
                    const description = (document.getElementById('bug-description') as HTMLInputElement).value;
                    const category = (document.getElementById('bug-category') as HTMLSelectElement).value;
                    const severity = (document.getElementById('bug-severity') as HTMLSelectElement).value;
                    const reproducible = (document.getElementById('bug-reproducible') as HTMLInputElement).checked;
                    const steps = (document.getElementById('bug-steps') as HTMLInputElement).value;
                    if (title && description) {
                      createBugReport(title, description, category, severity, reproducible, steps);
                    } else {
                      alert('Completează toate câmpurile obligatorii!');
                    }
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                >
                  Trimite Bug Report
                </button>
                <button 
                  onClick={() => setShowNewBug(false)}
                  className="flex-1 py-2 bg-secondary text-white rounded hover:bg-secondary/80"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPanel;

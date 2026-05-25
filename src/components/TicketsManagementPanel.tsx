import { useState, useEffect } from 'react';
import { Shield, Users, Code, Bug, Ticket, Crown, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const TicketsManagementPanel = ({ player }: { player: any }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'bugs' | 'roles'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [adminLevel, setAdminLevel] = useState(0);

  useEffect(() => {
    if (!player || player.level < 10) return;
    loadData();
    checkAdminLevel();
  }, [player]);

  const checkAdminLevel = async () => {
    const assignment = await db.query('admin_role_assignments', { player_id: `eq.${player._row_id}` });
    if (assignment.length > 0) {
      const role = await db.query('admin_roles', { _row_id: `eq.${assignment[0].role_id}` });
      if (role.length > 0) {
        setAdminLevel(role[0].level);
      }
    }
  };

  const loadData = async () => {
    try {
      setTickets(await db.query('support_tickets', {}));
      setBugs(await db.query('bug_reports', {}));
      setRoles(await db.query('admin_roles', {}));
      setRoleAssignments(await db.query('admin_role_assignments', {}));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await db.update('support_tickets', { _row_id: `eq.${ticketId}` }, { status });
      loadData();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const updateBugStatus = async (bugId: number, status: string) => {
    try {
      await db.update('bug_reports', { _row_id: `eq.${bugId}` }, { status });
      loadData();
    } catch (error) {
      console.error('Error updating bug:', error);
    }
  };

  const addResponse = async (type: 'ticket' | 'bug') => {
    if (!responseText.trim()) return;

    try {
      if (type === 'ticket' && selectedTicket) {
        await db.update('support_tickets', { _row_id: `eq.${selectedTicket._row_id}` }, { 
          response: responseText,
          status: 'in_progress'
        });
      } else if (type === 'bug' && selectedBug) {
        await db.update('bug_reports', { _row_id: `eq.${selectedBug._row_id}` }, { 
          response: responseText,
          status: 'in_progress'
        });
      }
      setResponseText('');
      setSelectedTicket(null);
      setSelectedBug(null);
      loadData();
      alert('Răspuns adăugat!');
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Eroare la adăugare răspuns: ' + error);
    }
  };

  const assignRole = async (playerId: number, roleId: number) => {
    try {
      await db.insert('admin_role_assignments', {
        player_id: playerId,
        role_id: roleId,
        assigned_by: player._row_id,
        assigned_at: Math.floor(Date.now() / 1000)
      });
      loadData();
      alert('Rol asignat!');
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Eroare la asignare rol: ' + error);
    }
  };

  const removeRole = async (assignmentId: number) => {
    try {
      await db.delete('admin_role_assignments', { _row_id: `eq.${assignmentId}` });
      loadData();
      alert('Rol eliminat!');
    } catch (error) {
      console.error('Error removing role:', error);
      alert('Eroare la eliminare rol: ' + error);
    }
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r._row_id === roleId);
    return role ? role.role_name : 'Unknown';
  };

  const getRoleLevel = (roleId: number) => {
    const role = roles.find(r => r._row_id === roleId);
    return role ? role.level : 0;
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'developer': return 'text-red-400 bg-red-900/30';
      case 'admin': return 'text-gold bg-gold/30';
      case 'moderator': return 'text-blue-400 bg-blue-900/30';
      case 'helper': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
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

  if (!player || player.level < 10) {
    return (
      <div className="bg-card border border-red-900/50 rounded-lg p-8 text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">ACCES RESTRICȚIONAT</h2>
        <p className="text-muted-foreground">Nivel 10 necesar pentru acces la tichete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-gold" />
              MANAGEMENT TICHETE & ROLURI
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Rol curent: Level {adminLevel}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">{tickets.length + bugs.length}</div>
            <div className="text-xs text-muted-foreground">Total Tichete</div>
          </div>
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
          Tichete ({tickets.length})
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
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'roles'
              ? 'text-gold border-b-2 border-gold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Roluri Admin
        </button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          <h3 className="text-lg font-display">TICHETE SUPORT</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nu sunt tichete de gestionat.
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket._row_id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        ticket.priority === 'urgent' ? 'bg-red-900/50 text-red-300' :
                        ticket.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                        ticket.priority === 'normal' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-gray-900/50 text-gray-300'
                      }`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Player #{ticket.player_id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Categoria: {ticket.category} | 🕐 {new Date(ticket._created_at * 1000).toLocaleString()}
                    </div>
                    {ticket.response && (
                      <div className="mt-2 p-2 bg-secondary/50 rounded text-sm">
                        <div className="font-medium text-gold text-xs mb-1">Răspuns:</div>
                        <div className="text-xs">{ticket.response}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <select 
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket._row_id, e.target.value)}
                      className="bg-secondary border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button 
                      onClick={() => { setSelectedTicket(ticket); setResponseText(ticket.response || ''); }}
                      className="px-3 py-1 bg-gold/20 text-gold text-xs rounded hover:bg-gold/30"
                    >
                      Răspunde
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bugs Tab */}
      {activeTab === 'bugs' && (
        <div className="space-y-3">
          <h3 className="text-lg font-display">RAPORTE BUG</h3>
          {bugs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nu sunt bug-uri de gestionat.
            </div>
          ) : (
            bugs.map(bug => (
              <div key={bug._row_id} className="bg-card border border-red-900/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        {bug.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(bug.status)}`}>
                        {bug.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        bug.severity === 'critical' ? 'bg-red-900/50 text-red-300' :
                        bug.severity === 'high' ? 'bg-orange-900/50 text-orange-300' :
                        bug.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-blue-900/50 text-blue-300'
                      }`}>
                        {bug.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Player #{bug.player_id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bug.description}</p>
                    {bug.reproduction_steps && (
                      <div className="mb-2">
                        <div className="font-medium text-xs mb-1">Pași reproducere:</div>
                        <div className="text-xs text-muted-foreground">{bug.reproduction_steps}</div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Categoria: {bug.category} | {bug.reproducible ? '✅ Reproductibil' : '❌ Nu reproductibil'} | 🕐 {new Date(bug._created_at * 1000).toLocaleString()}
                    </div>
                    {bug.response && (
                      <div className="mt-2 p-2 bg-secondary/50 rounded text-sm">
                        <div className="font-medium text-gold text-xs mb-1">Răspuns:</div>
                        <div className="text-xs">{bug.response}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <select 
                      value={bug.status}
                      onChange={(e) => updateBugStatus(bug._row_id, e.target.value)}
                      className="bg-secondary border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button 
                      onClick={() => { setSelectedBug(bug); setResponseText(bug.response || ''); }}
                      className="px-3 py-1 bg-red-900/20 text-red-400 text-xs rounded hover:bg-red-900/30"
                    >
                      Răspunde
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <h3 className="text-lg font-display">ROLURI ADMIN</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {roles.map(role => (
              <div key={role._row_id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {role.role_name === 'developer' && <Code className="w-5 h-5 text-red-400" />}
                    {role.role_name === 'admin' && <Shield className="w-5 h-5 text-gold" />}
                    {role.role_name === 'moderator' && <Users className="w-5 h-5 text-blue-400" />}
                    {role.role_name === 'helper' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    <h4 className="font-medium capitalize">{role.role_name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${getRoleColor(role.role_name)}`}>
                    Level {role.level}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                <div className="text-xs">
                  <span className="font-medium">Permisii:</span> {role.permissions}
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-medium mb-2">ASIGNĂRI ROLURI ACTIVE</h4>
          {roleAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nu sunt roluri asignate.
            </div>
          ) : (
            <div className="space-y-2">
              {roleAssignments.map(assignment => (
                <div key={assignment._row_id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs ${getRoleColor(getRoleName(assignment.role_id))}`}>
                      {getRoleName(assignment.role_id).toUpperCase()}
                    </div>
                    <span className="text-sm">Player #{assignment.player_id}</span>
                    <span className="text-xs text-muted-foreground">
                      Level {getRoleLevel(assignment.role_id)}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeRole(assignment._row_id)}
                    className="px-3 py-1 bg-red-900/20 text-red-400 text-xs rounded hover:bg-red-900/30"
                  >
                    Elimină
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Response Modal */}
      {(selectedTicket || selectedBug) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-display mb-4">
              {selectedTicket ? 'Răspunde Tichet' : 'Răspunde Bug'}
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded text-sm">
                <div className="font-medium mb-1">{selectedTicket?.title || selectedBug?.title}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedTicket?.description || selectedBug?.description}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Răspunsul Tău</label>
                <textarea 
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Scrie răspunsul..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => addResponse(selectedTicket ? 'ticket' : 'bug')}
                  className="flex-1 py-2 bg-gold text-black rounded font-medium hover:bg-gold/80"
                >
                  Trimite Răspuns
                </button>
                <button 
                  onClick={() => { setSelectedTicket(null); setSelectedBug(null); setResponseText(''); }}
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

export default TicketsManagementPanel;

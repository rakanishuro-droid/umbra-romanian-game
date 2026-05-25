import { useState, useEffect } from 'react';
import { Shield, Users, Activity, MessageSquare, DollarSign, Trash2, Eye, Bell, Zap, Globe, Ban, Settings, ShieldAlert, Download, RefreshCw, BarChart3, Database, Key, Crown, Gift } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { grantPremiumCredits } from '@/utils/premiumSecurity';

interface AdminPanelProps {
  player: any;
  onUpdate: () => Promise<void>;
  userRole?: any;
}

const AdminPanel = ({ player, onUpdate, userRole }: AdminPanelProps) => {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<any[]>([]);
  const [serverStats, setServerStats] = useState<any>({});
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!player) return;
    loadData();
    checkAdminRole();
    loadServerStats();
  }, [player]);

  const loadData = async () => {
    if (!player) return;
    
    try {
      const allPlayers = await db.query('players', {});
      const totalCrimes = await db.query('crime_log', {});
      const chatMsgs = await db.query('chat_messages', {});
      
      setStats({
        totalPlayers: allPlayers.length,
        activeToday: allPlayers.filter((p: any) => p.level > 5).length,
        totalCrimes: totalCrimes.length,
        activeCriminals: new Set(totalCrimes.map((c: any) => c.player_id)).size,
        totalMessages: chatMsgs.length,
        activeLast24h: chatMsgs.filter((m: any) => m._created_at > Date.now()/1000 - 86400).length,
        totalMoney: allPlayers.reduce((sum: number, p: any) => sum + (p.money || 0), 0),
        avgLevel: Math.round(allPlayers.reduce((sum: number, p: any) => sum + (p.level || 0), 0) / allPlayers.length) || 0,
        vipPlayers: allPlayers.filter((p: any) => p.vip_status === 1 && p.vip_expires > Date.now()/1000).length,
        bannedCount: (await db.query('banned_players', {})).length,
        avgHeat: Math.round(allPlayers.reduce((sum: number, p: any) => sum + (p.heat || 0), 0) / allPlayers.length) || 0,
      });
      
      setUsers(allPlayers.slice(0, 50));
      setBans(await db.query('banned_players', {}));
      setSettings(await db.query('admin_settings', {}));
      setLogs(await db.query('admin_logs', { order: '_created_at.desc', limit: '100' }));
      setChatMessages(chatMsgs.slice(-100));
      setBroadcasts(await db.query('broadcast_messages', { active: 'eq.1' }));
      setEvents(await db.query('world_events', { order: '_created_at.desc' }));
      setRoles(await db.query('admin_roles', {}));
      setRoleAssignments(await db.query('admin_role_assignments', {}));
      
      // Încarcă istoricul achizițiilor premium
      const premiumLogs = await db.query('premium_purchases_log', { order: '_created_at.desc', limit: '50' });
      setPurchaseHistory(premiumLogs);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadServerStats = async () => {
    try {
      const statsData = await db.query('server_stats', {});
      if (statsData.length > 0) {
        setServerStats(statsData[0]);
      }
    } catch (error) {
      console.error('Error loading server stats:', error);
    }
  };

  const checkAdminRole = async () => {
    // Admin role checking - simplified
  };

  const banPlayer = async (playerId: number, reason: string, permanent: boolean = false) => {
    if (!confirm(`Sigur vrei să banezi jucătorul #${playerId}?`)) return;
    
    try {
      console.log('Banning player:', playerId, 'Reason:', reason);
      
      await db.insert('banned_players', {
        player_id: playerId,
        banned_by: player._row_id,
        reason: reason,
        expires_at: permanent ? 0 : Math.floor(Date.now() / 1000) + 86400,
        permanent: permanent ? 1 : 0,
      });

      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'ban',
        target_type: 'player',
        target_id: playerId,
        details: `Banat: ${reason}`,
        severity: 'warning',
      });

      loadData();
      await onUpdate();
    } catch (error) {
      console.error('Error banning player:', error);
      alert('Eroare la banare: ' + error);
    }
  };

  const unbanPlayer = async (playerId: number) => {
    if (!confirm(`Sigur vrei să debanezi jucătorul #${playerId}?`)) return;

    try {
      console.log('Unbanning player:', playerId);
      const ban = bans.find((b: any) => b.player_id === playerId);
      if (ban) {
        await db.delete('banned_players', { _row_id: `eq.${ban._row_id}` });
        console.log('Player unbanned successfully');
        
        await db.insert('admin_logs', {
          admin_id: player._row_id,
          action_type: 'unban',
          target_type: 'player',
          target_id: playerId,
          details: 'Debanat',
          severity: 'info',
        });
      }

      loadData();
      await onUpdate();
    } catch (error) {
      console.error('Error unbanning player:', error);
      alert('Eroare la debanare: ' + error);
    }
  };

  const updatePlayerField = async (playerId: number, field: string, value: any) => {
    try {
      console.log('Updating player:', playerId, field, '=', value);
      const result = await db.update('players', { _row_id: `eq.${playerId}` }, { [field]: value });
      console.log('Update result:', result);
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'player_update',
        target_type: 'player',
        target_id: playerId,
        details: `Updated ${field} = ${value}`,
        severity: 'info',
      });

      loadData();
      await onUpdate();
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Eroare la actualizare: ' + error);
    }
  };

  const deleteChatMessage = async (messageId: number) => {
    if (!confirm('Ștergi acest mesaj?')) return;
    
    try {
      await db.delete('chat_messages', { _row_id: `eq.${messageId}` });
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'delete_message',
        target_type: 'chat',
        target_id: messageId,
        details: 'Deleted chat message',
        severity: 'warning',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Eroare la ștergere: ' + error);
    }
  };

  const createBroadcast = async () => {
    const input = document.getElementById('broadcast-input') as HTMLInputElement;
    const typeSelect = document.getElementById('broadcast-type') as HTMLSelectElement;
    
    if (!input || !input.value.trim()) return;
    
    try {
      await db.insert('broadcast_messages', {
        message: input.value.trim(),
        type: typeSelect?.value || 'info',
        created_by: player._row_id,
        active: 1,
      });
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'broadcast',
        target_type: 'broadcast',
        target_id: 0,
        details: `Broadcast: ${input.value}`,
        severity: 'info',
      });
      
      if (input) input.value = '';
      loadData();
    } catch (error) {
      console.error('Error creating broadcast:', error);
      alert('Eroare la creare broadcast: ' + error);
    }
  };

  const deleteBroadcast = async (broadcastId: number) => {
    try {
      await db.delete('broadcast_messages', { _row_id: `eq.${broadcastId}` });
      loadData();
    } catch (error) {
      console.error('Error deleting broadcast:', error);
    }
  };

  const updateEconomySetting = async (key: string, value: string) => {
    try {
      await db.update('admin_settings', { setting_key: `eq.${key}` }, { setting_value: value });
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'setting_update',
        target_type: 'setting',
        target_id: key,
        details: `${key} = ${value}`,
        severity: 'info',
      });
      
      loadData();
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Eroare la actualizare: ' + error);
    }
  };

  const massAction = async (action: string, playerIds: number[]) => {
    if (!confirm(`Sigur vrei să faci ${action} pe ${playerIds.length} jucători?`)) return;
    
    console.log('Executing mass action:', action, 'on', playerIds.length, 'players');
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const playerId of playerIds) {
        try {
          switch (action) {
            case 'reset_energy':
              await db.update('players', { _row_id: `eq.${playerId}` }, { energy: 100 });
              successCount++;
              break;
            case 'reset_heat':
              await db.update('players', { _row_id: `eq.${playerId}` }, { heat: 0 });
              successCount++;
              break;
            case 'add_money':
              await db.update('players', { _row_id: `eq.${playerId}` }, { money: db.raw('money + 10000') });
              successCount++;
              break;
            case 'ban':
              await db.insert('banned_players', {
                player_id: playerId,
                banned_by: player._row_id,
                reason: 'Mass ban',
                expires_at: Math.floor(Date.now() / 1000) + 86400,
                permanent: 0,
              });
              successCount++;
              break;
          }
        } catch (error) {
          console.error('Error in mass action for player', playerId, error);
          failCount++;
        }
      }
      
      alert(`Acțiune completă: ${successCount} succes, ${failCount} erori`);
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'mass_action',
        target_type: 'players',
        target_id: 0,
        details: `Mass ${action} on ${playerIds.length} players`,
        severity: 'warning',
      });
      
      loadData();
      await onUpdate();
    } catch (error) {
      console.error('Error executing mass action:', error);
      alert('Eroare la acțiune în masă: ' + error);
    }
  };

  const exportData = async (table: string) => {
    try {
      const data = await db.query(table, {});
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}_export_${Date.now()}.json`;
      a.click();
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'export',
        target_type: 'data',
        target_id: 0,
        details: `Exported ${table} (${data.length} rows)`,
        severity: 'info',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Eroare la export: ' + error);
    }
  };

  // Event Management Functions
  const createEvent = async () => {
    const title = prompt('Titlu eveniment:');
    if (!title) return;
    
    const description = prompt('Descriere eveniment:');
    const type = prompt('Tip (gang_war, economic, police_raid):', 'gang_war');
    const rewards = prompt('Recompense JSON:', '{"money": 50000, "xp": 100}');
    const duration = prompt('Durată (zile):', '3');
    
    try {
      await db.insert('world_events', {
        event_id: Date.now().toString(),
        type: type || 'gang_war',
        title: title.trim(),
        description: (description || '').trim(),
        active: 0,
        rewards: rewards || '{}',
        ends_at: Math.floor(Date.now() / 1000) + (parseInt(duration || '3') * 86400),
      });
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'event_created',
        target_type: 'event',
        target_id: title,
        details: `Created event: ${title}`,
        severity: 'info',
      });
      
      loadData();
      alert('Eveniment creat cu succes!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Eroare la creare eveniment: ' + error);
    }
  };

  const toggleEvent = async (eventId: number) => {
    try {
      const event = events.find((e: any) => e._row_id === eventId);
      if (!event) return;
      
      await db.update('world_events', { _row_id: `eq.${eventId}` }, {
        active: event.active ? 0 : 1
      });
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'event_toggled',
        target_type: 'event',
        target_id: eventId,
        details: `${event.active ? 'Dezactivat' : 'Activat'} event: ${event.title}`,
        severity: 'info',
      });
      
      loadData();
      alert(event.active ? 'Eveniment dezactivat!' : 'Eveniment activat!');
    } catch (error) {
      console.error('Error toggling event:', error);
      alert('Eroare la activare/dezactivare: ' + error);
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Sigur vrei să ștergi acest eveniment?')) return;
    
    try {
      await db.delete('world_events', { _row_id: `eq.${eventId}` });
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'event_deleted',
        target_type: 'event',
        target_id: eventId,
        details: 'Deleted event',
        severity: 'warning',
      });
      
      loadData();
      alert('Eveniment șters!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Eroare la ștergere eveniment: ' + error);
    }
  };

  // Role Management Functions
  const assignRole = async (playerId: number, roleId: number) => {
    try {
      const existing = await db.query('admin_role_assignments', { 
        player_id: `eq.${playerId}` 
      });
      
      if (existing.length > 0) {
        await db.update('admin_role_assignments', { 
          _row_id: `eq.${existing[0]._row_id}` 
        }, { role_id: roleId });
      } else {
        await db.insert('admin_role_assignments', {
          player_id: playerId,
          role_id: roleId,
          assigned_by: player._row_id,
        });
      }
      
      await db.insert('admin_logs', {
        admin_id: player._row_id,
        action_type: 'role_assigned',
        target_type: 'player',
        target_id: playerId,
        details: `Assigned role ${roleId}`,
        severity: 'info',
      });
      
      loadData();
      alert('Rol atribuit cu succes!');
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Eroare la atribuire rol: ' + error);
    }
  };

  const removeRole = async (playerId: number) => {
    if (!confirm('Sigur vrei să elimini rolul acestui jucător?')) return;
    
    try {
      const assignment = await db.query('admin_role_assignments', { 
        player_id: `eq.${playerId}` 
      });
      
      if (assignment.length > 0) {
        await db.delete('admin_role_assignments', { 
          _row_id: `eq.${assignment[0]._row_id}` 
        });
        
        await db.insert('admin_logs', {
          admin_id: player._row_id,
          action_type: 'role_removed',
          target_type: 'player',
          target_id: playerId,
          details: 'Removed admin role',
          severity: 'warning',
        });
      }
      
      loadData();
      alert('Rol eliminat cu succes!');
    } catch (error) {
      console.error('Error removing role:', error);
      alert('Eroare la eliminare rol: ' + error);
    }
  };

  if (!player) {
    return (
      <div className="bg-card border border-red-900/50 rounded-lg p-8 text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">ACCES RESTRICȚIONAT</h2>
        <p className="text-muted-foreground">Doar staff-ul autorizat are acces la admin.</p>
      </div>
    );
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'developer': return 'text-red-400 bg-red-900/30';
      case 'admin': return 'text-gold bg-gold/30';
      case 'moderator': return 'text-blue-400 bg-blue-900/30';
      case 'helper': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 p-4 border-b border-border">
        <h2 className="font-display text-lg tracking-wider flex items-center gap-2 text-gold">
          <Shield className="w-5 h-5" /> ADMIN PANEL
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Logged in as: {player.username} {userRole && <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getRoleColor(userRole.role_name)}`}>{userRole.role_name.toUpperCase()}</span>}</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-secondary/30 border-r border-border p-3 overflow-y-auto max-h-screen">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">GENERAL</div>
            <button onClick={() => setActiveTab('overview')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'overview' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Activity className="w-4 h-4 inline mr-2" /> Overview
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'analytics' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <BarChart3 className="w-4 h-4 inline mr-2" /> Analytics
            </button>
            
            <div className="text-xs font-medium text-muted-foreground mt-4 mb-2 px-2">USERI</div>
            <button onClick={() => setActiveTab('users')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'users' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Users className="w-4 h-4 inline mr-2" /> Useri
            </button>
            <button onClick={() => setActiveTab('bans')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'bans' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Ban className="w-4 h-4 inline mr-2" /> Banuri
            </button>
            <button onClick={() => setActiveTab('roles')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'roles' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Key className="w-4 h-4 inline mr-2" /> Roluri
            </button>
            
            <div className="text-xs font-medium text-muted-foreground mt-4 mb-2 px-2">MODERARE</div>
            <button onClick={() => setActiveTab('chat')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'chat' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <MessageSquare className="w-4 h-4 inline mr-2" /> Chat
            </button>
            <button onClick={() => setActiveTab('broadcasts')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'broadcasts' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Bell className="w-4 h-4 inline mr-2" /> Broadcast-uri
            </button>
            <button onClick={() => setActiveTab('events')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'events' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Globe className="w-4 h-4 inline mr-2" /> Evenimente
            </button>
            
            <div className="text-xs font-medium text-muted-foreground mt-4 mb-2 px-2">ACȚIUNI</div>
            <button onClick={() => setActiveTab('mass_actions')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'mass_actions' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <RefreshCw className="w-4 h-4 inline mr-2" /> Mass Actions
            </button>
            <button onClick={() => setActiveTab('export')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'export' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Download className="w-4 h-4 inline mr-2" /> Export
            </button>
            
            <div className="text-xs font-medium text-muted-foreground mt-4 mb-2 px-2">PREMIUM</div>
            <button onClick={() => setActiveTab('premium_credits')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'premium_credits' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Crown className="w-4 h-4 inline mr-2" /> Credite Premium
            </button>
            <button onClick={() => setActiveTab('premium_logs')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'premium_logs' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Gift className="w-4 h-4 inline mr-2" /> Log Premium
            </button>
            
            <div className="text-xs font-medium text-muted-foreground mt-4 mb-2 px-2">SISTEM</div>
            <button onClick={() => setActiveTab('economy')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'economy' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <DollarSign className="w-4 h-4 inline mr-2" /> Economie
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'settings' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <Settings className="w-4 h-4 inline mr-2" /> Settings
            </button>
            <button onClick={() => setActiveTab('logs')} className={`w-full p-2 text-left rounded text-sm ${activeTab === 'logs' ? 'bg-gold/20 text-gold' : 'hover:bg-secondary/50'}`}>
              <ShieldAlert className="w-4 h-4 inline mr-2" /> Logs
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 max-h-screen overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">OVERVIEW</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded bg-secondary/50">
                  <div className="text-2xl font-bold text-gold">{stats.totalPlayers || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Jucători</div>
                </div>
                <div className="p-4 rounded bg-secondary/50">
                  <div className="text-2xl font-bold text-crimson">{stats.totalCrimes || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Crime</div>
                </div>
                <div className="p-4 rounded bg-secondary/50">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalMessages || 0}</div>
                  <div className="text-xs text-muted-foreground">Mesaje Chat</div>
                </div>
                <div className="p-4 rounded bg-secondary/50">
                  <div className="text-2xl font-bold text-green-400">${stats.totalMoney?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Bani Totali</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">ANALYTICS</h3>
              <div className="p-4 bg-secondary/50 text-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Analytics în reparație...</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">USERI</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map(user => {
                  const isBanned = bans.find((b: any) => b.player_id === user._row_id);
                  const assignment = roleAssignments.find((a: any) => a.player_id === user._row_id);
                  const role = assignment ? roles.find((r: any) => r._row_id === assignment.role_id) : null;
                  
                  return (
                    <div key={user._row_id} className="p-3 rounded bg-secondary/50 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{user.username}</span>
                          {role && <span className={`px-2 py-0.5 rounded text-xs ${getRoleColor(role.role_name)}`}>{role.role_name.toUpperCase()}</span>}
                          {isBanned && <span className="px-2 py-0.5 rounded text-xs bg-red-900/30 text-red-400">BANNED</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lvl {user.level} · ${user.money?.toLocaleString()} · Heat: {user.heat || 0}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedPlayer(user)} className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded hover:bg-blue-900/50">
                          <Eye className="w-3 h-3" />
                        </button>
                        {isBanned ? (
                          <button onClick={() => unbanPlayer(user._row_id)} className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded hover:bg-green-900/50">
                            Unban
                          </button>
                        ) : (
                          <button onClick={() => banPlayer(user._row_id, 'Admin decision')} className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50">
                            Ban
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">ROLURI ADMIN</h3>
              <div className="space-y-3">
                {users.map(user => {
                  const assignment = roleAssignments.find((a: any) => a.player_id === user._row_id);
                  const role = assignment ? roles.find((r: any) => r._row_id === assignment.role_id) : null;
                  
                  return (
                    <div key={user._row_id} className="p-3 rounded bg-secondary/50 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{user.username}</span>
                          {role && <span className={`px-2 py-0.5 rounded text-xs ${getRoleColor(role.role_name)}`}>{role.role_name.toUpperCase()}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">Lvl {user.level}</div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <select 
                          className="bg-background border border-border rounded px-2 py-1 text-xs"
                          onChange={(e) => assignRole(user._row_id, parseInt(e.target.value))}
                          value={role ? role._row_id : ''}
                        >
                          <option value="">Fără rol</option>
                          {roles.map(r => (
                            <option key={r._row_id} value={r._row_id}>{r.role_name}</option>
                          ))}
                        </select>
                        {role && (
                          <button onClick={() => removeRole(user._row_id)} className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bans' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">BANNED PLAYERS</h3>
              <div className="space-y-2">
                {bans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nu sunt jucători banați.</p>
                ) : (
                  bans.map(ban => (
                    <div key={ban._row_id} className="p-3 rounded bg-secondary/50 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Player #{ban.player_id}</div>
                        <div className="text-xs text-muted-foreground">{ban.reason}</div>
                        <div className="text-[10px] text-red-400">
                          {ban.permanent ? 'PERMANENT' : `Expires: ${new Date(ban.expires_at * 1000).toLocaleString()}`}
                        </div>
                      </div>
                      <button onClick={() => unbanPlayer(ban.player_id)} className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded hover:bg-green-900/50">
                        Unban
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">CHAT MODERARE</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chatMessages.map(msg => (
                  <div key={msg._row_id} className="p-3 rounded bg-secondary/50 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg._created_at * 1000).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">{msg.message}</div>
                    </div>
                    <button onClick={() => deleteChatMessage(msg._row_id)} className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'broadcasts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">BROADCAST MESSEGES</h3>
              <div className="p-4 rounded bg-secondary/30">
                <div className="flex gap-2 mb-3">
                  <input type="text" id="broadcast-input" placeholder="Mesaj broadcast..." className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm" />
                  <select id="broadcast-type" className="bg-background border border-border rounded px-2 py-1 text-sm">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                  <button onClick={createBroadcast} className="px-4 py-2 bg-crimson text-white text-sm rounded hover:bg-crimson/80">
                    Trimite
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {broadcasts.map(bc => (
                    <div key={bc._row_id} className={`p-2 rounded text-sm ${
                      bc.type === 'warning' ? 'bg-yellow-900/20 text-yellow-400' : 
                      bc.type === 'success' ? 'bg-green-900/20 text-green-400' : 
                      bc.type === 'error' ? 'bg-red-900/20 text-red-400' : 
                      'bg-blue-900/20 text-blue-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{bc.message}</span>
                        <button onClick={() => deleteBroadcast(bc._row_id)} className="px-2 py-1 bg-background/50 rounded text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <Globe className="w-5 h-5" /> MANAGEMENT EVENIMENTE
              </h3>
              
              <div className="p-4 rounded bg-secondary/30 border border-dashed border-border">
                <button onClick={createEvent} className="w-full py-3 bg-purple-900/30 text-purple-300 text-sm rounded hover:bg-purple-900/40 border border-purple-900/50 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> CREEAZĂ EVENIMENT NOU
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Creează evenimente speciale: războaie de cartele, crize economice, raiduri polițienești
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">EVENIMENTE DISPONIBILE</h4>
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nu sunt evenimente create.</p>
                ) : (
                  events.map((event: any) => (
                    <div key={event._row_id} className={`p-3 rounded border ${event.active ? 'bg-purple-900/20 border-purple-500/50' : 'bg-secondary/50 border-border'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              event.type === 'gang_war' ? 'bg-red-900/30 text-red-400' :
                              event.type === 'economic' ? 'bg-green-900/30 text-green-400' :
                              event.type === 'police_raid' ? 'bg-blue-900/30 text-blue-400' :
                              'bg-purple-900/30 text-purple-400'
                            }`}>
                              {event.type.toUpperCase()}
                            </span>
                            {event.active && <span className="px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-400">ACTIV</span>}
                          </div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.description}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => toggleEvent(event._row_id)} className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded hover:bg-blue-900/50">
                            {event.active ? 'Dezactivare' : 'Activare'}
                          </button>
                          <button onClick={() => deleteEvent(event._row_id)} className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50">
                            Șterge
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'mass_actions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <RefreshCw className="w-5 h-5" /> MASS ACTIONS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded bg-secondary/50">
                  <button onClick={() => massAction('reset_energy', users.map(u => u._row_id))} className="w-full py-2 bg-green-900/30 text-green-400 text-sm rounded hover:bg-green-900/50 mb-2">
                    Reset Energy Toți
                  </button>
                  <button onClick={() => massAction('reset_heat', users.map(u => u._row_id))} className="w-full py-2 bg-blue-900/30 text-blue-400 text-sm rounded hover:bg-blue-900/50 mb-2">
                    Reset Heat Toți
                  </button>
                  <button onClick={() => massAction('add_money', users.map(u => u._row_id))} className="w-full py-2 bg-gold/30 text-gold text-sm rounded hover:bg-gold/50">
                    +$10K Toți
                  </button>
                </div>
                <div className="p-4 rounded bg-secondary/50">
                  <button onClick={() => massAction('ban', users.slice(0, 10).map(u => u._row_id))} className="w-full py-2 bg-red-900/30 text-red-400 text-sm rounded hover:bg-red-900/50 mb-2">
                    Ban Primele 10
                  </button>
                  <button onClick={() => massAction('reset_energy', users.filter(u => u.level < 10).map(u => u._row_id))} className="w-full py-2 bg-purple-900/30 text-purple-400 text-sm rounded hover:bg-purple-900/50 mb-2">
                    Reset Energy pentru Lvl {'<'} 10
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <Download className="w-5 h-5" /> EXPORT DATE
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => exportData('players')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-sm font-medium">Players</div>
                </button>
                <button onClick={() => exportData('crime_log')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <div className="text-sm font-medium">Crime Log</div>
                </button>
                <button onClick={() => exportData('pvp_battles')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-sm font-medium">PvP Battles</div>
                </button>
                <button onClick={() => exportData('gangs')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-sm font-medium">Gangs</div>
                </button>
                <button onClick={() => exportData('chat_messages')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-sm font-medium">Chat Messages</div>
                </button>
                <button onClick={() => exportData('admin_logs')} className="p-4 rounded bg-secondary/50 hover:bg-secondary/70">
                  <Database className="w-6 h-6 mx-auto mb-2 text-crimson" />
                  <div className="text-sm font-medium">Admin Logs</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'premium_credits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" /> CREDITE PREMIUM
              </h3>
              
              <div className="p-4 rounded bg-secondary/50 border border-gold/30">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Acordă Credite Premium</label>
                  <div className="flex gap-2">
                    <select 
                      id="premium-player"
                      className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Selectează Jucător</option>
                      {users.map(u => (
                        <option key={u._row_id} value={u._row_id}>{u.username} (Lvl {u.level})</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      id="premium-amount"
                      placeholder="Cantitate"
                      className="w-24 bg-background border border-border rounded px-3 py-2 text-sm"
                      min="1"
                    />
                  </div>
                  <input 
                    type="text" 
                    id="premium-reason"
                    placeholder="Motiv (bonus, compensație, etc.)"
                    className="w-full mt-2 bg-background border border-border rounded px-3 py-2 text-sm"
                  />
                  <button 
                    onClick={async () => {
                      const playerId = parseInt((document.getElementById('premium-player') as HTMLSelectElement).value);
                      const amount = parseInt((document.getElementById('premium-amount') as HTMLInputElement).value);
                      const reason = (document.getElementById('premium-reason') as HTMLInputElement).value;
                      
                      if (!playerId || !amount || amount < 1) {
                        alert('Selectează jucător și introdu o cantitate validă!');
                        return;
                      }
                      
                      const result = await grantPremiumCredits(player._row_id, playerId, amount, reason || 'Premium credits');
                      alert(result.message);
                      if (result.success) {
                        await loadData();
                      }
                    }}
                    className="w-full mt-2 py-2 bg-gradient-to-r from-gold to-amber-600 text-black font-bold rounded hover:from-gold/90 hover:to-amber-600/90"
                  >
                    ACORDĂ CREDITE
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-sm text-gold">Jucători cu Credite</h4>
                  {users.filter((u: any) => (u.premium_credits || 0) > 0).map((user: any) => (
                    <div key={user._row_id} className="p-2 rounded bg-gold/10 border border-gold/20 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{user.username}</span>
                        <span className="text-xs text-muted-foreground ml-2">Lvl {user.level}</span>
                      </div>
                      <span className="text-gold font-bold">{user.premium_credits} CR</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'premium_logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <Gift className="w-5 h-5 text-gold" /> LOG ACHIZIȚII PREMIUM
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {purchaseHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nu sunt achiziții premium încă.</p>
                ) : (
                  purchaseHistory.map((log: any) => (
                    <div key={log._row_id} className="p-3 rounded bg-secondary/50 border border-gold/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gold">{log.package_type}</span>
                        <span className="text-xs text-muted-foreground">
                          #{log.player_id} • {new Date(log._created_at * 1000).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.credits_before} → {log.credits_after} CR (-{log.cost})
                        {log.test_mode && <span className="ml-2 px-1 py-0.5 rounded bg-yellow-900/30 text-yellow-400 text-xs">TEST</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">ECONOMIE</h3>
              <div className="space-y-2">
                {settings.map(setting => (
                  <div key={setting._row_id} className="p-3 rounded bg-secondary/50 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{setting.setting_key}</div>
                      <div className="text-xs text-muted-foreground">Valoare curentă: {setting.setting_value}</div>
                    </div>
                    <button onClick={() => updateEconomySetting(setting.setting_key, prompt('Nouă valoare:', setting.setting_value) || setting.setting_value)} className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded hover:bg-blue-900/50">
                      Modifică
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5" /> SETTINGS
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded bg-secondary/50">
                  <div className="font-medium text-sm mb-1">Server Status</div>
                  <div className="text-xs text-muted-foreground">Uptime: {Math.floor((Date.now() - (serverStats.start_time || Date.now())) / 1000 / 60)} min</div>
                </div>
                <div className="p-3 rounded bg-secondary/50">
                  <div className="font-medium text-sm mb-1">Database Tables</div>
                  <div className="text-xs text-muted-foreground">Players: {stats.totalPlayers} | Crimes: {stats.totalCrimes}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display tracking-wider">LOGS</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map(log => (
                  <div key={log._row_id} className="p-3 rounded bg-secondary/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.severity === 'error' ? 'bg-red-900/30 text-red-400' :
                        log.severity === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        {log.action_type.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Admin #{log.admin_id} → {log.target_type} #{log.target_id}
                      </span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {new Date(log._created_at * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display tracking-wider">PLAYER DETAILS</h3>
              <button onClick={() => setSelectedPlayer(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Username</label>
                  <div className="font-medium">{selectedPlayer.username}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Level</label>
                  <div className="font-medium">{selectedPlayer.level}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Money</label>
                  <div className="font-medium text-green-400">${selectedPlayer.money?.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Heat</label>
                  <div className="font-medium text-red-400">{selectedPlayer.heat || 0}</div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Quick Actions</label>
                <div className="flex gap-2">
                  <button onClick={() => updatePlayerField(selectedPlayer._row_id, 'money', (selectedPlayer.money || 0) + 10000)} className="px-3 py-2 bg-green-900/30 text-green-400 text-sm rounded hover:bg-green-900/50">
                    +$10K
                  </button>
                  <button onClick={() => updatePlayerField(selectedPlayer._row_id, 'level', (selectedPlayer.level || 0) + 1)} className="px-3 py-2 bg-purple-900/30 text-purple-400 text-sm rounded hover:bg-purple-900/50">
                    +1 Level
                  </button>
                  <button onClick={() => updatePlayerField(selectedPlayer._row_id, 'energy', 100)} className="px-3 py-2 bg-blue-900/30 text-blue-400 text-sm rounded hover:bg-blue-900/50">
                    Fill Energy
                  </button>
                  <button onClick={() => updatePlayerField(selectedPlayer._row_id, 'heat', 0)} className="px-3 py-2 bg-red-900/30 text-red-400 text-sm rounded hover:bg-red-900/50">
                    Reset Heat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
import { useState } from 'react';
import { LogOut, User, Crosshair, Trophy, Map, ShoppingCart, Swords, Shield, Landmark, Building, Dices, Target, Award, Scale, Skull, Flag, Siren, Globe, ShieldAlert, Menu, X, Crown, Ticket, Bug } from 'lucide-react';

interface GameNavProps {
  player: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  isAdmin?: boolean;
  userRole?: any;
}

const tabs = [
  { id: 'crimes', label: 'Crime', icon: Crosshair, category: 'Core' },
  { id: 'shop', label: 'Magazin', icon: ShoppingCart, category: 'Core' },
  { id: 'pvp', label: 'PvP', icon: Swords, category: 'Combat' },
  { id: 'pve', label: 'PvE', icon: Skull, category: 'Combat' },
  { id: 'gangs', label: 'Găști', icon: Shield, category: 'Social' },
  { id: 'gang_warfare', label: 'Război', icon: Flag, category: 'Social' },
  { id: 'bank', label: 'Bancă', icon: Landmark, category: 'Economy' },
  { id: 'properties', label: 'Proprietăți', icon: Building, category: 'Economy' },
  { id: 'casino', label: 'Casino', icon: Dices, category: 'Economy' },
  { id: 'politics', label: 'Politică', icon: Scale, category: 'Power' },
  { id: 'police', label: 'Poliție', icon: Siren, category: 'Power' },
  { id: 'events', label: 'Evenimente', icon: Globe, category: 'World' },
  { id: 'premium', label: 'Premium', icon: Crown, category: 'Economy' },
  { id: 'missions', label: 'Misiuni', icon: Target, category: 'Progress' },
  { id: 'achievements', label: 'Realizări', icon: Award, category: 'Progress' },
  { id: 'profile', label: 'Profil', icon: User, category: 'Account' },
  { id: 'leaderboard', label: 'Clasament', icon: Trophy, category: 'Account' },
  { id: 'map', label: 'Hartă', icon: Map, category: 'World' },
  {id: 'support', label: 'Suport', icon: Ticket, category: 'Support', requireAdmin: false},
  {id: 'bugs', label: 'Bug-uri', icon: Bug, category: 'Support', requireAdmin: true},
];

const adminTab = { id: 'admin', label: 'Admin', icon: ShieldAlert, category: 'Admin' };

const GameNav = ({ player, activeTab, onTabChange, onSignOut, isAdmin = false, userRole }: GameNavProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Group tabs by category
  const groupedTabs = {
    'Core': tabs.filter(t => t.category === 'Core'),
    'Combat': tabs.filter(t => t.category === 'Combat'),
    'Social': tabs.filter(t => t.category === 'Social'),
    'Economy': tabs.filter(t => t.category === 'Economy'),
    'Power': tabs.filter(t => t.category === 'Power'),
    'World': tabs.filter(t => t.category === 'World'),
    'Progress': tabs.filter(t => t.category === 'Progress'),
    'Account': tabs.filter(t => t.category === 'Account'),
    'Support': tabs.filter(t => !t.requireAdmin || isAdmin),
    'Admin': isAdmin && userRole ? [adminTab] : [],
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-64`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-lg text-crimson">UMBRA</h1>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-secondary rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {player?.username} · Lvl {player?.level}{isAdmin && userRole && <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${userRole.role_name === 'developer' ? 'text-red-400 bg-red-900/30' : 'text-gold bg-gold/30'}`}>{userRole.role_name.toUpperCase()}</span>}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
              categoryTabs.length > 0 && (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {category === 'Core' && '⚔️ JOC DE BAZĂ'}
                    {category === 'Combat' && '⚔️ LUPTE'}
                    {category === 'Social' && '👥 SOCIAL'}
                    {category === 'Economy' && '💰 ECONOMIE'}
                    {category === 'Power' && '🏛️ PUTERE'}
                    {category === 'World' && '🌍 LUME'}
                    {category === 'Progress' && '📈 PROGRES'}
                    {category === 'Account' && '👤 CONT'}
                    {category === 'Support' && '🎫 SUPORT'}
                    {category === 'Admin' && '🛡️ ADMIN'}
                  </h3>
                  <div className="space-y-1">
                    {categoryTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabChange(tab.id);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id 
                            ? 'bg-crimson/20 text-crimson font-medium' 
                            : category === 'Admin'
                              ? 'text-gold/80 hover:text-gold hover:bg-gold/10'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <button 
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Deconectare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default GameNav;
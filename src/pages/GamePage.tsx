import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth.js';
import { usePlayer } from '@/hooks/usePlayer';
import GameNav from '@/components/GameNav';
import PlayerStats from '@/components/PlayerStats';
import CrimePanel from '@/components/CrimePanel';
import GameChat from '@/components/GameChat';
import Leaderboard from '@/components/Leaderboard';
import ProfilePanel from '@/components/ProfilePanel';
import CityMap from '@/components/CityMap';
import ShopPanel from '@/components/ShopPanel';
import PvPPanel from '@/components/PvPPanel';
import GangPanel from '@/components/GangPanel';
import BankPanel from '@/components/BankPanel';
import PropertiesPanel from '@/components/PropertiesPanel';
import CasinoPanel from '@/components/CasinoPanel';
import MissionsPanel from '@/components/MissionsPanel';
import AchievementsPanel from '@/components/AchievementsPanel';
import PoliticsPanel from '@/components/PoliticsPanel';
import NotificationsPanel from '@/components/NotificationsPanel';
import PvEPanel from '@/components/PvEPanel';
import GangWarfarePanel from '@/components/GangWarfarePanel';
import PoliceRaidsPanel from '@/components/PoliceRaidsPanel';
import WorldEventsPanel from '@/components/WorldEventsPanel';
import AdminPanel from '@/components/AdminPanel';
import SupportPanel from '@/components/SupportPanel';
import TicketsManagementPanel from '@/components/TicketsManagementPanel';
import db from '@/lib/shared/kliv-database.js';
import TutorialModal from '@/components/TutorialModal';
import PremiumShopPanel from '@/components/PremiumShopPanel';
import { checkTimers, regenerateEnergy, regenerateHealth, checkLevelUp } from '@/utils/gameLogic';

const GamePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('crimes');
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const u = await auth.getUser();
      if (!u) { navigate('/login'); return; }
      setUser(u);
      setLoading(false);
      
      // Show tutorial for new players (level 1)
      const playerData = await db.query('players', { _created_by: `eq.${u.userUuid}` });
      if (playerData.length > 0 && playerData[0].level === 1 && !playerData[0].tutorial_completed) {
        setShowTutorial(true);
      }
    };
    check();
  }, [navigate]);

  const { player, loading: playerLoading, refreshPlayer } = usePlayer(user);
  const [userRole, setUserRole] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!player) return;
      
      try {
        const assignment = await db.query('admin_role_assignments', { player_id: `eq.${player._row_id}` });
        if (assignment.length > 0) {
          const role = await db.query('admin_roles', { _row_id: `eq.${assignment[0].role_id}` });
          if (role.length > 0) {
            setUserRole(role[0]);
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };
    
    checkAdminRole();
  }, [player]);

  // Energy regen and timers
  useEffect(() => {
    if (!player) return;
    const interval = setInterval(async () => {
      const released = await checkTimers(player);
      const energyGained = await regenerateEnergy(player);
      const healthGained = await regenerateHealth(player);
      const leveledUp = await checkLevelUp(player);
      
      if (released || energyGained > 0 || healthGained > 0 || leveledUp) {
        await refreshPlayer();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [player, refreshPlayer]);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading || playerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-xl text-crimson mb-4">UMBRA ROMÂNIEI</div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="animate-bounce w-1.5 h-1.5 rounded-full bg-crimson" style={{ animationDelay: '0ms' }} />
            <div className="animate-bounce w-1.5 h-1.5 rounded-full bg-crimson" style={{ animationDelay: '150ms' }} />
            <div className="animate-bounce w-1.5 h-1.5 rounded-full bg-crimson" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showTutorial && player && (
        <TutorialModal 
          player={player} 
          onComplete={async () => {
            setShowTutorial(false);
            await db.update('players', { _row_id: `eq.${player._row_id}` }, { tutorial_completed: 1 });
          }} 
        />
      )}
      <GameNav player={player} activeTab={tab} onTabChange={setTab} onSignOut={handleSignOut} isAdmin={isAdmin} userRole={userRole} />
      <div className="absolute top-4 right-4 z-20">
        <NotificationsPanel player={player} onUpdate={refreshPlayer} />
      </div>

      <div className="max-w-7xl mx-auto px-4 flex gap-4 pt-20 pb-4">
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {showTutorial && player && (
            <TutorialModal 
              player={player} 
              onComplete={async () => {
                setShowTutorial(false);
                await db.update('players', { _row_id: `eq.${player._row_id}` }, { tutorial_completed: 1 });
              }} 
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left sidebar - stats */}
          <div className="lg:col-span-3 space-y-4">
            <PlayerStats player={player} onBankClick={() => setTab('bank')} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-6 space-y-4">
            {tab === 'crimes' && <CrimePanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'shop' && <ShopPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'pvp' && <PvPPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'pve' && <PvEPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'gangs' && <GangPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'gang_warfare' && <GangWarfarePanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'bank' && <BankPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'properties' && <PropertiesPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'casino' && <CasinoPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'politics' && <PoliticsPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'police' && <PoliceRaidsPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'events' && <WorldEventsPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'missions' && <MissionsPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'achievements' && <AchievementsPanel player={player} />}
            {tab === 'admin' && isAdmin && <AdminPanel player={player} onUpdate={refreshPlayer} userRole={userRole} />}
            {tab === 'support' && <SupportPanel player={player} />}
            {tab === 'bugs' && isAdmin && <TicketsManagementPanel player={player} />}
            {tab === 'premium' && <PremiumShopPanel player={player} onUpdate={refreshPlayer} />}
            {tab === 'profile' && <ProfilePanel player={player} />}
            {tab === 'leaderboard' && <Leaderboard />}
            {tab === 'map' && <CityMap player={player} onUpdate={refreshPlayer} />}
          </div>

          {/* Right sidebar - chat */}
          <div className="lg:col-span-3">
            <GameChat player={player} />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GamePage;

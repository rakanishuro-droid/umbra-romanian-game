import { User, Swords, Shield, Gauge, Target, Calendar } from 'lucide-react';

const ProfilePanel = ({ player }: { player: any }) => {
  if (!player) return null;

  const successRate = player.crimes_done > 0
    ? Math.round((player.crimes_success / player.crimes_done) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-crimson/20 rounded-lg flex items-center justify-center">
          <User className="w-7 h-7 text-crimson" />
        </div>
        <div>
          <h2 className="font-display text-lg tracking-wider">{player.username}</h2>
          <div className="text-xs text-muted-foreground">Nivel {player.level} · {player.city}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Atac', value: player.attack, icon: Swords, color: 'text-red-400' },
          { label: 'Apărare', value: player.defense, icon: Shield, color: 'text-blue-400' },
          { label: 'Viteză', value: player.speed, icon: Gauge, color: 'text-cyan-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-secondary rounded-lg p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <div className="font-display text-lg">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-3 h-3" /> Crime reușite</span>
          <span>{player.crimes_success} / {player.crimes_done} ({successRate}%)</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground">XP Total</span>
          <span>{player.xp}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground">Avere totală</span>
          <span className="text-gold">${(player.money + player.bank).toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Status</span>
          <span className={player.status === 'jail' ? 'text-red-400' : 'text-green-400'}>
            {player.status === 'jail' ? '🔒 Închisoare' : '✅ Liber'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;

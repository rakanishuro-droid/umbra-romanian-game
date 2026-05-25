import { useNavigate } from 'react-router-dom';
import { Crosshair, Shield, Crown, Skull, ChevronRight } from 'lucide-react';

const features = [
  { icon: Crosshair, title: 'Crimă & Jaf', description: 'Jefuiește bănci, fură mașini, contrabandă pe piața neagră.' },
  { icon: Shield, title: 'Gangs & Teritorii', description: 'Creează o mafie, cucerește cartiere, pornește războaie.' },
  { icon: Crown, title: 'Politică & Putere', description: 'Candidează la președinție, controlează economia, corupție.' },
  { icon: Skull, title: 'PvP & Reputație', description: 'Atacă jucători, pune recompense, domină servere.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/game');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* YOUR ARTWORK AS BACKGROUND - Using public folder */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      />
      
      {/* Subtle overlay - LIGHTER to show your artwork better */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-crimson to-red-900 flex items-center justify-center shadow-lg shadow-crimson/30">
            <span className="font-display text-xl font-bold text-white">UR</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-all font-medium"
          >
            Autentificare
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 text-sm bg-gradient-to-r from-gold to-amber-600 text-black rounded-lg hover:from-gold/90 hover:to-amber-600/90 transition-all font-bold shadow-lg shadow-gold/30"
          >
            Înregistrare
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16 text-center">
        <div className="animate-slide-up">
          {/* Browser Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm border border-crimson/40 rounded-full mb-8">
            <div className="w-2 h-2 bg-crimson rounded-full animate-pulse" />
            <span className="text-sm font-medium text-crimson">BROWSER MMORPG</span>
          </div>
          
          {/* NO TITLE - Your artwork already has "UMBRA ROMÂNIEI" */}
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto leading-relaxed font-bold drop-shadow-2xl">
            Într-o Românie coruptă și periculoasă, fiecare jucător își alege propriul drum spre putere.
            <span className="text-gold"> Devino temut.</span>{' '}
            <span className="text-crimson"> Devino legendă.</span>
          </p>
          
          {/* CTA - EVEN FURTHER DOWN */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handlePlayClick}
              className="group inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-crimson to-red-700 text-white font-display font-black text-xl tracking-wider rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-crimson/50"
            >
              INTRĂ ÎN JOC
              <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Stats - VERY LOW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-24">
            {[
              ['10K+', 'JUCĂTORI'],
              ['50+', 'CRIME'],
              ['6', 'ORAȘE'],
              ['∞', 'POSIBILITĂȚI'],
            ].map(([value, label], i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl font-bold text-gold mb-1">{value}</div>
                <div className="text-sm text-white uppercase tracking-wider font-bold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border-2 border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-gold/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <Icon className="w-10 h-10 text-gold mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-display text-lg font-bold text-gold mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-gray-600 border-t border-gray-800/50">
        <p>© 2026 Umbra României. Un MMORPG Noir despre putere, crimă și supraviețuire.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
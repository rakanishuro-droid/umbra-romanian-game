import { useState, useEffect } from 'react';
import { Gem, Sparkles, Crown, Star, Shield, Zap, ShieldAlert, ShoppingCart, Loader2 } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { processPremiumPurchase, checkPremiumStatus, PREMIUM_CONFIG } from '@/utils/premiumSecurity';

// Premium packages with security
const PREMIUM_PACKAGES = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 50,
    credits: 100,
    duration: 7,
    icon: Sparkles,
    color: 'from-blue-600 to-cyan-500',
    benefits: ['+$50,000', '2x XP pentru 7 zile', 'Acces la chat VIP', 'Iconă specială'],
  },
  {
    id: 'gold',
    name: 'GOLD',
    price: 120,
    credits: 500,
    duration: 30,
    icon: Crown,
    color: 'from-yellow-600 to-amber-500',
    benefits: ['+$500,000', '3x XP pentru 30 zile', 'Livrare rapidă', 'Acces la toate zonele', 'Rank VIP Gold'],
  },
  {
    id: 'diamond',
    name: 'DIAMOND',
    price: 250,
    credits: 1500,
    duration: 90,
    icon: Gem,
    color: 'from-purple-600 to-pink-500',
    benefits: ['+$2,000,000', '5x XP permanent', 'Timp reducăm crime 50%', 'Acces la evenimente exclusive', 'Discount 20% shop', 'Suport prioritar'],
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    price: 500,
    credits: 5000,
    duration: 180,
    icon: Shield,
    color: 'from-gray-300 to-white',
    benefits: ['+$10,000,000', '10x XP permanent', 'Fără cooldown crime', 'Zone exclusive VIP', 'Personalizare completă', 'Bonus săptămânal'],
  },
];

const PremiumShopPanel = ({ player, onUpdate }: any) => {
  const [vipStatus, setVipStatus] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!player) return;
    loadPremiumData();
  }, [player]);

  const loadPremiumData = async () => {
    try {
      const status = await checkPremiumStatus(player._row_id);
      setVipStatus(status);
      setCredits(status.premiumCredits || 0);

      // Încarcă istoricul achizițiilor doar dacă tabelul există
      try {
        const logs = await db.query('premium_purchases_log', { 
          player_id: `eq.${player._row_id}`,
          order: '_created_at.desc',
          limit: '10'
        });
        setPurchaseHistory(logs || []);
      } catch (logError) {
        console.log('Premium logs not available yet:', logError);
        setPurchaseHistory([]);
      }
    } catch (error) {
      console.error('Error loading premium data:', error);
      setCredits(0);
      setPurchaseHistory([]);
    }
  };

  const handlePurchase = async (pkg: any) => {
    if (processing) return;
    
    // VERIFICARE STRICTĂ - CREDITE
    if ((credits || 0) < pkg.price) {
      alert(`❌ CREDITE INSUFICIENTE!\n\n` +
        `Ai ${credits || 0} credite premium.\n` +
        `Ai nevoie de ${pkg.price} credite pentru ${pkg.name}.\n\n` +
        `💰 Lipsește: ${pkg.price - (credits || 0)} credite\n\n` +
        `📧 Contactează un admin pentru a obține mai multe credite.\n` +
        `👨‍💻 Adminii pot acorda credite din panoul admin.`
      );
      return;
    }

    // CONFIRMARE EXPLICITĂ
    const confirmation = confirm(
      `⚠️ CONFIRMARE ACHIZIȚIE PREMIUM\n\n` +
      `🔒 Pachet: ${pkg.name}\n` +
      `💰 Cost: ${pkg.price} credite premium\n` +
      `💵 Credite curente: ${credits}\n` +
      `💵 Credite rămase: ${credits - pkg.price}\n\n` +
      `🎁 BENEFICII:\n${pkg.benefits.map((b: string) => '• ' + b).join('\n')}\n\n` +
      `⚠️ ACEASTĂ ACȚIUNE ESTE:\n` +
      `• DEFINITIVĂ - Nu poate fi anulată\n` +
      `• LOGGATĂ - Va fi înregistrată\n` +
      `• VERIFICATĂ - Doar adminii pot da credite\n\n` +
      `Ești sigur că vrei să continui?`
    );
    
    if (!confirmation) {
      return;
    }

    setProcessing(pkg.id);

    try {
      const result = await processPremiumPurchase(player._row_id, pkg.name, pkg.price);
      
      if (result.success) {
        alert(`✅ ACHIZIȚIE REUȘITĂ!\n\n${result.message}\n\n🎉 Beneficiile au fost activate instant!\n📝 Achiziția a fost loggată.`);
        await loadPremiumData();
        await onUpdate();
      } else {
        alert(`❌ EROARE LA ACHIZIȚIE:\n\n${result.message}\n\nContactează un admin.`);
      }
    } catch (error: any) {
      alert(`❌ EROARE CRITICĂ:\n\n${error.message}\n\nContactează un admin imediat!`);
    } finally {
      setProcessing(null);
    }
  };

  if (!player) return null;

  return (
    <div className="space-y-6">
      {/* WARNING CRITICAL - PROTECȚIE ANTI-ABUZ */}
      {PREMIUM_CONFIG.TEST_MODE && (
        <div className="bg-red-900/50 border-2 border-red-600/80 rounded-lg p-4 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
            <ShieldAlert className="w-7 h-7" />
            <span className="font-bold text-lg">⚠️ SISTEM PREMIUM - PROTEJAT ANTI-ABUZ</span>
          </div>
          <div className="text-sm text-red-200 space-y-2">
            <p>🔒 <strong>FIECARE ACHIZIȚIE REQUIERE CREDITE PREMIUM</strong></p>
            <p>👮 <strong>DOAR ADMINII POT ACORDA CREDITE</strong></p>
            <p>📝 <strong>TOTUL ESTE LOGGAT ȘI VERIFICABIL</strong></p>
            <p>❌ <strong>FĂRĂ CREDITE = FĂRĂ ACHIZIȚII POSIBILE</strong></p>
            <p>🚫 <strong>NICIUN JUCĂTOR NU POATE CUMPĂRA NELIMITAT</strong></p>
          </div>
          <div className="mt-4 p-3 bg-black/40 rounded-lg">
            <p className="text-sm text-yellow-400">
              💡 Creditele tale: <strong className="text-gold text-lg">{credits} CR</strong>
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Contactează admin pentru credite • Doar adminii decid
            </p>
          </div>
        </div>
      )}

      {/* Credits Display */}
      <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-2 border-gold/40 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg shadow-gold/30">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-xl text-gold">CREDITE PREMIUM</h3>
              <p className="text-3xl font-bold text-gold">{credits.toLocaleString()} CR</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Status VIP</div>
            <div className={`font-bold text-lg ${vipStatus?.isPremium ? 'text-green-400' : 'text-gray-400'}`}>
              {vipStatus?.isPremium ? `Level ${vipStatus.vipLevel}` : 'Free'}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Packages */}
      <div>
        <h3 className="font-display text-sm tracking-wider mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-gold" />
          PACHETE PREMIUM - DOAR CU CREDITE
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PREMIUM_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const canAfford = (credits || 0) >= pkg.price;
            
            return (
              <div
                key={pkg.id}
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                  canAfford 
                    ? 'border-gold/40 bg-gradient-to-br from-card to-gold/10 hover:border-gold/70 hover:shadow-2xl hover:shadow-gold/30' 
                    : 'border-gray-700/50 bg-card/50 opacity-50'
                }`}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${pkg.color} p-6`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-black/40 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-display text-2xl font-bold text-white">{pkg.name}</h4>
                      <p className="text-sm text-white/90">{pkg.duration} zile</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gold">{pkg.price}</span>
                    <span className="text-lg text-muted-foreground">credite premium</span>
                  </div>

                  <div className="space-y-3">
                    {pkg.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 text-base">
                        <Zap className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={!canAfford || processing === pkg.id}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-gold to-amber-600 text-black hover:from-gold/90 hover:to-amber-600/90 shadow-lg shadow-gold/30'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {processing === pkg.id ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                        PROCESARE...
                      </span>
                    ) : canAfford ? (
                      'CUMPRĂ PACHET'
                    ) : (
                      `CREDITE INSUFICIENTE (${pkg.price} CR necesare)`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase History */}
      {purchaseHistory.length > 0 && (
        <div>
          <h3 className="font-display text-sm tracking-wider mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            ISTORIC ACHIZIȚII - LOG COMPLET
          </h3>
          
          <div className="space-y-3">
            {purchaseHistory.map((log) => (
              <div key={log._row_id} className="bg-card/50 border border-gold/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gold">{log.package_type}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log._created_at * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {log.credits_before} → {log.credits_after} credite (-{log.cost})
                  {log.test_mode && <span className="ml-3 px-2 py-1 rounded bg-yellow-900/40 text-yellow-400 text-xs font-bold">TEST MODE</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumShopPanel;
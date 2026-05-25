import { useState } from 'react';
import { Play, X, CheckCircle2 } from 'lucide-react';

const TutorialModal = ({ onComplete, player }: { onComplete: () => void; player: any }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: '🎮 Bine ai venit în Umbra României!',
      content: 'Într-o Românie coruptă și periculoasă, fiecare jucător își alege propriul drum spre putere. Devino temut. Devino legendă.',
      action: 'ÎNCEPE',
      icon: '🌟'
    },
    {
      title: '🔫 Crime & Jafuri',
      content: 'Începe cu crime mici - buzunărărește oameni pe stradă. Pe măsură ce câștigi experiență, treci la jafuri bancare și răpiri. Atenție: fiecare crimă crește Heat-ul!',
      action: 'AM ÎNȚELES',
      icon: '🔪'
    },
    {
      title: '👥 Găști & Teritorii',
      content: 'Alătură-te unei găști sau construiește-ți propria una. Controlează teritorii, luptă pentru dominație și împarte prada cu membrii.',
      action: 'CONTINUE',
      icon: '🛡️'
    },
    {
      title: '🏛️ Politică & Putere',
      content: 'Când ești bogat și influent, intră în politică. Candidetează, votează legi, controlează poliția - dar ai grijă la rivali!',
      action: 'AM ÎNȚELES',
      icon: '⚖️'
    },
    {
      title: '⚔️ PvP & Reputație',
      content: 'Luptă cu alți jucători pentru onoare și pradă. Construiește-ți o reputație de temut - sau fii cel mai căutat om din România.',
      action: 'GATA',
      icon: '🎯'
    }
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      setLoading(true);
      // Mark tutorial as completed
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (error) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    if (confirm('Ești sigur că vrei să sari peste tutorial?')) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6 relative">
        {/* Close button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-1 rounded ${i <= step ? 'bg-crimson' : 'bg-secondary'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{steps[step].icon}</div>
          <h2 className="font-display text-xl text-crimson mb-3">{steps[step].title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{steps[step].content}</p>
        </div>

        {/* Action */}
        <div className="flex gap-3">
          <button 
            onClick={handleSkip}
            className="flex-1 py-2 border border-border rounded text-sm hover:bg-secondary transition-colors"
          >
            SARI PESTE
          </button>
          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex-1 py-2 bg-crimson text-white rounded text-sm font-medium hover:bg-crimson/80 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                SE ÎNARCE...
              </>
            ) : (
              <>
                {step === steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {steps[step].action}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {steps[step].action}
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
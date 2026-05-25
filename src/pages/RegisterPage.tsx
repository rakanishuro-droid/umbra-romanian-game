import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth.js';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.signUp(email, password, name);
      navigate('/game');
    } catch (err: any) {
      if (err.message?.includes('email_exists')) setError('Acest email este deja folosit.');
      else if (err.message?.includes('insufficient_password')) setError('Parola trebuie să aibă minim 8 caractere.');
      else setError('Eroare la înregistrare.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(0_72%_15%/0.1),_transparent_60%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <Link to="/" className="block text-center font-display text-2xl tracking-wider text-crimson mb-8">
          UMBRA ROMÂNIEI
        </Link>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg tracking-wider text-center mb-2">ÎNREGISTRARE</h2>
          {error && <div className="text-xs text-red-400 bg-red-400/10 rounded p-2 text-center">{error}</div>}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nume jucător</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Parolă</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-crimson text-white font-display text-sm tracking-wider rounded hover:bg-crimson/80 transition-colors disabled:opacity-50">
            {loading ? 'SE CREEAZĂ CONTUL...' : 'CREEAZĂ CONT'}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Ai deja cont? <Link to="/login" className="text-crimson hover:underline">Autentifică-te</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

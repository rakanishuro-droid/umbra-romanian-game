import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamePage from "./pages/GamePage";
import NotFound from "./pages/NotFound";

import './assets/premium-mafia-bg.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="premium-bg-container">
        {/* Premium mafia background with cars, characters, weapons */}
        <div className="premium-mafia-bg">
          {/* Luxury cars driving */}
          <div className="luxury-cars">
            <div className="car"></div>
            <div className="car"></div>
            <div className="car"></div>
          </div>

          {/* Mafia character silhouettes */}
          <div className="mafia-characters">
            <div className="character"></div>
            <div className="character"></div>
            <div className="character"></div>
          </div>

          {/* Weapon silhouettes */}
          <div className="weapon-silhouettes">
            <div className="weapon pistol"></div>
            <div className="weapon rifle"></div>
            <div className="weapon shotgun"></div>
          </div>

          {/* Money particles */}
          <div className="money-particles">
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
            <div className="money"></div>
          </div>

          {/* Golden premium particles */}
          <div className="golden-particles">
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
            <div className="golden-particle"></div>
          </div>

          {/* Spotlights */}
          <div className="spotlights">
            <div className="spotlight"></div>
            <div className="spotlight"></div>
            <div className="spotlight"></div>
          </div>

          {/* Night city effect */}
          <div className="night-city"></div>

          {/* Dangerous red glow */}
          <div className="dangerous-glow"></div>

          {/* Glass morphism */}
          <div className="glass-effect"></div>

          {/* Vignette */}
          <div className="vignette"></div>
        </div>

        {/* Premium luxury decoration */}
        <div className="luxury-decoration">
          Umbra României • Premium Edition • Since 2026
        </div>

        <div className="relative z-10">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }
            }}
          />
          <Sonner 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

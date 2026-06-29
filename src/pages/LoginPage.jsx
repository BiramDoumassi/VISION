import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, ArrowRight, Shield, Database, Zap } from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  { icon: Database, text: 'Centralize all your data sources' },
  { icon: Zap,      text: 'AI-powered insights in real time' },
  { icon: Shield,   text: 'GDPR & ISO 27001 compliance built-in' },
];

export default function LoginPage() {
  const { navigateToLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    navigateToLogin();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
            alt="VISION AI"
            className="h-14 w-auto"
          />
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-white/10 p-8">
          <h1 className="text-2xl font-semibold text-white mb-1 text-center">Welcome back</h1>
          <p className="text-sm text-white/40 text-center mb-8">Sign in to access your data platform</p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/50" />
                </div>
                <span className="text-sm text-white/50">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-xl h-12 font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign in to VISION
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/25 mt-4">
            Secured by base44 · Your data stays private
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          © 2026 DOUMASSI AI · Enterprise Data Intelligence
        </p>
      </motion.div>
    </div>
  );
}

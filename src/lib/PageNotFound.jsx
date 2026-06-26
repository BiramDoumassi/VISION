import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="fixed inset-0 grid-pattern opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-md"
      >
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
          <h1 className="text-6xl font-bold text-white font-space mb-4">404</h1>
          <h2 className="text-xl text-white/70 mb-2">Page Not Found</h2>
          <p className="text-white/40 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button className="bg-white text-black hover:bg-white/90 gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="border-white/10 text-white/70 hover:bg-white/5 gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
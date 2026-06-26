import { motion } from 'framer-motion';
import { Search, Bell, Settings, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header({ title, subtitle }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40"
    >
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* AI Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Ask AI anything..."
            className="w-72 h-9 pl-9 pr-4 bg-white/5 border-white/10 text-white/80 placeholder:text-white/30 text-sm rounded-lg focus:ring-1 focus:ring-white/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-white/50">AI Active</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-white/50 hover:text-white hover:bg-white/5">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User */}
        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  );
}
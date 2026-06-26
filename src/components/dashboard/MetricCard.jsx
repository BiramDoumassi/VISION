import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, change, changeType, icon: Icon, delay = 0 }) {
  const isPositive = changeType === 'positive';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="metric-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <Icon className="w-5 h-5 text-white/60" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-semibold text-white font-space">{value}</p>
    </motion.div>
  );
}
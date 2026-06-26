import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Wifi, Zap } from 'lucide-react';

const metrics = [
  { name: 'AI Engine', value: 99.9, icon: Zap },
  { name: 'Data Lake', value: 98.7, icon: HardDrive },
  { name: 'API Gateway', value: 100, icon: Wifi },
  { name: 'Pipeline Engine', value: 97.2, icon: Activity },
  { name: 'Processing', value: 94.5, icon: Cpu }
];

export default function SystemHealth() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-medium">System Health</h3>
          <p className="text-white/40 text-xs mt-0.5">All systems operational</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Healthy</span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <metric.icon className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/60">{metric.name}</span>
              </div>
              <span className="text-xs font-mono text-white/80">{metric.value}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  metric.value >= 99 ? 'bg-emerald-500' : 
                  metric.value >= 95 ? 'bg-white/60' : 'bg-amber-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
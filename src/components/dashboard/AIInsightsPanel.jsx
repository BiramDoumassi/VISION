import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const insights = [
  {
    type: 'anomaly',
    title: 'Unusual data pattern detected',
    description: 'Sales database showing 340% spike in European region',
    severity: 'warning',
    time: '2 mins ago'
  },
  {
    type: 'trend',
    title: 'Customer churn prediction',
    description: 'AI predicts 12% increase in next quarter based on current patterns',
    severity: 'info',
    time: '15 mins ago'
  },
  {
    type: 'recommendation',
    title: 'Optimize storage costs',
    description: 'Moving cold data to archive could save $2,400/month',
    severity: 'success',
    time: '1 hour ago'
  }
];

const iconMap = {
  anomaly: AlertTriangle,
  trend: TrendingUp,
  recommendation: Lightbulb
};

const severityColors = {
  warning: 'text-amber-400 bg-amber-500/10',
  info: 'text-blue-400 bg-blue-500/10',
  success: 'text-emerald-400 bg-emerald-500/10'
};

export default function AIInsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white/70" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Insights</h3>
            <p className="text-white/40 text-xs">Automated intelligence</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white text-xs">
          View all
        </Button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${severityColors[insight.severity]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-white/90 font-medium truncate">{insight.title}</h4>
                    <span className="text-[10px] text-white/30 ml-2">{insight.time}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{insight.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
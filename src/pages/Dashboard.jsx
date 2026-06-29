import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import ConnectorStatus from '@/components/dashboard/ConnectorStatus';
import SystemHealth from '@/components/dashboard/SystemHealth';
import {
  Database, FileText, Search, Sparkles,
  Activity, Shield, Zap
} from 'lucide-react';
import { Document, Pipeline, AIInsight } from '@/api/entities';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    documents: '…',
    pipelines: '…',
    insights: '…',
    alerts: '…',
  });

  useEffect(() => {
    Promise.allSettled([
      Document.list('-created_date', 1000),
      Pipeline.list('-created_date', 200),
      AIInsight.list('-created_date', 200),
    ]).then(([docs, pipes, insights]) => {
      const docList = docs.status === 'fulfilled' ? docs.value : [];
      const pipeList = pipes.status === 'fulfilled' ? pipes.value : [];
      const insightList = insights.status === 'fulfilled' ? insights.value : [];

      setCounts({
        documents: docList.length.toLocaleString(),
        pipelines: pipeList.filter(p => p.status === 'active').length.toString(),
        insights: insightList.length.toLocaleString(),
        alerts: insightList.filter(i => !i.is_resolved && (i.severity === 'critical' || i.severity === 'high')).length.toString(),
      });
    });
  }, []);

  const metrics = [
    { title: 'Total Documents', value: counts.documents, change: '+12.5%', changeType: 'positive', icon: FileText },
    { title: 'AI Queries Today', value: '14,821', change: '+23.8%', changeType: 'positive', icon: Search },
    { title: 'Active Pipelines', value: counts.pipelines, change: '+4', changeType: 'positive', icon: Activity },
    { title: 'AI Insights', value: counts.insights, change: '+156', changeType: 'positive', icon: Sparkles },
    { title: 'Data Quality', value: '98.7%', change: '+0.3%', changeType: 'positive', icon: Zap },
    { title: 'Security Alerts', value: counts.alerts, change: '-2', changeType: 'positive', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Command Center" subtitle="Enterprise AI Data Platform" />

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.title} {...metric} delay={i * 0.05} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActivityChart />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-white font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Upload Data', icon: Database },
                  { label: 'AI Query', icon: Sparkles },
                  { label: 'New Pipeline', icon: Activity },
                  { label: 'Security Scan', icon: Shield }
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-white/40 group-hover:text-white/70" />
                    <span className="text-sm text-white/60 group-hover:text-white/90">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <AIInsightsPanel />
            <ConnectorStatus />
            <SystemHealth />
          </div>
        </div>
      </div>
    </div>
  );
}

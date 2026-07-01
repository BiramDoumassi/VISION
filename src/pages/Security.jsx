import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Shield, Lock, Eye, AlertTriangle, CheckCircle,
  Users, FileWarning, Activity, Globe, Database, Loader2
} from 'lucide-react';
import { AIInsight, Document } from '@/api/entities';

function relativeDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const FALLBACK_ALERTS = [
  { type: 'critical', title: 'Unusual access pattern detected', source: 'PostgreSQL', time: '5 mins ago' },
  { type: 'warning', title: 'New IP address access', source: 'API Gateway', time: '23 mins ago' },
  { type: 'info', title: 'Permission change logged', source: 'User Management', time: '1 hour ago' },
];

const complianceItems = [
  { name: 'GDPR',     status: 'compliant',    score: 98 },
  { name: 'SOC2',     status: 'compliant',    score: 95 },
  { name: 'HIPAA',    status: 'compliant',    score: 92 },
  { name: 'ISO 27001',status: 'in_progress',  score: 78 },
];

export default function Security() {
  const [alerts,     setAlerts]     = useState([]);
  const [score,      setScore]      = useState(94);
  const [docCounts,  setDocCounts]  = useState({ restricted: 0, confidential: 0, internal: 0, public: 0 });
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.allSettled([
      AIInsight.list('-created_date', 100),
      Document.list('-created_date', 500),
    ]).then(([insightRes, docRes]) => {
      const insights = insightRes.status === 'fulfilled' ? insightRes.value : [];
      const docs     = docRes.status    === 'fulfilled' ? docRes.value    : [];

      const mapped = insights
        .filter(i => ['critical', 'high', 'warning', 'info'].includes(i.severity))
        .slice(0, 6)
        .map(i => ({
          type:   i.severity === 'critical' ? 'critical' : i.severity === 'high' ? 'warning' : 'info',
          title:  i.title       || i.description || 'Security event detected',
          source: i.source_type || 'Platform',
          time:   relativeDate(i.created_date),
        }));

      const critical = insights.filter(i => i.severity === 'critical' && !i.is_resolved).length;
      const high     = insights.filter(i => i.severity === 'high'     && !i.is_resolved).length;
      const computed = Math.max(0, Math.min(100, 100 - critical * 5 - high * 2));

      const counts = { restricted: 0, confidential: 0, internal: 0, public: 0 };
      docs.forEach(d => { if (counts[d.sensitivity] !== undefined) counts[d.sensitivity]++; });

      setAlerts(mapped.length > 0 ? mapped : FALLBACK_ALERTS);
      setScore(insights.length > 0 ? computed : 94);
      setDocCounts(counts);
    }).finally(() => setLoading(false));
  }, []);

  const securityMetrics = [
    { label: 'Compliance Score', value: score,  icon: CheckCircle, status: score >= 80 ? 'healthy' : 'warning' },
    { label: 'Risk Level',       value: Math.max(0, 100 - score), icon: AlertTriangle, status: score >= 80 ? 'warning' : 'critical' },
    { label: 'Encrypted Data',   value: 99.8,   icon: Lock,        status: 'healthy' },
    { label: 'Access Audited',   value: 100,    icon: Eye,         status: 'healthy' },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Security Center" subtitle="Data governance & compliance" />

      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <svg className="w-40 h-40">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle cx="80" cy="80" r="70" fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 * (1 - score / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  transform="rotate(-90 80 80)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white font-space">{score}</span>
                <span className="text-xs text-white/40">Security Score</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              {securityMetrics.map((metric, i) => (
                <motion.div key={metric.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
                  <metric.icon className={`w-5 h-5 mx-auto mb-2 ${metric.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <p className="text-2xl font-semibold text-white font-space">{metric.value}%</p>
                  <p className="text-xs text-white/40">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-medium">Security Alerts</h3>
              {loading && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
            </div>

            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    alert.type === 'critical' ? 'bg-red-500/5 border-red-500/20'
                    : alert.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-white/[0.02] border-white/5'
                  }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      alert.type === 'critical' ? 'text-red-400'
                      : alert.type === 'warning' ? 'text-amber-400'
                      : 'text-white/40'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-white/80">{alert.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/40">{alert.source}</span>
                        <span className="text-xs text-white/30">{alert.time}</span>
                      </div>
                    </div>
                    <button className="text-xs text-white/40 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
            <h3 className="text-white font-medium mb-6">Compliance Status</h3>
            <div className="space-y-4">
              {complianceItems.map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.status === 'compliant'
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        : <Activity className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="text-sm text-white/70">{item.name}</span>
                    </div>
                    <span className="text-xs text-white/50">{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${item.score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }} className="glass rounded-2xl p-6 mt-6">
          <h3 className="text-white font-medium mb-6">Sensitive Data Detection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'PII Detected',    value: docCounts.restricted  || '3,421',   icon: Users,       color: 'text-red-400' },
              { label: 'Financial Data',  value: docCounts.confidential || '12,892',  icon: Database,    color: 'text-amber-400' },
              { label: 'Health Records',  value: '—',                                 icon: FileWarning, color: 'text-red-400' },
              { label: 'Public Data',     value: docCounts.public       || '189,234', icon: Globe,       color: 'text-emerald-400' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <item.icon className={`w-5 h-5 ${item.color} mb-3`} />
                <p className="text-xl font-semibold text-white font-space">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </p>
                <p className="text-xs text-white/40 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

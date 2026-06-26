import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Sparkles, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, FileWarning, Wand2, Play, RefreshCw,
  Download, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const qualityMetrics = [
  { label: 'Overall Quality', value: 94.2, icon: TrendingUp, status: 'healthy' },
  { label: 'Missing Values', value: 1.8, icon: AlertTriangle, status: 'warning' },
  { label: 'Duplicates', value: 0.4, icon: FileWarning, status: 'healthy' },
  { label: 'Format Issues', value: 3.6, icon: XCircle, status: 'warning' }
];

const dataIssues = [
  { 
    table: 'customers',
    issue: 'Missing email addresses',
    affected: 234,
    severity: 'high',
    suggestion: 'AI can infer 89% from other records'
  },
  { 
    table: 'transactions',
    issue: 'Invalid date formats',
    affected: 1892,
    severity: 'medium',
    suggestion: 'Auto-fix to ISO 8601 format'
  },
  { 
    table: 'products',
    issue: 'Duplicate entries detected',
    affected: 47,
    severity: 'low',
    suggestion: 'Merge with primary records'
  },
  { 
    table: 'orders',
    issue: 'Inconsistent currency codes',
    affected: 523,
    severity: 'medium',
    suggestion: 'Normalize to USD based on date'
  }
];

const severityColors = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

export default function DataCleaner() {
  const [issues, setIssues] = useState(dataIssues);
  const [rescanning, setRescanning] = useState(false);

  const handleFix = (index) => {
    const issue = issues[index];
    setIssues(prev => prev.filter((_, i) => i !== index));
    toast.success(`Correction appliquée — ${issue.affected.toLocaleString()} enregistrements corrigés`);
  };

  const handleAutoFix = () => {
    const count = issues.reduce((sum, i) => sum + i.affected, 0);
    setIssues([]);
    toast.success(`Auto-Fix terminé — ${count.toLocaleString()} enregistrements corrigés`);
  };

  const handleRescan = () => {
    setRescanning(true);
    toast.loading('Scan en cours...', { id: 'rescan' });
    setTimeout(() => {
      setIssues(dataIssues);
      setRescanning(false);
      toast.success('Scan terminé — 4 problèmes détectés', { id: 'rescan' });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="AI Data Cleaner" 
        subtitle="Automated data quality management" 
      />
      
      <div className="p-6">
        {/* Quality Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-white font-medium">Data Quality Score</h2>
                <p className="text-xs text-white/40">Last scan: 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleRescan} disabled={rescanning} variant="outline" className="border-white/10 text-white/70 hover:bg-white/5 gap-2">
                <RefreshCw className={`w-4 h-4 ${rescanning ? 'animate-spin' : ''}`} />
                Rescan
              </Button>
              <Button onClick={handleAutoFix} disabled={issues.length === 0} className="bg-white text-black hover:bg-white/90 gap-2">
                <Wand2 className="w-4 h-4" />
                Auto-Fix All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {qualityMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <metric.icon className={`w-5 h-5 mb-2 ${
                  metric.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'
                }`} />
                <p className="text-2xl font-semibold text-white font-space">{metric.value}%</p>
                <p className="text-xs text-white/40 mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Issues List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-medium">Detected Issues</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white/40 text-xs">
                  <Filter className="w-3 h-3 mr-1" /> Filter
                </Button>
                <Button variant="ghost" size="sm" className="text-white/40 text-xs">
                  <Download className="w-3 h-3 mr-1" /> Export
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {issues.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                  Aucun problème détecté ✓
                </div>
              )}
              {issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${severityColors[issue.severity]}`}>
                        {issue.severity}
                      </div>
                      <div>
                        <p className="text-sm text-white/80">{issue.issue}</p>
                        <p className="text-xs text-white/40 mt-0.5">Table: {issue.table}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white/70">{issue.affected.toLocaleString()} rows</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/50">{issue.suggestion}</span>
                    </div>
                    <button
                      onClick={() => handleFix(i)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
                    >
                      <Play className="w-3 h-3" /> Fix
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quality Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-white font-medium mb-4">Quality Trend</h3>
            
            <div className="space-y-4">
              {[
                { date: 'Today', score: 94.2, change: '+0.8%' },
                { date: 'Yesterday', score: 93.4, change: '+1.2%' },
                { date: '2 days ago', score: 92.2, change: '-0.3%' },
                { date: '3 days ago', score: 92.5, change: '+2.1%' },
                { date: '1 week ago', score: 90.4, change: '+0.5%' }
              ].map((item, i) => (
                <div key={item.date} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">{item.date}</p>
                    <p className="text-lg font-semibold text-white font-space">{item.score}%</p>
                  </div>
                  <span className={`text-xs ${item.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-white/60">AI Recommendation</span>
              </div>
              <p className="text-sm text-white/50">
                Running auto-fix on transaction dates could improve quality score by 2.4%
              </p>
            </div>
          </motion.div>
        </div>

        {/* Processing Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <h3 className="text-white font-medium mb-4">Cleaning Pipeline</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 'Validation', status: 'completed', progress: 100 },
              { step: 'Deduplication', status: 'processing', progress: 67 },
              { step: 'Normalization', status: 'pending', progress: 0 },
              { step: 'Enrichment', status: 'pending', progress: 0 }
            ].map((step, i) => (
              <div key={step.step} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/70">{step.step}</p>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : step.status === 'processing' ? (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                  )}
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className={`h-full rounded-full ${
                      step.status === 'completed' ? 'bg-emerald-500' : 
                      step.status === 'processing' ? 'bg-blue-500' : 'bg-white/10'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
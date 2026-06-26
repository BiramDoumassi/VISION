import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Scale, Shield, Lock, Eye, FileCheck, AlertTriangle,
  CheckCircle, XCircle, Users, Database, Globe, Clock,
  BarChart3, Flag, ChevronRight, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const complianceStandards = [
  { name: 'RGPD / GDPR', score: 94, status: 'compliant', checks: 48, passed: 45, icon: Globe },
  { name: 'ISO 27001', score: 88, status: 'partial', checks: 114, passed: 100, icon: Shield },
  { name: 'SOC 2 Type II', score: 96, status: 'compliant', checks: 64, passed: 62, icon: FileCheck },
  { name: 'HIPAA', score: 91, status: 'compliant', checks: 78, passed: 71, icon: Lock },
  { name: 'PCI DSS', score: 79, status: 'partial', checks: 92, passed: 73, icon: Scale }
];

const dataClassifications = [
  { level: 'Public', count: 48200, color: 'bg-emerald-500', textColor: 'text-emerald-400', percent: 31 },
  { level: 'Internal', count: 82400, color: 'bg-blue-500', textColor: 'text-blue-400', percent: 53 },
  { level: 'Confidential', count: 19800, color: 'bg-amber-500', textColor: 'text-amber-400', percent: 13 },
  { level: 'Restricted', count: 4200, color: 'bg-red-500', textColor: 'text-red-400', percent: 3 }
];

const auditLogs = [
  { user: 'Marie Dupont', action: 'Exported dataset "Q2 Reports"', resource: 'Dataset', time: '2m ago', risk: 'low' },
  { user: 'Thomas René', action: 'Modified access policy for Finance group', resource: 'Policy', time: '14m ago', risk: 'medium' },
  { user: 'Admin Bot', action: 'Auto-classified 2,340 new documents', resource: 'Catalog', time: '1h ago', risk: 'low' },
  { user: 'Sophie Laurent', action: 'Deleted 12 records from customer table', resource: 'Database', time: '2h ago', risk: 'high' },
  { user: 'API Gateway', action: 'External API access to /data/contracts endpoint', resource: 'API', time: '3h ago', risk: 'medium' },
  { user: 'Lucas Martin', action: 'Changed retention policy to 5 years', resource: 'Policy', time: '5h ago', risk: 'medium' }
];

const riskColors = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20'
};

const dataRetentionPolicies = [
  { category: 'Customer Data', retention: '7 years', regulation: 'GDPR Art. 5', status: 'active' },
  { category: 'Financial Records', retention: '10 years', regulation: 'Commercial law', status: 'active' },
  { category: 'HR Documents', retention: '5 years', regulation: 'Labor law', status: 'active' },
  { category: 'Marketing Data', retention: '3 years', regulation: 'GDPR consent', status: 'review' },
  { category: 'Access Logs', retention: '1 year', regulation: 'ISO 27001', status: 'active' }
];

export default function Governance() {
  const [activeTab, setActiveTab] = useState('overview');

  const overallScore = Math.round(complianceStandards.reduce((s, c) => s + c.score, 0) / complianceStandards.length);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Governance & Compliance" subtitle="Data governance, RGPD, ISO 27001, SOC 2" />

      <div className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          {['overview', 'compliance', 'audit', 'retention'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${activeTab === tab ? 'bg-white text-black font-medium' : 'text-white/50 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Score */}
            <div className="grid md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md:col-span-1 glass rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
                      strokeDasharray={`${overallScore * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{overallScore}</span>
                  </div>
                </div>
                <p className="text-sm text-white/70 font-medium">Compliance Score</p>
                <p className="text-xs text-white/40 mt-1">Across all standards</p>
              </motion.div>

              {[
                { label: 'Active Policies', value: '24', icon: Scale, color: 'text-blue-400' },
                { label: 'Data Assets', value: '154K', icon: Database, color: 'text-purple-400' },
                { label: 'Pending Reviews', value: '7', icon: AlertTriangle, color: 'text-amber-400' }
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 1) * 0.05 }} className="glass rounded-2xl p-6">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Data Classification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4">Data Classification</h3>
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                {dataClassifications.map(dc => (
                  <motion.div key={dc.level} initial={{ width: 0 }} animate={{ width: `${dc.percent}%` }}
                    transition={{ duration: 0.8 }} className={`${dc.color} h-full`} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dataClassifications.map(dc => (
                  <div key={dc.level}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${dc.color}`} />
                      <span className="text-xs text-white/60">{dc.level}</span>
                    </div>
                    <p className={`text-lg font-semibold font-space ${dc.textColor}`}>{dc.percent}%</p>
                    <p className="text-xs text-white/30">{dc.count.toLocaleString()} assets</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            {complianceStandards.map((standard, i) => (
              <motion.div key={standard.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <standard.icon className="w-6 h-6 text-white/50" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{standard.name}</h4>
                      <p className="text-xs text-white/40 mt-0.5">{standard.passed}/{standard.checks} checks passed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border ${
                      standard.status === 'compliant'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {standard.status === 'compliant' ? 'Compliant' : 'Partial'}
                    </span>
                    <span className="text-2xl font-bold text-white font-space">{standard.score}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${standard.score}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full ${standard.score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Audit Trail</h3>
              <Button variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 gap-2 h-8 text-xs">
                <Download className="w-3 h-3" /> Export Audit Log
              </Button>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'Action', 'Resource', 'Risk', 'Time'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-white/30 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-white/70">{log.user}</td>
                      <td className="px-4 py-3 text-xs text-white/50 max-w-xs">{log.action}</td>
                      <td className="px-4 py-3 text-xs text-white/40">{log.resource}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColors[log.risk]}`}>{log.risk}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/30">{log.time}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Data Retention Policies</h3>
              <Button className="bg-white text-black hover:bg-white/90 gap-2 h-8 text-xs">
                + New Policy
              </Button>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Data Category', 'Retention Period', 'Regulation', 'Status'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-white/30 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRetentionPolicies.map((policy, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm text-white/70 font-medium">{policy.category}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-white/30" />
                          <span className="text-sm text-white">{policy.retention}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-white/40">{policy.regulation}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${
                          policy.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {policy.status === 'active' ? 'Active' : 'Under Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
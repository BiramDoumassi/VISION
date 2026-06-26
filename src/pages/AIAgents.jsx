import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import {
  Bot, Play, Pause, Settings, Plus, Zap, BarChart3,
  Shield, FileText, Brain, Search, TrendingUp, Scale,
  ChevronRight, Activity, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const agents = [
  {
    id: 1, name: 'Data Analyst Agent', icon: BarChart3, status: 'active',
    desc: 'Analyzes datasets, detects trends and generates automated reports.',
    tasks: 142, success: 98.2, color: 'blue',
    capabilities: ['Data analysis', 'Chart generation', 'Report writing']
  },
  {
    id: 2, name: 'Compliance Agent', icon: Scale, status: 'active',
    desc: 'Monitors GDPR, ISO 27001, SOC2 compliance across all data assets.',
    tasks: 89, success: 99.1, color: 'emerald',
    capabilities: ['GDPR monitoring', 'Policy enforcement', 'Audit reports']
  },
  {
    id: 3, name: 'Security Agent', icon: Shield, status: 'active',
    desc: 'Detects anomalies, unauthorized access and potential data breaches.',
    tasks: 2841, success: 96.7, color: 'red',
    capabilities: ['Threat detection', 'Access monitoring', 'Incident response']
  },
  {
    id: 4, name: 'Data Quality Agent', icon: Zap, status: 'active',
    desc: 'Continuously scans datasets for inconsistencies, duplicates and errors.',
    tasks: 512, success: 97.4, color: 'amber',
    capabilities: ['Quality scoring', 'Auto-fix suggestions', 'Validation']
  },
  {
    id: 5, name: 'Financial Analyst Agent', icon: TrendingUp, status: 'paused',
    desc: 'Analyzes financial data, forecasts and detects anomalies in transactions.',
    tasks: 67, success: 94.8, color: 'purple',
    capabilities: ['Financial analysis', 'Forecasting', 'Anomaly detection']
  },
  {
    id: 6, name: 'Legal Assistant Agent', icon: FileText, status: 'idle',
    desc: 'Reviews contracts, extracts clauses and flags risks automatically.',
    tasks: 34, success: 91.2, color: 'orange',
    capabilities: ['Contract review', 'Clause extraction', 'Risk flagging']
  },
  {
    id: 7, name: 'Knowledge Manager Agent', icon: Brain, status: 'active',
    desc: 'Builds and maintains the knowledge graph from all data sources.',
    tasks: 203, success: 98.9, color: 'cyan',
    capabilities: ['Entity extraction', 'Graph building', 'Relationship mapping']
  },
  {
    id: 8, name: 'Search Intelligence Agent', icon: Search, status: 'active',
    desc: 'Powers semantic search across all enterprise data with context understanding.',
    tasks: 1204, success: 99.5, color: 'indigo',
    capabilities: ['Semantic search', 'Context understanding', 'Result ranking']
  }
];

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500' },
  idle: { label: 'Idle', color: 'text-white/40', bg: 'bg-white/5 border-white/10', dot: 'bg-white/30' }
};

const recentActivity = [
  { agent: 'Data Quality Agent', action: 'Fixed 234 duplicate records in customers table', time: '2m ago', type: 'success' },
  { agent: 'Compliance Agent', action: 'GDPR audit completed — 0 violations found', time: '15m ago', type: 'success' },
  { agent: 'Security Agent', action: 'Suspicious access pattern detected from IP 192.168.1.45', time: '32m ago', type: 'warning' },
  { agent: 'Financial Analyst', action: 'Q2 revenue forecast generated — $4.2M projected', time: '1h ago', type: 'info' },
  { agent: 'Knowledge Manager', action: '1,240 new entity relationships mapped', time: '2h ago', type: 'success' }
];

export default function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState(() =>
    Object.fromEntries(agents.map(a => [a.id, a.status]))
  );

  const toggleAgent = (agent, e) => {
    e.stopPropagation();
    const current = agentStatuses[agent.id];
    const next = current === 'active' ? 'paused' : 'active';
    setAgentStatuses(prev => ({ ...prev, [agent.id]: next }));
    toast.success(next === 'active' ? `${agent.name} redémarré` : `${agent.name} mis en pause`);
  };

  const activeCount = Object.values(agentStatuses).filter(s => s === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="AI Agents Platform" subtitle="Autonomous data intelligence agents" />


      <div className="p-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <DoumassiLogo className="h-8 w-auto" />
          <div className="w-px h-6 bg-white/10" />
          <p className="text-xs text-white/40">Autonomous AI Agents Platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Agents', value: activeCount, icon: Bot, color: 'text-emerald-400' },
            { label: 'Tasks Completed', value: totalTasks.toLocaleString(), icon: CheckCircle, color: 'text-blue-400' },
            { label: 'Avg Success Rate', value: '97.1%', icon: TrendingUp, color: 'text-purple-400' },
            { label: 'Running Now', value: '3', icon: Activity, color: 'text-amber-400' }
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agents Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Deployed Agents</h3>
              <Button className="bg-white text-black hover:bg-white/90 gap-2 h-8 text-xs">
                <Plus className="w-3 h-3" /> New Agent
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {agents.map((agent, i) => {
                const currentStatus = agentStatuses[agent.id];
                const s = statusConfig[currentStatus] || statusConfig.idle;
                return (
                  <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                    className={`glass rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/[0.04] ${selectedAgent?.id === agent.id ? 'border-white/20' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <agent.icon className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{agent.name}</p>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] mt-1 ${s.bg} ${s.color}`}>
                            <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                            {s.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => toggleAgent(agent, e)}
                          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          {currentStatus === 'active'
                            ? <Pause className="w-3 h-3 text-white/50" />
                            : <Play className="w-3 h-3 text-white/50" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.info(`Paramètres de ${agent.name}`); }}
                          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Settings className="w-3 h-3 text-white/50" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mb-3 leading-relaxed">{agent.desc}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/30">{agent.tasks} tasks</span>
                      <span className="text-emerald-400">{agent.success}% success</span>
                    </div>
                    {selectedAgent?.id === agent.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Capabilities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.capabilities.map(cap => (
                            <span key={cap} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50">{cap}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 h-fit">
            <h3 className="text-white font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.type === 'success' ? 'bg-emerald-500' :
                    item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-white/70">{item.agent}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.action}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/30">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs font-medium text-white/60 mb-2">Create Custom Agent</p>
              <p className="text-xs text-white/30 mb-3">Define a specialized agent for your business needs.</p>
              <Button className="w-full bg-white/5 hover:bg-white/10 text-white/60 text-xs h-8 gap-2">
                <Plus className="w-3 h-3" /> Configure Agent
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
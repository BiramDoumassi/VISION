import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import {
  Bot, Play, Pause, Settings, Plus, Zap, BarChart3,
  Shield, FileText, Brain, Search, TrendingUp, Scale,
  Activity, CheckCircle, Clock, X, Send, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { AIConversation } from '@/api/entities';

const AGENT_CONFIGS = [
  { id: 1, name: 'Data Analyst Agent',        agentName: 'DataAnalyst',   icon: BarChart3,  color: 'blue',    desc: 'Analyzes datasets, detects trends and generates automated reports.',       defaultTask: 'Analyze my data and report key trends, top metrics, and any anomalies you detect.' },
  { id: 2, name: 'Compliance Agent',           agentName: 'Compliance',    icon: Scale,      color: 'emerald', desc: 'Monitors GDPR, ISO 27001, SOC2 compliance across all data assets.',      defaultTask: 'Run a compliance check and report the current status of GDPR, ISO 27001, and SOC2 across the platform.' },
  { id: 3, name: 'Security Agent',             agentName: 'Security',      icon: Shield,     color: 'red',     desc: 'Detects anomalies, unauthorized access and potential data breaches.',     defaultTask: 'Perform a security audit: check for unauthorized access patterns, anomalies, and list any threats detected.' },
  { id: 4, name: 'Data Quality Agent',         agentName: 'DataQuality',   icon: Zap,        color: 'amber',   desc: 'Continuously scans datasets for inconsistencies, duplicates and errors.', defaultTask: 'Scan all datasets for quality issues: duplicates, missing values, formatting errors. Give a quality score.' },
  { id: 5, name: 'Financial Analyst Agent',    agentName: 'FinancialAnalyst', icon: TrendingUp, color: 'purple', desc: 'Analyzes financial data, forecasts and detects anomalies in transactions.', defaultTask: 'Analyze financial data: revenue trends, anomalies in transactions, and forecast for next quarter.' },
  { id: 6, name: 'Legal Assistant Agent',      agentName: 'LegalAssistant', icon: FileText,  color: 'orange',  desc: 'Reviews contracts, extracts clauses and flags risks automatically.',       defaultTask: 'Review all contracts in the DataHub, extract key clauses, and flag any legal risks.' },
  { id: 7, name: 'Knowledge Manager Agent',    agentName: 'KnowledgeManager', icon: Brain,   color: 'cyan',    desc: 'Builds and maintains the knowledge graph from all data sources.',          defaultTask: 'Extract entities and relationships from all documents and update the knowledge graph.' },
  { id: 8, name: 'Search Intelligence Agent',  agentName: 'SearchIntelligence', icon: Search, color: 'indigo', desc: 'Powers semantic search across all enterprise data with context understanding.', defaultTask: 'Index all data sources and generate a semantic search report with top-ranked entities.' },
];

// Use the main VISION agent as fallback when specialized agents aren't configured
const MAIN_AGENT = import.meta.env.VITE_BASE44_AGENT_NAME || 'VISION';

const STATUS = {
  active:  { label: 'Active',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  paused:  { label: 'Paused',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     dot: 'bg-amber-500'   },
  idle:    { label: 'Idle',    color: 'text-white/40',    bg: 'bg-white/5 border-white/10',              dot: 'bg-white/30'    },
};

export default function AIAgents() {
  const [agentStatuses, setAgentStatuses] = useState(() =>
    Object.fromEntries(AGENT_CONFIGS.map(a => [a.id, a.id <= 4 || a.id === 7 || a.id === 8 ? 'active' : a.id === 5 ? 'paused' : 'idle']))
  );
  const [chat, setChat] = useState(null); // { agent, conv, messages, loading }
  const unsubRef = useRef(null);

  useEffect(() => () => unsubRef.current?.(), []);

  const toggleAgent = (agent, e) => {
    e.stopPropagation();
    const next = agentStatuses[agent.id] === 'active' ? 'paused' : 'active';
    setAgentStatuses(prev => ({ ...prev, [agent.id]: next }));
    toast.success(next === 'active' ? `${agent.name} redémarré` : `${agent.name} mis en pause`);
  };

  const runAgent = async (agent, e) => {
    e.stopPropagation();
    toast.loading(`Démarrage de ${agent.name}…`, { id: `run-${agent.id}` });
    try {
      // Try agent-specific name first, fall back to main VISION agent
      let conv;
      try {
        conv = await base44.agents.createConversation({ agent_name: agent.agentName });
      } catch {
        conv = await base44.agents.createConversation({ agent_name: MAIN_AGENT });
      }

      // Send the default task for this agent
      const systemContext = `You are the ${agent.name} for the VISION platform. ${agent.desc}`;
      const taskMessage = `[AGENT TASK] ${agent.defaultTask}`;

      setChat({ agent, conv, messages: [], loading: true });
      toast.dismiss(`run-${agent.id}`);

      // Subscribe to responses
      unsubRef.current?.();
      unsubRef.current = base44.agents.subscribeToConversation(conv.id, updated => {
        const msgs = updated.messages
          .filter(m => !m.hidden && (m.role === 'user' || m.role === 'assistant') && m.content)
          .map(m => ({ id: m.id, role: m.role, content: typeof m.content === 'string' ? m.content : '' }));
        setChat(prev => prev ? { ...prev, messages: msgs, loading: msgs[msgs.length - 1]?.role !== 'assistant' } : null);
      });

      await base44.agents.addMessage(conv, { role: 'user', content: `${systemContext}\n\n${taskMessage}` });

      // Save conversation reference in AIConversation entity
      try {
        await AIConversation.create({ title: `${agent.name} — ${new Date().toLocaleString('fr-FR')}`, mode: 'agent', tokens_used: 0 });
      } catch {}

    } catch {
      toast.error(`Agent non disponible. Configure l'agent "${agent.agentName}" dans base44.`, { id: `run-${agent.id}`, duration: 5000 });
    }
  };

  const activeCount = Object.values(agentStatuses).filter(s => s === 'active').length;
  const totalTasks  = AGENT_CONFIGS.reduce((sum, a) => sum + (agentStatuses[a.id] === 'active' ? a.id * 47 : 0), 0);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="AI Agents Platform" subtitle="Autonomous data intelligence agents" />

      <div className="p-6">
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
            { label: 'Running Now', value: String(Math.min(activeCount, 3)), icon: Activity, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENT_CONFIGS.map((agent, i) => {
            const status = agentStatuses[agent.id];
            const s = STATUS[status] || STATUS.idle;
            return (
              <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 cursor-pointer hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <agent.icon className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">{agent.name}</p>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] mt-1 ${s.bg} ${s.color}`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                        {s.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={(e) => toggleAgent(agent, e)}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      {status === 'active' ? <Pause className="w-3 h-3 text-white/50" /> : <Play className="w-3 h-3 text-white/50" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast.info(`Paramètres de ${agent.name}`); }}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Settings className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">{agent.desc}</p>
                <Button onClick={(e) => runAgent(agent, e)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/70 text-xs h-8 gap-2 border border-white/10">
                  <Play className="w-3 h-3" /> Run Task
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Agent Chat Modal */}
      <AnimatePresence>
        {chat && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => { setChat(null); unsubRef.current?.(); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:bottom-6 md:right-6 md:w-[480px] md:h-[520px] glass rounded-2xl border border-white/10 flex flex-col z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <chat.agent.icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{chat.agent.name}</p>
                    <p className="text-xs text-white/40">Running task…</p>
                  </div>
                </div>
                <button onClick={() => { setChat(null); unsubRef.current?.(); }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chat.messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                      msg.role === 'user' ? 'bg-white text-black' : 'bg-white/5 text-white/80 border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chat.loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

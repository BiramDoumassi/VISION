import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Mail, Image, FileText, CreditCard,
  Cloud, Search, Sparkles, Calendar,
  Clock, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const dataSources = [
  { name: 'Gmail', icon: Mail, connected: true, items: '12,456', lastSync: '2 mins ago' },
  { name: 'Google Drive', icon: Cloud, connected: true, items: '3,892', lastSync: '5 mins ago' },
  { name: 'Photos', icon: Image, connected: true, items: '8,234', lastSync: '1 hour ago' },
  { name: 'Documents', icon: FileText, connected: true, items: '1,234', lastSync: '30 mins ago' },
  { name: 'Finances', icon: CreditCard, connected: false, items: '-', lastSync: '-' },
  { name: 'Calendar', icon: Calendar, connected: true, items: '456', lastSync: '10 mins ago' }
];

const aiMemories = [
  { title: 'Project Alpha deadline approaching', time: 'In 3 days', type: 'reminder', importance: 'high' },
  { title: 'Frequently collaborate with John on reports', time: 'Pattern detected', type: 'insight', importance: 'medium' },
  { title: 'Tax documents from 2025 available', time: 'Found today', type: 'discovery', importance: 'low' }
];

const recentActivity = [
  { action: 'AI summarized', item: '45 emails from last week', time: '2 hours ago' },
  { action: 'Connected', item: 'New Google Calendar sync', time: '5 hours ago' },
  { action: 'Discovered', item: '23 duplicate photos removed', time: '1 day ago' }
];

export default function PersonalOS() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    toast.loading(`Recherche de "${searchQuery}"...`, { id: 'search' });
    setTimeout(() => {
      toast.success(`Résultats pour "${searchQuery}" — 3 correspondances trouvées`, { id: 'search' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Personal Data OS" 
        subtitle="Your AI-powered digital life" 
      />
      
      <div className="p-6">
        {/* AI Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl text-white font-medium">Universal Search</h2>
              <p className="text-sm text-white/40">Search across your entire digital life</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask AI to find anything... e.g., 'Find tax documents from 2025'"
              className="h-14 pl-12 pr-4 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base rounded-xl"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" /> Search
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Data Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-medium">Connected Sources</h3>
                <Button variant="ghost" size="sm" className="text-white/50 text-xs">
                  + Add Source
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {dataSources.map((source, i) => (
                  <motion.div
                    key={source.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      source.connected 
                        ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' 
                        : 'bg-white/[0.01] border-dashed border-white/10'
                    } transition-all cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        source.connected ? 'bg-white/10' : 'bg-white/5'
                      }`}>
                        <source.icon className={`w-5 h-5 ${source.connected ? 'text-white/70' : 'text-white/30'}`} />
                      </div>
                      <div className={`w-2 h-2 rounded-full ${source.connected ? 'bg-emerald-500' : 'bg-white/20'}`} />
                    </div>
                    <p className={`text-sm font-medium ${source.connected ? 'text-white/80' : 'text-white/40'}`}>
                      {source.name}
                    </p>
                    {source.connected ? (
                      <>
                        <p className="text-lg font-semibold text-white font-space mt-1">{source.items}</p>
                        <p className="text-[10px] text-white/30 mt-1">Synced {source.lastSync}</p>
                      </>
                    ) : (
                      <p className="text-xs text-white/30 mt-2">Click to connect</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Memory Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 mt-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-medium">AI Memory</h3>
              </div>

              <div className="space-y-4">
                {aiMemories.map((memory, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      memory.importance === 'high' ? 'bg-red-400' :
                      memory.importance === 'medium' ? 'bg-amber-400' : 'bg-white/40'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-white/80">{memory.title}</p>
                      <p className="text-xs text-white/40 mt-1">{memory.time}</p>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase">{memory.type}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-white font-medium mb-4">Your Digital Life</h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Items', value: '26.2K', trend: '+234 this week' },
                  { label: 'AI Insights', value: '156', trend: 'Generated today' },
                  { label: 'Storage Used', value: '18.4 GB', trend: '32% of quota' }
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40">{stat.label}</p>
                      <p className="text-lg font-semibold text-white font-space">{stat.value}</p>
                    </div>
                    <span className="text-[10px] text-white/30">{stat.trend}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-white font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2" />
                    <div>
                      <p className="text-xs text-white/60">
                        <span className="text-white/80">{activity.action}</span> {activity.item}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-medium">AI Suggestions</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-white/60">
                  "You have 156 unread emails from this month. Would you like me to summarize them by priority?"
                </p>
                <Button size="sm" className="mt-3 bg-white text-black hover:bg-white/90 text-xs">
                  Yes, summarize
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
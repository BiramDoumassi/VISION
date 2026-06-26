import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  Zap, Server, Database, Cloud, ArrowRight,
  TrendingUp, TrendingDown, Cpu, HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const performanceData = [
  { time: '00:00', latency: 45, throughput: 1200, errors: 2 },
  { time: '04:00', latency: 38, throughput: 800, errors: 1 },
  { time: '08:00', latency: 52, throughput: 2400, errors: 5 },
  { time: '12:00', latency: 48, throughput: 3100, errors: 3 },
  { time: '16:00', latency: 65, throughput: 2800, errors: 8 },
  { time: '20:00', latency: 42, throughput: 1900, errors: 2 },
];

const pipelines = [
  { name: 'Salesforce Sync', status: 'running', records: '12.4K/min', health: 98 },
  { name: 'PostgreSQL ETL', status: 'running', records: '45.2K/min', health: 100 },
  { name: 'Email Ingestion', status: 'running', records: '3.1K/min', health: 95 },
  { name: 'IoT Stream', status: 'warning', records: '892/min', health: 72 },
  { name: 'S3 Archive', status: 'completed', records: '-', health: 100 }
];

const statusColors = {
  running: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  completed: 'bg-blue-500'
};

export default function Observability() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Observability" 
        subtitle="Real-time platform monitoring" 
      />
      
      <div className="p-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'System Status', value: 'Operational', icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Avg Latency', value: '48ms', icon: Zap, change: '-12%' },
            { label: 'Throughput', value: '2.4M/hr', icon: Activity, change: '+23%' },
            { label: 'Error Rate', value: '0.02%', icon: AlertTriangle, color: 'text-amber-400' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color || 'text-white/40'}`} />
                {stat.change && (
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl p-6"
          >
            <h3 className="text-white font-medium mb-6">Platform Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    fill="url(#latencyGrad)" 
                    name="Latency (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Live Pipelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-white font-medium mb-4">Active Pipelines</h3>
            <div className="space-y-3">
              {pipelines.map((pipeline, i) => (
                <motion.div
                  key={pipeline.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusColors[pipeline.status]} ${pipeline.status === 'running' ? 'animate-pulse' : ''}`} />
                      <span className="text-sm text-white/80">{pipeline.name}</span>
                    </div>
                    <span className="text-xs text-white/40">{pipeline.records}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pipeline.health >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${pipeline.health}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Infrastructure Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <h3 className="text-white font-medium mb-6">Infrastructure Status</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'AI Engine', icon: Zap, cpu: 45, memory: 62, status: 'healthy' },
              { name: 'Data Lake', icon: Database, cpu: 28, memory: 78, status: 'healthy' },
              { name: 'API Gateway', icon: Cloud, cpu: 32, memory: 41, status: 'healthy' },
              { name: 'Processing', icon: Cpu, cpu: 89, memory: 85, status: 'warning' }
            ].map((service, i) => (
              <div key={service.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <service.icon className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/70">{service.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ml-auto ${service.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">CPU</span>
                      <span className="text-white/60">{service.cpu}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div 
                        className={`h-full rounded-full ${service.cpu > 80 ? 'bg-amber-500' : 'bg-white/40'}`}
                        style={{ width: `${service.cpu}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Memory</span>
                      <span className="text-white/60">{service.memory}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div 
                        className={`h-full rounded-full ${service.memory > 80 ? 'bg-amber-500' : 'bg-white/40'}`}
                        style={{ width: `${service.memory}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '00:00', ingestion: 2400, queries: 1400, processing: 800 },
  { name: '04:00', ingestion: 1398, queries: 2210, processing: 1200 },
  { name: '08:00', ingestion: 9800, queries: 4290, processing: 3200 },
  { name: '12:00', ingestion: 3908, queries: 5000, processing: 2800 },
  { name: '16:00', ingestion: 4800, queries: 6181, processing: 4100 },
  { name: '20:00', ingestion: 3800, queries: 4500, processing: 3500 },
  { name: '24:00', ingestion: 2300, queries: 2100, processing: 1800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 border border-white/10">
        <p className="text-xs text-white/50 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-white/80">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-medium">Platform Activity</h3>
          <p className="text-white/40 text-xs mt-0.5">Real-time data flow metrics</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Ingestion', color: '#ffffff' },
            { label: 'Queries', color: '#666666' },
            { label: 'Processing', color: '#333333' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ingestionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#666666" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#666666" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="ingestion" 
              stroke="#ffffff" 
              strokeWidth={2}
              fill="url(#ingestionGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="queries" 
              stroke="#666666" 
              strokeWidth={2}
              fill="url(#queriesGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
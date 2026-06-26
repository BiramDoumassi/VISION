import { motion } from 'framer-motion';
import { Cloud, Database, Mail, MessageSquare, FileSpreadsheet, RefreshCw } from 'lucide-react';

const connectors = [
  { name: 'Google Drive', icon: Cloud, status: 'connected', records: '12.4K', lastSync: '2 mins ago' },
  { name: 'PostgreSQL', icon: Database, status: 'connected', records: '458K', lastSync: '5 mins ago' },
  { name: 'Gmail', icon: Mail, status: 'syncing', records: '89.2K', lastSync: 'Syncing...' },
  { name: 'Slack', icon: MessageSquare, status: 'connected', records: '23.1K', lastSync: '12 mins ago' },
  { name: 'Excel/CSV', icon: FileSpreadsheet, status: 'connected', records: '1.2K', lastSync: '1 hour ago' },
];

const statusStyles = {
  connected: 'bg-emerald-500',
  syncing: 'bg-blue-500 animate-pulse',
  error: 'bg-red-500',
  disconnected: 'bg-gray-500'
};

export default function ConnectorStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-medium">Data Connectors</h3>
          <p className="text-white/40 text-xs mt-0.5">5 active connections</p>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {connectors.map((connector, i) => (
          <motion.div
            key={connector.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <connector.icon className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/80">{connector.name}</p>
                <p className="text-[10px] text-white/40">{connector.records} records</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${statusStyles[connector.status]}`} />
                <span className="text-xs text-white/40">{connector.lastSync}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
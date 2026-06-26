import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Plus, Settings, RefreshCw, CheckCircle,
  Zap, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const connectorCategories = [
  {
    name: 'Cloud Storage',
    connectors: [
      { name: 'Google Drive', status: 'connected', records: '12.4K', icon: '📁' },
      { name: 'Dropbox', status: 'disconnected', records: '-', icon: '📦' },
      { name: 'OneDrive', status: 'connected', records: '8.2K', icon: '☁️' },
      { name: 'AWS S3', status: 'connected', records: '45.2K', icon: '🗄️' }
    ]
  },
  {
    name: 'Databases',
    connectors: [
      { name: 'PostgreSQL', status: 'connected', records: '458K', icon: '🐘' },
      { name: 'MySQL', status: 'connected', records: '234K', icon: '🐬' },
      { name: 'MongoDB', status: 'syncing', records: '89K', icon: '🍃' },
      { name: 'Redis', status: 'disconnected', records: '-', icon: '🔴' }
    ]
  },
  {
    name: 'Communication',
    connectors: [
      { name: 'Gmail', status: 'connected', records: '89.2K', icon: '✉️' },
      { name: 'Outlook', status: 'disconnected', records: '-', icon: '📧' },
      { name: 'Slack', status: 'connected', records: '23.1K', icon: '💬' },
      { name: 'WhatsApp', status: 'disconnected', records: '-', icon: '📱' }
    ]
  },
  {
    name: 'CRM & Sales',
    connectors: [
      { name: 'Salesforce', status: 'connected', records: '156K', icon: '☁️' },
      { name: 'HubSpot', status: 'connected', records: '78K', icon: '🟠' },
      { name: 'Stripe', status: 'connected', records: '34K', icon: '💳' },
      { name: 'SAP', status: 'disconnected', records: '-', icon: '🔷' }
    ]
  }
];

const statusStyles = {
  connected: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Connected' },
  syncing: { color: 'text-blue-400', bg: 'bg-blue-500 animate-pulse', label: 'Syncing' },
  disconnected: { color: 'text-white/40', bg: 'bg-white/20', label: 'Not Connected' },
  error: { color: 'text-red-400', bg: 'bg-red-500', label: 'Error' }
};

export default function Connectors() {
  const [statusMap, setStatusMap] = useState(() => {
    const map = {};
    connectorCategories.forEach(cat => cat.connectors.forEach(c => { map[c.name] = c.status; }));
    return map;
  });

  const connect = (name) => {
    setStatusMap(prev => ({ ...prev, [name]: 'syncing' }));
    toast.loading(`Connexion à ${name}...`, { id: name });
    setTimeout(() => {
      setStatusMap(prev => ({ ...prev, [name]: 'connected' }));
      toast.success(`${name} connecté avec succès`, { id: name });
    }, 2000);
  };

  const sync = (name) => {
    setStatusMap(prev => ({ ...prev, [name]: 'syncing' }));
    toast.loading(`Synchronisation de ${name}...`, { id: `sync-${name}` });
    setTimeout(() => {
      setStatusMap(prev => ({ ...prev, [name]: 'connected' }));
      toast.success(`${name} synchronisé`, { id: `sync-${name}` });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Data Connectors" 
        subtitle="Connect and sync your data sources" 
      />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Connectors', value: '24', icon: Zap },
            { label: 'Active', value: '12', icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Syncing', value: '2', icon: RefreshCw, color: 'text-blue-400' },
            { label: 'Total Records', value: '1.2M', icon: Database }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <stat.icon className={`w-5 h-5 mb-2 ${stat.color || 'text-white/40'}`} />
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Connector Categories */}
        <div className="space-y-6">
          {connectorCategories.map((category, catIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + catIndex * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-white font-medium mb-4">{category.name}</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.connectors.map((connector, i) => {
                  const currentStatus = statusMap[connector.name] || connector.status;
                  const status = statusStyles[currentStatus];
                  return (
                    <motion.div
                      key={connector.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        currentStatus === 'connected' || currentStatus === 'syncing'
                          ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                          : 'bg-white/[0.01] border-dashed border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{connector.icon}</span>
                        <div className={`w-2 h-2 rounded-full ${status.bg}`} />
                      </div>

                      <p className="text-sm font-medium text-white/80">{connector.name}</p>
                      <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>

                      {connector.records !== '-' && (
                        <p className="text-lg font-semibold text-white font-space mt-2">
                          {connector.records}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        {currentStatus === 'connected' ? (
                          <>
                            <button
                              onClick={() => toast.info(`Configuration de ${connector.name}`)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Settings className="w-3 h-3" /> Configure
                            </button>
                            <button
                              onClick={() => sync(connector.name)}
                              className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </>
                        ) : currentStatus === 'syncing' ? (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                          </span>
                        ) : (
                          <button
                            onClick={() => connect(connector.name)}
                            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Connect
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Custom Connector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Custom API Integration</h3>
              <p className="text-sm text-white/40 mt-1">Connect any REST API or webhook</p>
            </div>
            <Button onClick={() => toast.info('Ouverture du configurateur d\'API...')} className="bg-white text-black hover:bg-white/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Custom Connector
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
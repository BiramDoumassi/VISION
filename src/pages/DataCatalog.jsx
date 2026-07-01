import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Search, Database, FileText, Table2,
  Brain, Star, StarOff, ChevronRight, Eye,
  GitBranch, Plus, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '@/api/entities';

const typeIcons = { table: Table2, dataset: Database, documents: FileText, model: Brain };

const classificationColors = {
  Public:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Internal:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Confidential: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Restricted:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const sensitivityToClassification = {
  restricted: 'Restricted', confidential: 'Confidential',
  public: 'Public', internal: 'Internal',
};

const extToType = (type) => {
  if (['pdf', 'contract', 'other'].includes(type)) return 'documents';
  if (['spreadsheet'].includes(type)) return 'dataset';
  return 'table';
};

function mapDocToCatalog(doc) {
  const classification = sensitivityToClassification[doc.sensitivity] || 'Internal';
  return {
    id: doc.id,
    name: doc.name || 'Untitled',
    type: extToType(doc.type),
    source: 'DataHub',
    owner: doc.category || 'Data Team',
    records: doc.size_bytes ? Math.max(1, Math.floor(doc.size_bytes / 50)) : null,
    quality: doc.sensitivity === 'restricted' ? 98 : doc.sensitivity === 'confidential' ? 95 : 92,
    tags: [doc.category || 'General', doc.sensitivity || 'internal'].filter(Boolean),
    classification,
    desc: doc.ai_summary || `${doc.type || 'File'} — ${doc.category || 'General'}`,
    updated: doc.created_date ? new Date(doc.created_date).toLocaleDateString('fr-FR') : '—',
    starred: false,
  };
}

const FALLBACK = [
  { id: 1, name: 'customer_profiles', type: 'table', source: 'PostgreSQL', owner: 'Data Team', records: 284000, quality: 97.2, tags: ['PII', 'CRM'], classification: 'Confidential', desc: 'Master customer records including demographics.', updated: '2h ago', starred: true },
  { id: 2, name: 'Q2 Sales Reports', type: 'dataset', source: 'Google Drive', owner: 'Finance', records: 4200, quality: 94.8, tags: ['Finance', 'Q2'], classification: 'Internal', desc: 'Quarterly sales performance datasets.', updated: '1 day ago', starred: false },
  { id: 3, name: 'transactions_2026', type: 'table', source: 'MySQL', owner: 'Engineering', records: 1840000, quality: 98.9, tags: ['Finance', 'PCI'], classification: 'Restricted', desc: 'All financial transaction records.', updated: '15m ago', starred: true },
];

export default function DataCatalog() {
  const [search, setSearch]           = useState('');
  const [starred, setStarred]         = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Document.list('-created_date', 100)
      .then(docs => setItems(docs?.length > 0 ? docs.map(mapDocToCatalog) : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = selectedType === 'all' || item.type === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Data Catalog" subtitle="Centralized discovery for all data assets" />

      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search datasets, tables, tags..."
                className="w-full h-9 pl-10 pr-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-white/20" />
            </div>
            <div className="flex items-center gap-2">
              {['all', 'table', 'dataset', 'documents'].map(type => (
                <button key={type} onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                    selectedType === type ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
            <button onClick={() => toast.info("Enregistrement d'asset — bientôt disponible")}
              className="flex items-center gap-2 px-4 h-9 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-medium flex-shrink-0 transition-colors">
              <Plus className="w-4 h-4" /> Register Asset
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className={`${selectedItem ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
              {filtered.length === 0 && (
                <div className="glass rounded-2xl p-10 text-center text-white/30 text-sm">
                  Aucun asset trouvé — uploadez des documents dans le DataHub pour les voir apparaître ici.
                </div>
              )}
              {filtered.map((item, i) => {
                const TypeIcon = typeIcons[item.type] || Database;
                const isStarred = starred[item.id] ?? item.starred;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`glass rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/[0.04] ${
                      selectedItem?.id === item.id ? 'border-white/20' : ''
                    }`}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-medium text-white font-mono">{item.name}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${classificationColors[item.classification]}`}>
                            {item.classification}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mb-2 leading-relaxed line-clamp-2">{item.desc}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs text-white/30">{item.source}</span>
                          {item.records && <span className="text-xs text-white/30">{item.records.toLocaleString()} records</span>}
                          <span className="text-xs text-emerald-400">{item.quality}% quality</span>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); setStarred(s => ({ ...s, [item.id]: !isStarred })); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                          {isStarred
                            ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            : <StarOff className="w-3.5 h-3.5 text-white/30" />}
                        </button>
                        <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${selectedItem?.id === item.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedItem && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-5 h-fit sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium text-sm">Asset Details</h3>
                  <button onClick={() => setSelectedItem(null)} className="text-white/30 hover:text-white text-xs">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Name</p>
                    <p className="text-sm font-mono text-white">{selectedItem.name}</p>
                  </div>
                  {[
                    { label: 'Type',         value: selectedItem.type },
                    { label: 'Source',       value: selectedItem.source },
                    { label: 'Owner',        value: selectedItem.owner },
                    { label: 'Records',      value: selectedItem.records ? selectedItem.records.toLocaleString() : '—' },
                    { label: 'Quality Score',value: `${selectedItem.quality}%` },
                    { label: 'Last Updated', value: selectedItem.updated },
                  ].map(field => (
                    <div key={field.label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-xs text-white/40">{field.label}</span>
                      <span className="text-xs text-white/70 font-medium">{field.value}</span>
                    </div>
                  ))}
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">AI Summary</p>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] text-white/30">AI Generated</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{selectedItem.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => toast.info(`Prévisualisation de ${selectedItem.name}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white text-black hover:bg-white/90 text-xs font-medium transition-colors">
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button onClick={() => toast.info(`Lineage de ${selectedItem.name}`)}
                      className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 text-xs transition-colors">
                      <GitBranch className="w-3 h-3" /> Lineage
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

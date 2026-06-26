import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  BookOpen, Search, Tag, Database, FileText, Table2,
  Brain, Filter, Star, StarOff, ChevronRight, Eye,
  GitBranch, Users, Clock, Plus, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const catalogItems = [
  {
    id: 1, name: 'customer_profiles', type: 'table', source: 'PostgreSQL',
    owner: 'Data Team', records: 284000, quality: 97.2,
    tags: ['PII', 'CRM', 'Customer'], classification: 'Confidential',
    desc: 'Master customer records including demographics and contact information.',
    updated: '2h ago', starred: true
  },
  {
    id: 2, name: 'Q2 Sales Reports', type: 'dataset', source: 'Google Drive',
    owner: 'Finance', records: 4200, quality: 94.8,
    tags: ['Finance', 'Reports', 'Q2'], classification: 'Internal',
    desc: 'Quarterly sales performance datasets aggregated by region and product line.',
    updated: '1 day ago', starred: false
  },
  {
    id: 3, name: 'transactions_2026', type: 'table', source: 'MySQL',
    owner: 'Engineering', records: 1840000, quality: 98.9,
    tags: ['Finance', 'Transactions', 'PCI'], classification: 'Restricted',
    desc: 'All financial transaction records with full audit trail.',
    updated: '15m ago', starred: true
  },
  {
    id: 4, name: 'Contract Archive', type: 'documents', source: 'SharePoint',
    owner: 'Legal', records: 12400, quality: 89.1,
    tags: ['Legal', 'Contracts', 'Signed'], classification: 'Confidential',
    desc: 'Archived contracts and legal agreements with AI-extracted metadata.',
    updated: '3 days ago', starred: false
  },
  {
    id: 5, name: 'product_catalog_v3', type: 'table', source: 'MongoDB',
    owner: 'Product', records: 89000, quality: 95.3,
    tags: ['Products', 'Catalog', 'SKU'], classification: 'Internal',
    desc: 'Comprehensive product catalog with specifications and pricing history.',
    updated: '1h ago', starred: false
  },
  {
    id: 6, name: 'ML Training Dataset — NER', type: 'dataset', source: 'VISION Factory',
    owner: 'AI Team', records: 48200, quality: 98.4,
    tags: ['ML', 'Training', 'NER', 'Annotated'], classification: 'Internal',
    desc: 'Curated named entity recognition dataset with human-validated annotations.',
    updated: '2 days ago', starred: true
  }
];

const typeIcons = {
  table: Table2,
  dataset: Database,
  documents: FileText,
  model: Brain
};

const classificationColors = {
  Public: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Internal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Confidential: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Restricted: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function DataCatalog() {
  const [search, setSearch] = useState('');
  const [starred, setStarred] = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = catalogItems.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = selectedType === 'all' || item.type === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Data Catalog" subtitle="Centralized discovery for all data assets" />

      <div className="p-6">
        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search datasets, tables, tags..."
                className="pl-10 bg-white/5 border-white/10 text-white/80 placeholder:text-white/30" />
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
            <Button onClick={() => toast.success('Formulaire d\'enregistrement ouvert')} className="bg-white text-black hover:bg-white/90 gap-2 h-9 text-sm flex-shrink-0">
              <Plus className="w-4 h-4" /> Register Asset
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Catalog List */}
          <div className={`${selectedItem ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
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
                        <h4 className="text-sm font-medium text-white font-mono-code">{item.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${classificationColors[item.classification]}`}>
                          {item.classification}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mb-2 leading-relaxed">{item.desc}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-white/30">{item.source}</span>
                        <span className="text-xs text-white/30">{item.records.toLocaleString()} records</span>
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

          {/* Detail Panel */}
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
                  { label: 'Type', value: selectedItem.type },
                  { label: 'Source', value: selectedItem.source },
                  { label: 'Owner', value: selectedItem.owner },
                  { label: 'Records', value: selectedItem.records.toLocaleString() },
                  { label: 'Quality Score', value: `${selectedItem.quality}%` },
                  { label: 'Last Updated', value: selectedItem.updated }
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
                  <Button onClick={() => toast.info(`Prévisualisation de ${selectedItem.name}`)} className="flex-1 bg-white text-black hover:bg-white/90 text-xs h-8 gap-1.5">
                    <Eye className="w-3 h-3" /> Preview
                  </Button>
                  <Button onClick={() => toast.info(`Lineage de ${selectedItem.name}`)} variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 text-xs h-8 gap-1.5">
                    <GitBranch className="w-3 h-3" /> Lineage
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
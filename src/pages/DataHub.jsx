import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Upload, Search, Filter, Grid, List, FileText, Image,
  Video, File, MoreVertical, Download, Trash2, Tag,
  Clock, Shield, Sparkles, FolderOpen, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const documents = [
  { id: 1, name: 'Q4 Financial Report 2025.pdf', type: 'pdf', size: '2.4 MB', category: 'Finance', sensitivity: 'confidential', date: '2 hours ago', aiSummary: 'Annual financial overview with revenue growth of 34%' },
  { id: 2, name: 'Customer Analytics Dashboard.xlsx', type: 'spreadsheet', size: '1.8 MB', category: 'Analytics', sensitivity: 'internal', date: '5 hours ago', aiSummary: 'Customer segmentation data with 45K records' },
  { id: 3, name: 'Product Demo Video.mp4', type: 'video', size: '124 MB', category: 'Marketing', sensitivity: 'public', date: '1 day ago', aiSummary: 'New feature demonstration for enterprise clients' },
  { id: 4, name: 'Employee Contracts 2026.zip', type: 'contract', size: '8.2 MB', category: 'HR', sensitivity: 'restricted', date: '2 days ago', aiSummary: '248 employee contracts for review' },
  { id: 5, name: 'Server Infrastructure Logs.json', type: 'other', size: '45 KB', category: 'IT', sensitivity: 'internal', date: '3 days ago', aiSummary: 'AWS infrastructure monitoring data' },
  { id: 6, name: 'Brand Assets Pack.zip', type: 'image', size: '234 MB', category: 'Design', sensitivity: 'public', date: '1 week ago', aiSummary: 'Company logo variations and brand guidelines' },
];

const categories = ['All', 'Finance', 'Analytics', 'Marketing', 'HR', 'IT', 'Design'];

const typeIcons = {
  pdf: FileText,
  spreadsheet: File,
  video: Video,
  image: Image,
  contract: FileText,
  other: File
};

const sensitivityColors = {
  public: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  internal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confidential: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  restricted: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function DataHub() {
  const [view, setView] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [docs, setDocs] = useState(documents);
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      toast.success(`${files.length} fichier${files.length > 1 ? 's importés' : ' importé'} avec succès`);
      e.target.value = '';
    }
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setOpenMenu(null);
    toast.success('Fichier supprimé');
  };

  const filteredDocs = activeCategory === 'All'
    ? docs
    : docs.filter(d => d.category === activeCategory);

  const visibleDocs = searchQuery.trim()
    ? filteredDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredDocs;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Universal Data Hub" 
        subtitle="Centralized data management" 
      />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: '248,392', icon: FileText },
            { label: 'Contracts Detected', value: '1,248', icon: Shield },
            { label: 'Duplicates Removed', value: '421', icon: Trash2 },
            { label: 'AI Categorized', value: '98.2%', icon: Sparkles }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <stat.icon className="w-5 h-5 text-white/40 mb-2" />
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Search documents with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat 
                      ? 'bg-white text-black' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                {view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-black hover:bg-white/90 gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
            </div>
          </div>
        </motion.div>

        {/* Click outside to close menu */}
        {openMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
        )}

        {/* Documents Grid */}
        <div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {visibleDocs.map((doc, i) => {
            const Icon = typeIcons[doc.type] || File;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="relative z-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === doc.id ? null : doc.id); }}
                      className="text-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === doc.id && (
                      <div className="absolute right-0 top-7 glass rounded-xl p-1 min-w-[150px] border border-white/10 shadow-xl">
                        <button
                          onClick={() => { toast.success(`Téléchargement de ${doc.name}`); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Télécharger
                        </button>
                        <button
                          onClick={() => { toast.success('Tag appliqué'); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Tag className="w-3.5 h-3.5" /> Ajouter un tag
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-medium text-white/90 mb-2 truncate">{doc.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-[10px] ${sensitivityColors[doc.sensitivity]}`}>
                    {doc.sensitivity}
                  </Badge>
                  <span className="text-[10px] text-white/30">{doc.size}</span>
                </div>

                <p className="text-xs text-white/40 mb-4 line-clamp-2">{doc.aiSummary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                    <Clock className="w-3 h-3" />
                    {doc.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                    <FolderOpen className="w-3 h-3" />
                    {doc.category}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => fileInputRef.current?.click()}
            className="glass rounded-xl p-5 border-2 border-dashed border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
              <Plus className="w-6 h-6 text-white/40" />
            </div>
            <p className="text-sm text-white/50">Drag & drop files</p>
            <p className="text-xs text-white/30 mt-1">or click to upload</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
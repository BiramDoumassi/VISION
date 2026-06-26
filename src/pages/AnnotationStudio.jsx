import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Tag, Type, Image, FileAudio, Video, FileText,
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Users, Layers, Zap, BarChart3, Plus, Clock, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const dataTypes = [
  { id: 'text', icon: Type, label: 'Text', count: 12840 },
  { id: 'image', icon: Image, label: 'Image', count: 4210 },
  { id: 'audio', icon: FileAudio, label: 'Audio', count: 892 },
  { id: 'video', icon: Video, label: 'Video', count: 234 },
  { id: 'document', icon: FileText, label: 'Document', count: 6710 }
];

const sampleTexts = [
  {
    id: 1,
    content: "Le client Alpha Corp a signé un contrat de 2,4M€ pour la migration cloud de leur infrastructure SAP vers AWS. La livraison est prévue pour Q3 2026.",
    entities: [
      { text: 'Alpha Corp', type: 'COMPANY', start: 10, end: 20 },
      { text: '2,4M€', type: 'AMOUNT', start: 42, end: 47 },
      { text: 'SAP', type: 'PRODUCT', start: 82, end: 85 },
      { text: 'AWS', type: 'PRODUCT', start: 91, end: 94 },
      { text: 'Q3 2026', type: 'DATE', start: 128, end: 135 }
    ],
    status: 'pending'
  },
  {
    id: 2,
    content: "Rapport trimestriel: les revenus ont augmenté de 23% par rapport au T1. Les marchés EMEA et APAC montrent une croissance significative.",
    entities: [],
    status: 'pending'
  }
];

const labelTypes = [
  { type: 'COMPANY', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { type: 'PERSON', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { type: 'AMOUNT', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { type: 'DATE', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { type: 'PRODUCT', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { type: 'LOCATION', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { type: 'RISK', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
];

const projects = [
  { name: 'Contract Classification', progress: 68, total: 12000, done: 8160, annotators: 4, type: 'text' },
  { name: 'Invoice Data Extraction', progress: 41, total: 5400, done: 2214, annotators: 2, type: 'document' },
  { name: 'Product Image Labeling', progress: 89, total: 3200, done: 2848, annotators: 6, type: 'image' },
  { name: 'Customer Sentiment Audio', progress: 15, total: 800, done: 120, annotators: 3, type: 'audio' }
];

export default function AnnotationStudio() {
  const [activeType, setActiveType] = useState('text');
  const [currentItem, setCurrentItem] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState('COMPANY');
  const [activeTab, setActiveTab] = useState('studio');
  const item = sampleTexts[currentItem];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Annotation Studio" subtitle="Human-in-the-loop data labeling" />

      <div className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { id: 'studio', label: 'Studio' },
            { id: 'projects', label: 'Projects' },
            { id: 'quality', label: 'Quality' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id ? 'bg-white text-black font-medium' : 'text-white/50 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'studio' && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Data Type Selector */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Data Type</p>
              <div className="space-y-1">
                {dataTypes.map(dt => (
                  <button key={dt.id} onClick={() => setActiveType(dt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeType === dt.id ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}>
                    <dt.icon className="w-4 h-4" />
                    <span className="flex-1 text-sm text-left">{dt.label}</span>
                    <span className="text-[10px] text-white/30">{dt.count.toLocaleString()}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Labels</p>
                <div className="space-y-1.5">
                  {labelTypes.map(lt => (
                    <button key={lt.type} onClick={() => setSelectedLabel(lt.type)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border transition-all text-left ${lt.color} ${selectedLabel === lt.type ? 'ring-1 ring-white/20' : ''}`}>
                      {lt.type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Annotation Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Item {currentItem + 1} of {sampleTexts.length}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                      Pending Review
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentItem(Math.max(0, currentItem - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-white/50" />
                    </button>
                    <button onClick={() => setCurrentItem(Math.min(sampleTexts.length - 1, currentItem + 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
                  <p className="text-sm text-white/80 leading-relaxed">{item.content}</p>
                </div>

                {/* Detected Entities */}
                {item.entities.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2">AI-Detected Entities</p>
                    <div className="flex flex-wrap gap-2">
                      {item.entities.map((entity, i) => {
                        const label = labelTypes.find(l => l.type === entity.type);
                        return (
                          <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${label?.color}`}>
                            <span className="font-medium">{entity.text}</span>
                            <span className="opacity-60">{entity.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400">AI Suggestion</span>
                  </div>
                  <p className="text-xs text-white/50">Select text in the document and apply a label. AI has pre-labeled {item.entities.length} entities for review.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentItem(prev => Math.min(sampleTexts.length - 1, prev + 1));
                    toast.success('Annotation approuvée');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve & Next
                </button>
                <button
                  onClick={() => toast.error('Annotation rejetée')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => toast.warning('Item signalé pour révision')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 text-sm transition-colors"
                >
                  <Flag className="w-4 h-4" /> Flag
                </button>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Session Stats</p>
                {[
                  { label: 'Annotated', value: '847', icon: CheckCircle, color: 'text-emerald-400' },
                  { label: 'Pending', value: '2,341', icon: Clock, color: 'text-amber-400' },
                  { label: 'Flagged', value: '23', icon: Flag, color: 'text-red-400' },
                  { label: 'Agreement Rate', value: '94.2%', icon: Users, color: 'text-blue-400' }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-xs text-white/50">{stat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Active Annotators</p>
                {['Marie D.', 'Thomas R.', 'Sophie L.'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                      {name[0]}
                    </div>
                    <span className="text-xs text-white/60 flex-1">{name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Annotation Projects</h3>
              <Button className="bg-white text-black hover:bg-white/90 gap-2 h-8 text-xs">
                <Plus className="w-3 h-3" /> New Project
              </Button>
            </div>
            {projects.map((project, i) => (
              <motion.div key={project.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">{project.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{project.done.toLocaleString()} / {project.total.toLocaleString()} items</span>
                      <span className="text-xs text-white/40">·</span>
                      <span className="text-xs text-white/40">{project.annotators} annotators</span>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-white font-space">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-white rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Inter-annotator Agreement', value: '94.2%', desc: 'Average agreement between annotators', status: 'good' },
              { label: 'Label Consistency', value: '97.8%', desc: 'Consistency of labels across sessions', status: 'good' },
              { label: 'Review Coverage', value: '82.1%', desc: 'Percentage of items reviewed by 2+ annotators', status: 'warning' }
            ].map((metric, i) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                <div className={`w-3 h-3 rounded-full mb-4 ${metric.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <p className="text-2xl font-semibold text-white font-space mb-1">{metric.value}</p>
                <p className="text-sm text-white/70 font-medium">{metric.label}</p>
                <p className="text-xs text-white/40 mt-2">{metric.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
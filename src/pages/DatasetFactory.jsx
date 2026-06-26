import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Factory, Database, Sparkles, CheckCircle, Download,
  Plus, ArrowRight, FileText, Zap, Brain, Package,
  BarChart3, Clock, Play, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const exportFormats = [
  { id: 'jsonl', label: 'JSONL', desc: 'Standard fine-tuning format', icon: '{}' },
  { id: 'csv', label: 'CSV', desc: 'Spreadsheet compatible', icon: '📊' },
  { id: 'parquet', label: 'Parquet', desc: 'Columnar storage format', icon: '🗂' },
  { id: 'hf', label: 'HuggingFace', desc: 'Ready for HF Hub upload', icon: '🤗' },
  { id: 'openai', label: 'OpenAI Fine-Tune', desc: 'GPT-4 / GPT-3.5 format', icon: '⚡' },
  { id: 'anthropic', label: 'Anthropic', desc: 'Claude training format', icon: '🔶' },
  { id: 'gemini', label: 'Gemini', desc: 'Google AI format', icon: '💎' },
  { id: 'llama', label: 'Llama', desc: 'Meta open-source format', icon: '🦙' }
];

const datasets = [
  {
    id: 1, name: 'Customer Support Q&A', records: 48200, quality: 96.4,
    status: 'ready', formats: ['jsonl', 'openai', 'hf'], size: '2.4 GB',
    pipeline: ['collected', 'cleaned', 'annotated', 'validated']
  },
  {
    id: 2, name: 'Contract Classification', records: 12800, quality: 98.1,
    status: 'processing', formats: ['jsonl', 'anthropic'], size: '890 MB',
    pipeline: ['collected', 'cleaned', 'annotating', 'pending']
  },
  {
    id: 3, name: 'Financial Report Analysis', records: 7400, quality: 94.7,
    status: 'annotation', formats: ['parquet', 'csv'], size: '1.1 GB',
    pipeline: ['collected', 'cleaned', 'processing', 'pending']
  },
  {
    id: 4, name: 'Product Catalog Enrichment', records: 89000, quality: 92.3,
    status: 'ready', formats: ['csv', 'jsonl', 'parquet'], size: '5.2 GB',
    pipeline: ['collected', 'cleaned', 'annotated', 'validated']
  }
];

const pipelineSteps = [
  { id: 'collect', label: 'Collect', icon: Database, desc: 'Ingest from sources' },
  { id: 'clean', label: 'Clean', icon: Zap, desc: 'Remove noise & duplicates' },
  { id: 'enrich', label: 'Enrich', icon: Sparkles, desc: 'AI enhancement' },
  { id: 'annotate', label: 'Annotate', icon: Brain, desc: 'Human labeling' },
  { id: 'validate', label: 'Validate', icon: CheckCircle, desc: 'Quality checks' },
  { id: 'export', label: 'Export', icon: Download, desc: 'Output formats' }
];

const statusConfig = {
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  processing: { label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  annotation: { label: 'Annotating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
};

export default function DatasetFactory() {
  const [selectedFormat, setSelectedFormat] = useState('jsonl');
  const [expandedDataset, setExpandedDataset] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="AI Dataset Factory" subtitle="Build production-ready datasets for AI training" />

      <div className="p-6">
        {/* Pipeline Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-medium">Data Pipeline</h3>
              <p className="text-xs text-white/40 mt-0.5">End-to-end dataset preparation workflow</p>
            </div>
            <Button className="bg-white text-black hover:bg-white/90 gap-2">
              <Plus className="w-4 h-4" /> New Dataset
            </Button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pipelineSteps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 min-w-[100px]">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white/50" />
                  </div>
                  <p className="text-sm font-medium text-white">{step.label}</p>
                  <p className="text-[10px] text-white/30 text-center">{step.desc}</p>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Datasets List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white font-medium">Active Datasets</h3>
            {datasets.map((ds, i) => {
              const s = statusConfig[ds.status];
              const isExpanded = expandedDataset === ds.id;
              return (
                <motion.div key={ds.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-white font-medium">{ds.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>{s.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>{ds.records.toLocaleString()} records</span>
                        <span>{ds.size}</span>
                        <span className="text-emerald-400">{ds.quality}% quality</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedDataset(isExpanded ? null : ds.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </button>
                  </div>

                  {/* Pipeline progress */}
                  <div className="flex items-center gap-1 mb-3">
                    {ds.pipeline.map((step, si) => (
                      <div key={si} className="flex items-center gap-1 flex-1">
                        <div className={`h-1 flex-1 rounded-full ${
                          step === 'collected' || step === 'cleaned' || step === 'annotated' || step === 'validated'
                            ? 'bg-emerald-500' : step.includes('ing') || step === 'processing'
                            ? 'bg-blue-500 animate-pulse' : 'bg-white/10'
                        }`} />
                      </div>
                    ))}
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <p className="text-xs text-white/40 w-full">Available Export Formats:</p>
                        {exportFormats.filter(f => ds.formats.includes(f.id)).map(fmt => (
                          <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              selectedFormat === fmt.id
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                            }`}>
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const sample = [{ prompt: 'Example input', completion: 'Example output' }];
                            const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${ds.name.replace(/\s+/g, '_')}.${selectedFormat}`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success(`"${ds.name}" exporté en ${selectedFormat.toUpperCase()}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 text-xs transition-colors"
                        >
                          <Download className="w-3 h-3" /> Export Dataset
                        </button>
                        <button
                          onClick={() => {
                            toast.loading(`Pipeline en cours pour "${ds.name}"...`, { id: `pl-${ds.id}` });
                            setTimeout(() => toast.success(`Pipeline "${ds.name}" terminé`, { id: `pl-${ds.id}` }), 3000);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs transition-colors"
                        >
                          <Play className="w-3 h-3" /> Run Pipeline
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Export Formats */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-medium mb-4">Export Formats</h3>
              <div className="space-y-2">
                {exportFormats.map(fmt => (
                  <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      selectedFormat === fmt.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                    }`}>
                    <span className="text-lg leading-none">{fmt.icon}</span>
                    <div>
                      <p className="text-sm text-white">{fmt.label}</p>
                      <p className="text-[10px] text-white/30">{fmt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-medium mb-3">Factory Stats</h3>
              {[
                { label: 'Total Records', value: '157K' },
                { label: 'Datasets Ready', value: '2' },
                { label: 'Avg Quality', value: '95.4%' },
                { label: 'Storage Used', value: '9.6 GB' }
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/40">{stat.label}</span>
                  <span className="text-sm font-medium text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
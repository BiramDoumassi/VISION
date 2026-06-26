import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  FileText, Download, Plus, Calendar, Clock, BarChart3,
  TrendingUp, Shield, Database, Zap, CheckCircle,
  Play, Settings, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const reportTemplates = [
  { id: 'data-quality', name: 'Data Quality Report', icon: Zap, desc: 'Complete data health analysis', category: 'Data' },
  { id: 'governance', name: 'Governance Report', icon: Shield, desc: 'Compliance and policy status', category: 'Compliance' },
  { id: 'pipeline', name: 'Pipeline Performance', icon: BarChart3, desc: 'ETL metrics and throughput', category: 'Operations' },
  { id: 'security', name: 'Security Audit Report', icon: Shield, desc: 'Security posture and incidents', category: 'Security' },
  { id: 'ai-usage', name: 'AI Usage Analytics', icon: Sparkles, desc: 'Model usage, queries, costs', category: 'AI' },
  { id: 'executive', name: 'Executive Summary', icon: TrendingUp, desc: 'High-level KPIs for leadership', category: 'Business' }
];

const exportFormats = ['PDF', 'Excel', 'CSV', 'PowerPoint'];

const scheduledReports = [
  { name: 'Weekly Data Quality', schedule: 'Every Monday 09:00', format: 'PDF', recipients: 3, last: '2 days ago', status: 'active' },
  { name: 'Monthly Compliance', schedule: '1st of month 08:00', format: 'PDF', recipients: 5, last: '12 days ago', status: 'active' },
  { name: 'Daily Pipeline Health', schedule: 'Every day 06:00', format: 'Excel', recipients: 2, last: 'Today 06:00', status: 'active' },
  { name: 'Quarterly Executive', schedule: 'Quarterly', format: 'PowerPoint', recipients: 8, last: '2 months ago', status: 'paused' }
];

const recentReports = [
  { name: 'Data Quality - June 2026', type: 'data-quality', generated: '1h ago', size: '2.4 MB', format: 'PDF' },
  { name: 'Security Audit Q2 2026', type: 'security', generated: '3h ago', size: '1.8 MB', format: 'PDF' },
  { name: 'Pipeline Performance - Week 24', type: 'pipeline', generated: 'Yesterday', size: '890 KB', format: 'Excel' },
  { name: 'AI Usage Analytics May 2026', type: 'ai-usage', generated: '2 days ago', size: '3.1 MB', format: 'PDF' },
  { name: 'Executive Summary Q1 2026', type: 'executive', generated: '2 months ago', size: '4.2 MB', format: 'PowerPoint' }
];

export default function ReportingCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    setGenerated(true);
    toast.success(`${selectedTemplate.name} généré — prêt à télécharger`);
    setTimeout(() => setGenerated(false), 3000);
  };

  const handleDownload = (report) => {
    const content = `VISION AI — ${report.name}\nGénéré le ${new Date().toLocaleDateString('fr-FR')}\n\nRapport de démonstration.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${report.name} téléchargé`);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Reporting Center" subtitle="Automated enterprise reporting & exports" />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4">Report Templates</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {reportTemplates.map((tpl, i) => (
                  <motion.button key={tpl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === tpl.id ? null : tpl)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate?.id === tpl.id
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}>
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <tpl.icon className="w-4 h-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tpl.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{tpl.desc}</p>
                      <span className="text-[10px] text-white/30 mt-1 inline-block">{tpl.category}</span>
                    </div>
                    {selectedTemplate?.id === tpl.id && (
                      <CheckCircle className="w-4 h-4 text-white ml-auto flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>

              {selectedTemplate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40 mb-3">Export Format</p>
                  <div className="flex gap-2 mb-4">
                    {exportFormats.map(fmt => (
                      <button key={fmt} onClick={() => setSelectedFormat(fmt)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          selectedFormat === fmt
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                        }`}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <Button onClick={handleGenerate} disabled={isGenerating}
                    className="bg-white text-black hover:bg-white/90 gap-2">
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : generated ? (
                      <><CheckCircle className="w-4 h-4" /> Report Ready!</>
                    ) : (
                      <><Play className="w-4 h-4" /> Generate {selectedTemplate.name}</>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Recent Reports */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {recentReports.map((report, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{report.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-white/30">{report.generated}</span>
                        <span className="text-xs text-white/30">{report.size}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{report.format}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(report)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-white/60" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Scheduled Reports */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Scheduled Reports</h3>
                <button className="text-xs text-white/40 hover:text-white transition-colors">+ Add</button>
              </div>
              <div className="space-y-3">
                {scheduledReports.map((report, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-medium text-white/80">{report.name}</p>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${report.status === 'active' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-[10px] text-white/40">{report.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-white/30">{report.format} · {report.recipients} recipients</span>
                      <span className="text-[10px] text-white/20">Last: {report.last}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5">
              <h3 className="text-white font-medium mb-3">Quick Stats</h3>
              {[
                { label: 'Reports Generated', value: '847', icon: FileText },
                { label: 'Scheduled Active', value: '3', icon: Calendar },
                { label: 'Avg Generation', value: '2.4s', icon: Clock },
                { label: 'Total Downloads', value: '2,341', icon: Download }
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs text-white/40">{stat.label}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{stat.value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
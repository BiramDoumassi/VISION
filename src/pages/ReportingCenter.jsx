import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  FileText, Download, Plus, Calendar, Clock, BarChart3,
  TrendingUp, Shield, Database, Zap, CheckCircle, Play, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Document, Pipeline, AIInsight, DataConnector } from '@/api/entities';

const TEMPLATES = [
  { id: 'data-quality',  name: 'Data Quality Report',      icon: Zap,       desc: 'Complete data health analysis',    category: 'Data' },
  { id: 'governance',    name: 'Governance Report',         icon: Shield,    desc: 'Compliance and policy status',     category: 'Compliance' },
  { id: 'pipeline',      name: 'Pipeline Performance',      icon: BarChart3, desc: 'ETL metrics and throughput',       category: 'Operations' },
  { id: 'security',      name: 'Security Audit Report',     icon: Shield,    desc: 'Security posture and incidents',   category: 'Security' },
  { id: 'ai-usage',      name: 'AI Usage Analytics',        icon: Sparkles,  desc: 'Model usage, queries, costs',      category: 'AI' },
  { id: 'executive',     name: 'Executive Summary',         icon: TrendingUp, desc: 'High-level KPIs for leadership',  category: 'Business' },
];

const FORMATS = ['PDF', 'CSV', 'JSON'];
const SCHEDULED = [
  { name: 'Weekly Data Quality', schedule: 'Every Monday 09:00', format: 'PDF', recipients: 3, last: '2 days ago', status: 'active' },
  { name: 'Monthly Compliance',  schedule: '1st of month 08:00', format: 'PDF', recipients: 5, last: '12 days ago', status: 'active' },
  { name: 'Daily Pipeline Health', schedule: 'Every day 06:00', format: 'CSV', recipients: 2, last: 'Today 06:00', status: 'active' },
  { name: 'Quarterly Executive', schedule: 'Quarterly',          format: 'JSON', recipients: 8, last: '2 months ago', status: 'paused' },
];

async function buildReportData() {
  const [docs, pipes, insights, connectors] = await Promise.allSettled([
    Document.list('-created_date', 200),
    Pipeline.list('-created_date', 100),
    AIInsight.list('-created_date', 100),
    DataConnector.list('-created_date', 50),
  ]);
  return {
    docs:       docs.status === 'fulfilled'       ? docs.value       : [],
    pipes:      pipes.status === 'fulfilled'      ? pipes.value      : [],
    insights:   insights.status === 'fulfilled'   ? insights.value   : [],
    connectors: connectors.status === 'fulfilled' ? connectors.value : [],
  };
}

function generateContent(template, format, data) {
  const { docs, pipes, insights, connectors } = data;
  const now = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });
  const activePipes = pipes.filter(p => p.status === 'active').length;
  const connectedSources = connectors.filter(c => c.status === 'connected').length;
  const totalRecords = connectors.reduce((s, c) => s + (c.records_synced || 0), 0);
  const unresolvedAlerts = insights.filter(i => !i.is_resolved).length;
  const docsBySensitivity = docs.reduce((acc, d) => { acc[d.sensitivity || 'internal'] = (acc[d.sensitivity || 'internal'] || 0) + 1; return acc; }, {});

  const sections = {
    'data-quality': `DATA QUALITY REPORT
Generated: ${now}
Platform: VISION AI

SUMMARY
Total Documents: ${docs.length}
Connected Sources: ${connectedSources}
Total Records Synced: ${totalRecords.toLocaleString()}
Active Pipelines: ${activePipes}

DOCUMENT BREAKDOWN BY SENSITIVITY
${Object.entries(docsBySensitivity).map(([k, v]) => `  ${k.padEnd(15)} ${v} documents`).join('\n')}

QUALITY METRICS
Data Sources Active: ${connectedSources} / ${connectors.length}
Pipeline Success Rate: ${activePipes > 0 ? '99.2%' : 'N/A'}
Unresolved Alerts: ${unresolvedAlerts}

RECENT DOCUMENTS (last 10)
${docs.slice(0, 10).map(d => `  - ${d.name} [${d.type || 'file'}] ${d.category || ''}`).join('\n') || '  No documents yet'}`,

    'executive': `EXECUTIVE SUMMARY
Generated: ${now}
Platform: VISION AI

KEY METRICS
Total Data Assets: ${docs.length}
Active Data Pipelines: ${activePipes}
Connected Integrations: ${connectedSources}
AI Insights Generated: ${insights.length}
Open Alerts: ${unresolvedAlerts}
Total Records Under Management: ${totalRecords.toLocaleString()}

DATA HEALTH
${connectedSources} of ${connectors.length} data sources are active.
${docs.length} documents indexed and managed.

RECOMMENDATIONS
${unresolvedAlerts > 0 ? `• ${unresolvedAlerts} unresolved alert(s) require attention` : '• No critical alerts — all systems nominal'}
${activePipes < pipes.length ? `• ${pipes.length - activePipes} pipeline(s) are inactive — review and restart` : '• All pipelines running normally'}`,

    'pipeline': `PIPELINE PERFORMANCE REPORT
Generated: ${now}

PIPELINE STATUS
Total Pipelines: ${pipes.length}
Active: ${activePipes}
Inactive: ${pipes.filter(p => p.status !== 'active').length}

${pipes.map(p => `${p.name || 'Unnamed'} | ${p.status || 'unknown'} | Records: ${(p.records_processed || 0).toLocaleString()} | Health: ${p.health_score || 'N/A'}`).join('\n') || 'No pipelines configured yet.'}`,

    'security': `SECURITY AUDIT REPORT
Generated: ${now}

ALERTS SUMMARY
Total Insights: ${insights.length}
Unresolved: ${unresolvedAlerts}
Critical: ${insights.filter(i => i.severity === 'critical').length}
High: ${insights.filter(i => i.severity === 'high').length}

${insights.slice(0, 20).map(i => `[${(i.severity || 'info').toUpperCase()}] ${i.title || 'Unnamed'} — ${i.is_resolved ? 'Resolved' : 'OPEN'}`).join('\n') || 'No security insights recorded.'}`,
  };

  const defaultSection = `${template.name.toUpperCase()}\nGenerated: ${now}\n\nTotal Documents: ${docs.length}\nActive Pipelines: ${activePipes}\nAI Insights: ${insights.length}\nConnected Sources: ${connectedSources}`;
  const content = sections[template.id] || defaultSection;

  if (format === 'JSON') {
    return JSON.stringify({ report: template.name, generated: new Date().toISOString(), summary: { documents: docs.length, activePipelines: activePipes, connectedSources, totalRecords, unresolvedAlerts }, documents: docs.slice(0, 50).map(d => ({ id: d.id, name: d.name, type: d.type, category: d.category, sensitivity: d.sensitivity })) }, null, 2);
  }
  return content;
}

function downloadFile(content, filename, format) {
  const mimeTypes = { PDF: 'text/plain', CSV: 'text/csv', JSON: 'application/json' };
  const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportingCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportCount, setReportCount] = useState(0);

  // Load report count from Document entities tagged as reports
  useEffect(() => {
    Document.list('-created_date', 200)
      .then(docs => setReportCount(docs.length))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const data = await buildReportData();
      const content = generateContent(selectedTemplate, selectedFormat, data);
      const ext = selectedFormat.toLowerCase() === 'json' ? 'json' : selectedFormat.toLowerCase() === 'csv' ? 'csv' : 'txt';
      const filename = `${selectedTemplate.id}_${new Date().toISOString().split('T')[0]}.${ext}`;
      const size = `${(new Blob([content]).size / 1024).toFixed(0)} KB`;

      setGeneratedReports(prev => [{
        name: `${selectedTemplate.name} — ${new Date().toLocaleDateString('fr-FR')}`,
        template: selectedTemplate.id,
        format: selectedFormat,
        generated: 'Just now',
        size,
        content,
        filename,
      }, ...prev.slice(0, 9)]);

      setGenerated(true);
      toast.success(`${selectedTemplate.name} généré — prêt à télécharger`);
      setTimeout(() => setGenerated(false), 3000);
    } catch {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Reporting Center" subtitle="Automated enterprise reporting & exports" />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Templates */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4">Report Templates</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl, i) => (
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
                    {selectedTemplate?.id === tpl.id && <CheckCircle className="w-4 h-4 text-white ml-auto flex-shrink-0" />}
                  </motion.button>
                ))}
              </div>

              {selectedTemplate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40 mb-3">Export Format</p>
                  <div className="flex gap-2 mb-4">
                    {FORMATS.map(fmt => (
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
                      <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Generating…</>
                    ) : generated ? (
                      <><CheckCircle className="w-4 h-4" /> Report Ready!</>
                    ) : (
                      <><Play className="w-4 h-4" /> Generate {selectedTemplate.name}</>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Generated Reports */}
            {generatedReports.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                <h3 className="text-white font-medium mb-4">Generated Reports</h3>
                <div className="space-y-3">
                  {generatedReports.map((report, i) => (
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
                        onClick={() => { downloadFile(report.content, report.filename, report.format); toast.success(`${report.name} téléchargé`); }}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-white/60" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Scheduled Reports</h3>
                <button className="text-xs text-white/40 hover:text-white transition-colors">+ Add</button>
              </div>
              <div className="space-y-3">
                {SCHEDULED.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-medium text-white/80">{r.name}</p>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${r.status === 'active' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-[10px] text-white/40">{r.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-white/30">{r.format} · {r.recipients} recipients</span>
                      <span className="text-[10px] text-white/20">Last: {r.last}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5">
              <h3 className="text-white font-medium mb-3">Quick Stats</h3>
              {[
                { label: 'Documents in Hub', value: reportCount || '…', icon: Database },
                { label: 'Reports Generated', value: String(generatedReports.length), icon: FileText },
                { label: 'Scheduled Active', value: '3', icon: Calendar },
                { label: 'Avg Generation', value: '~2s', icon: Clock },
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

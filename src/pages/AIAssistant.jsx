import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Send, Mic, Paperclip,
  Code, FileText, Database, BarChart3,
  ChevronRight, Copy, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import { toast } from 'sonner';

const generateAIResponse = (input) => {
  const q = input.toLowerCase();
  if (q.includes('sales') || q.includes('ventes') || q.includes('revenue') || q.includes('chiffre')) {
    return `### Analyse des Ventes\n\nJ'ai analysé vos données de ventes dans PostgreSQL.\n\n**Résultats clés :**\n- **Croissance** : +23% sur la période\n- **Meilleure région** : EMEA avec 42% du total\n- **Produit phare** : Catégorie A → 35% du CA\n\n**Recommandations :**\n1. Renforcer la présence APAC (+18% de potentiel)\n2. Automatiser les rapports KPI hebdomadaires\n3. Croiser avec CRM pour identifier les opportunités\n\nVoulez-vous un rapport détaillé ou une visualisation ?`;
  }
  if (q.includes('client') || q.includes('customer') || q.includes('churn')) {
    return `### Analyse Client\n\n**Métriques clés :**\n- **Clients actifs** : 12,847\n- **Taux de rétention** : 91.3%\n- **Churn rate** : 8.7% (↓ 2.1% vs mois précédent)\n\n**Segments identifiés :**\n1. **Champions** (23%) — haute valeur, faible risque\n2. **En danger** (12%) — engagement décroissant\n3. **Nouveaux** (18%) — onboarding en cours\n\nSouhaitez-vous un plan d'action anti-churn ?`;
  }
  if (q.includes('sécurité') || q.includes('security') || q.includes('threat')) {
    return `### Rapport Sécurité\n\n**État actuel :**\n- **Score** : 94.7/100 ✅\n- **Accès bloqués** : 1,247 (24h)\n- **Vulnérabilités critiques** : 0\n- **Patches en attente** : 3 (priorité moyenne)\n\n**Alertes récentes :**\n1. Accès inhabituel IP 192.168.1.45 — bloqué\n2. Brute force API — mitigé\n3. Certificat SSL — renouvellement dans 30j\n\nLancer un audit complet ?`;
  }
  if (q.includes('pipeline') || q.includes('etl') || q.includes('données') || q.includes('data')) {
    return `### Statut des Pipelines\n\n**Performance globale :**\n- **Débit** : 2.4 GB/h\n- **Taux de succès** : 99.2%\n- **Latence P99** : 847ms\n\n**Pipelines actifs :**\n\n| Pipeline | Status | Records/h |\n|---|---|---|\n| Salesforce → PG | ✅ | 12,400 |\n| S3 → DataHub | ✅ | 89,200 |\n| MongoDB Sync | ⚠️ | 3,100 |\n\nOptimiser MongoDB pour +40% de performance ?`;
  }
  return `### Analyse : "${input}"\n\n**Résultats :**\n- **Pertinence** : 94.2%\n- **Sources analysées** : 3 bases, 12,847 documents\n- **Anomalies** : 3 patterns signalés\n\n**Insights IA :**\n1. Tendance +23% sur la période analysée\n2. Corrélation forte avec les données EMEA\n3. Recommandation : croiser avec les données client\n\nVoulez-vous approfondir ou générer un rapport ?`;
};

const suggestedPrompts = [
  { icon: Database, label: 'Query sales data', prompt: 'Show me total sales by region for Q4 2025' },
  { icon: BarChart3, label: 'Generate report', prompt: 'Generate a summary report of customer acquisition' },
  { icon: FileText, label: 'Analyze document', prompt: 'Summarize the key points from the latest contract' },
  { icon: Code, label: 'Build pipeline', prompt: 'Help me create a data pipeline from Salesforce to PostgreSQL' }
];

const initialMessages = [
  {
    role: 'assistant',
    content: `# Welcome to DOUMASSI AI Assistant

I'm your intelligent data companion. I can help you:

- **Query and analyze** your enterprise data using natural language
- **Generate insights** and visualizations automatically  
- **Build pipelines** and automate workflows
- **Search and explore** your knowledge graph

What would you like to work on today?`
  }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage = { role: 'assistant', content: generateAIResponse(input) };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Header 
        title="AI Assistant" 
        subtitle="Your intelligent data companion" 
      />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <DoumassiLogo className="h-5 w-auto" />
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-4 ${
                  message.role === 'user' 
                    ? 'bg-white text-black' 
                    : 'glass border border-white/10'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copié dans le presse-papier'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button
                      onClick={() => toast.info('Régénération en cours...')}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <DoumassiLogo className="h-5 w-auto" />
              <div className="glass rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-white/40">Analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 mb-4"
          >
            {suggestedPrompts.map((item, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(item.prompt)}
                className="flex items-center gap-3 p-4 rounded-xl glass border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-left group"
              >
                <item.icon className="w-5 h-5 text-white/40 group-hover:text-white/70" />
                <span className="text-sm text-white/60 group-hover:text-white/90">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/50" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 border border-white/10"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask anything about your data..."
                className="w-full bg-transparent border-none resize-none text-white placeholder:text-white/30 text-sm focus:outline-none min-h-[44px] max-h-32"
                rows={1}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) toast.success(`Fichier joint : ${f.name}`);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => toast.info('Microphone non disponible dans cette démo')}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-white text-black hover:bg-white/90 h-9 w-9 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
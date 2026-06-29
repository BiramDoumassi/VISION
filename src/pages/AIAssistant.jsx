import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Send, Mic, Paperclip,
  Code, FileText, Database, BarChart3,
  ChevronRight, Copy, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

// Name of the agent configured in your base44 dashboard
const AGENT_NAME = import.meta.env.VITE_BASE44_AGENT_NAME || 'vision_assistant';

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: `# Welcome to DOUMASSI AI Assistant

I'm your intelligent data companion powered by Doumassi AI. I can help you:

- **Query and analyze** your enterprise data using natural language
- **Generate insights** and visualizations automatically
- **Build pipelines** and automate workflows
- **Search and explore** your knowledge graph

What would you like to work on today?`
};

const suggestedPrompts = [
  { icon: Database, label: 'Query sales data', prompt: 'Show me total sales by region for Q4 2025' },
  { icon: BarChart3, label: 'Generate report', prompt: 'Generate a summary report of customer acquisition' },
  { icon: FileText, label: 'Analyze document', prompt: 'Summarize the key points from the latest contract' },
  { icon: Code, label: 'Build pipeline', prompt: 'Help me create a data pipeline from Salesforce to PostgreSQL' }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conv, setConv] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    base44.agents.createConversation({ agent_name: AGENT_NAME })
      .then(conversation => {
        if (cancelled) return;
        setConv(conversation);

        unsubRef.current = base44.agents.subscribeToConversation(
          conversation.id,
          updatedConv => {
            const msgs = updatedConv.messages
              .filter(m => !m.hidden && (m.role === 'user' || m.role === 'assistant'))
              .map(m => ({
                id: m.id,
                role: m.role,
                content: typeof m.content === 'string' ? m.content : '',
              }))
              .filter(m => m.content.trim());

            setMessages([WELCOME, ...msgs]);

            const last = msgs[msgs.length - 1];
            if (last?.role === 'assistant') setIsLoading(false);
          }
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    // Optimistic user message
    setMessages(prev => [...prev, { id: 'pending', role: 'user', content: text }]);

    if (!conv) {
      // No agent — show error
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== 'pending'),
          { id: 'err', role: 'assistant', content: "⚠️ L'agent IA n'est pas encore configuré dans base44. Crée un agent nommé **VISION** dans ton dashboard." }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      await base44.agents.addMessage(conv, { role: 'user', content: text });
      // Response arrives via subscribeToConversation
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'pending'),
        { id: 'err', role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' }
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Header title="AI Assistant" subtitle="Your intelligent data companion" />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {messages.map((message, i) => (
            <motion.div
              key={message.id || i}
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
                {message.role === 'assistant' && message.id !== 'welcome' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copié'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
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
                onClick={() => sendMessage(item.prompt)}
                className="flex items-center gap-3 p-4 rounded-xl glass border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-left group"
              >
                <item.icon className="w-5 h-5 text-white/40 group-hover:text-white/70" />
                <span className="text-sm text-white/60 group-hover:text-white/90">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/50" />
              </button>
            ))}
          </motion.div>
        )}

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
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
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
                onChange={(e) => { const f = e.target.files?.[0]; if (f) toast.success(`Fichier joint : ${f.name}`); e.target.value = ''; }}
              />
              <button
                onClick={() => toast.info('Microphone non disponible')}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="bg-white text-black hover:bg-white/90 h-9 w-9 p-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

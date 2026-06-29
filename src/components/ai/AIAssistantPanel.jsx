import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Mic, Paperclip } from 'lucide-react';
import doumassiLogo from "@/assets/Doumassi_AI_logo.png";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const AGENT_NAME = import.meta.env.VITE_BASE44_AGENT_NAME || 'vision_assistant';

const WELCOME_CONTENT = 'Bonjour ! Je suis votre assistant DOUMASSI AI. Je peux vous aider à interroger vos données, analyser des insights et automatiser des workflows. Comment puis-je vous aider ?';

export default function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([{ id: 'welcome', role: 'assistant', content: WELCOME_CONTENT }]);
  const [conv, setConv] = useState(null);
  const convInitialized = useRef(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!isOpen || convInitialized.current) return;
    convInitialized.current = true;

    base44.agents.createConversation({ agent_name: AGENT_NAME })
      .then(conversation => {
        setConv(conversation);
        unsubRef.current = base44.agents.subscribeToConversation(
          conversation.id,
          updatedConv => {
            const msgs = updatedConv.messages
              .filter(m => !m.hidden && (m.role === 'user' || m.role === 'assistant'))
              .map(m => ({ id: m.id, role: m.role, content: typeof m.content === 'string' ? m.content : '' }))
              .filter(m => m.content.trim());

            setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_CONTENT }, ...msgs]);

            const last = msgs[msgs.length - 1];
            if (last?.role === 'assistant') setIsLoading(false);
          }
        );
      })
      .catch(() => {});

    return () => unsubRef.current?.();
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const text = message;
    setMessage('');
    setIsLoading(true);

    setMessages(prev => [...prev, { id: 'pending', role: 'user', content: text }]);

    if (!conv) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== 'pending'),
          { id: 'err', role: 'assistant', content: "L'agent IA n'est pas encore configuré. Crée un agent nommé VISION dans ton dashboard base44." }
        ]);
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      await base44.agents.addMessage(conv, { role: 'user', content: text });
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'pending'),
        { id: 'err', role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }
      ]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] glass rounded-2xl border border-white/10 flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex flex-col gap-0.5">
                <img src={doumassiLogo} alt="DOUMASSI AI" className="h-10 w-auto object-contain" />
                <p className="text-[10px] text-white/40">Always ready to help</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/80 border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info('Pièce jointe non disponible dans cette démo')}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
                />
                <button
                  onClick={() => toast.info('Microphone non disponible')}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-white/90 h-9 w-9 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

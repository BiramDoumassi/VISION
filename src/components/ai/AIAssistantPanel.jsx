import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Mic, Paperclip } from 'lucide-react';
import doumassiLogo from "@/assets/Doumassi_AI_logo.png";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const getPanelResponse = (input) => {
  const q = input.toLowerCase();
  if (q.includes('sales') || q.includes('ventes') || q.includes('revenue'))
    return 'J\'ai analysé vos données de ventes. Croissance de +23% détectée, avec l\'EMEA comme meilleure région. Voulez-vous un rapport complet ?';
  if (q.includes('client') || q.includes('customer') || q.includes('churn'))
    return 'Analyse client en cours... Taux de rétention : 91.3%. 12% des clients montrent un risque de churn — je recommande une action proactive.';
  if (q.includes('sécurité') || q.includes('security'))
    return 'Score de sécurité actuel : 94.7/100. Aucune vulnérabilité critique. 3 patches en attente de priorité moyenne.';
  if (q.includes('pipeline') || q.includes('data') || q.includes('données'))
    return 'Vos pipelines fonctionnent à 99.2% de disponibilité. Le pipeline MongoDB montre une latence élevée — optimisation recommandée.';
  if (q.includes('rapport') || q.includes('report'))
    return 'Je peux générer un rapport sur vos données. Quel type vous intéresse : qualité des données, performance, sécurité ou exécutif ?';
  return `J\'ai analysé votre demande. Voici ce que j\'ai trouvé dans vos sources de données connectées : 3 datasets pertinents, 94% de pertinence. Voulez-vous approfondir ?`;
};

export default function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant DOUMASSI AI. Je peux vous aider à interroger vos données, analyser des insights et automatiser des workflows. Comment puis-je vous aider ?' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getPanelResponse(userMsg) }]);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] glass rounded-2xl border border-white/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex flex-col gap-0.5">
                <img
                  src={doumassiLogo}
                  alt="DOUMASSI AI"
                  className="h-10 w-auto object-contain"
                />
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
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
            </div>

            {/* Input */}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
                />
                <button
                  onClick={() => toast.info('Microphone non disponible dans cette démo')}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <Button 
                  onClick={handleSend}
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
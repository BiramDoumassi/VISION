import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  HelpCircle, BookOpen, MessageSquare, Video, FileText,
  ChevronDown, ChevronRight, Search, ExternalLink, 
  Zap, Database, Shield, BarChart3, Bot, Network,
  Mail, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    category: 'Démarrage',
    items: [
      { q: 'Comment connecter ma première source de données ?', a: "Rendez-vous dans Connectors depuis le menu latéral. Choisissez votre source (Google Drive, PostgreSQL, Salesforce...), cliquez sur \"Connect\" et suivez les étapes d'authentification OAuth ou de saisie des credentials." },
      { q: 'Combien de sources de données puis-je connecter ?', a: 'En offre Business, vous pouvez connecter jusqu\'à 10 sources simultanément. En offre Enterprise, le nombre est illimité avec des connecteurs personnalisés disponibles sur demande.' },
      { q: 'Comment inviter des membres de mon équipe ?', a: "Allez dans Settings > Team Members, cliquez \"Invite Member\", saisissez l'email et choisissez le rôle (Admin, Data Manager, Analyst, Viewer). Un email d'invitation est envoyé automatiquement." },
    ]
  },
  {
    category: 'AI & Requêtes',
    items: [
      { q: 'Comment formuler une requête AI efficace ?', a: 'Soyez précis sur la période, les métriques et le format attendu. Ex : "Montre-moi les 10 clients par CA sur Q4 2025, triés par décroissant." Plus le contexte est riche, plus le résultat est pertinent.' },
      { q: 'Les réponses AI sont-elles stockées ?', a: 'Les conversations AI sont sauvegardées dans votre espace personnel et accessibles depuis AI Assistant. Elles ne sont jamais utilisées pour entraîner nos modèles sans votre consentement explicite.' },
      { q: 'Puis-je créer des agents IA personnalisés ?', a: "Oui, depuis la section AI Agents. Vous pouvez configurer des agents avec des instructions personnalisées, des sources de données spécifiques et des déclencheurs automatiques. Disponible en offre Enterprise." },
    ]
  },
  {
    category: 'Sécurité & RGPD',
    items: [
      { q: 'Où sont hébergées mes données ?', a: 'Par défaut, les données sont hébergées en Europe (AWS eu-west-1, Paris). Les offres Enterprise peuvent opter pour un hébergement on-premise ou cloud dédié selon vos exigences.' },
      { q: 'Comment exercer mon droit à l\'effacement (RGPD) ?', a: 'Contactez notre DPO à dpo@vision-ai.com avec votre demande. Le traitement est effectué sous 72h conformément au RGPD. Un rapport de suppression vous est remis.' },
      { q: 'VISION est-il certifié ISO 27001 ?', a: 'Oui, VISION est certifié ISO 27001, SOC 2 Type II, et conforme RGPD. Les certifications HIPAA et HDS sont disponibles pour les clients secteur santé. Téléchargez nos rapports d\'audit depuis Settings > Security.' },
    ]
  },
];

const docs = [
  { icon: Zap, title: 'Quick Start Guide', desc: 'Connecter votre première source en 5 minutes', tag: 'Débutant' },
  { icon: Database, title: 'Data Connectors', desc: 'Documentation complète des 20+ connecteurs', tag: 'Référence' },
  { icon: Bot, title: 'AI Agents Setup', desc: 'Créer et déployer des agents autonomes', tag: 'Avancé' },
  { icon: Shield, title: 'Security & Compliance', desc: 'Configuration SSO, RBAC et audit', tag: 'Sécurité' },
  { icon: BarChart3, title: 'Reporting & Export', desc: 'Générer et automatiser vos rapports', tag: 'Référence' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Modéliser les relations entre vos données', tag: 'Avancé' },
];

const statusItems = [
  { service: 'API Platform', status: 'operational', uptime: '99.98%' },
  { service: 'Data Pipelines', status: 'operational', uptime: '99.95%' },
  { service: 'AI Services', status: 'operational', uptime: '99.91%' },
  { service: 'Storage & Sync', status: 'degraded', uptime: '98.70%' },
  { service: 'Authentication', status: 'operational', uptime: '100%' },
];

export default function HelpSupport() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');

  const allFaqs = faqs.flatMap(c => c.items.map(i => ({ ...i, category: c.category })));
  const filteredFaqs = search
    ? allFaqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Help & Support" subtitle="Documentation, FAQ et assistance" />

      <div className="p-6 max-w-5xl mx-auto">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2 font-space">Comment pouvons-nous vous aider ?</h2>
          <p className="text-sm text-white/40 mb-5">Cherchez dans la documentation, les FAQ et les guides</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ex: connecter PostgreSQL, RGPD, inviter un utilisateur..."
              className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl w-full"
            />
          </div>
        </motion.div>

        {/* Search results */}
        {search && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 mb-6">
            <p className="text-xs text-white/40 mb-4">{filteredFaqs.length} résultat(s) pour &ldquo;{search}&rdquo;</p>
            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-4">Aucun résultat. Contactez le support ci-dessous.</p>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-white/30 mb-1">{faq.category}</p>
                    <p className="text-sm font-medium text-white/80 mb-2">{faq.q}</p>
                    <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'docs', label: 'Documentation', icon: BookOpen },
            { id: 'status', label: 'Statut Système', icon: CheckCircle },
            { id: 'contact', label: 'Contact Support', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {faqs.map((group, gi) => (
              <div key={group.category}>
                <h3 className="text-xs uppercase tracking-wider text-white/30 mb-3">{group.category}</h3>
                <div className="glass rounded-2xl divide-y divide-white/5">
                  {group.items.map((faq, fi) => {
                    const key = `${gi}-${fi}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={fi}>
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-sm font-medium text-white/80 pr-4">{faq.q}</span>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-white/30 shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Documentation */}
        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 hover:bg-white/[0.04] cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <doc.icon className="w-5 h-5 text-white/50" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider border border-white/10 text-white/40 px-2 py-0.5 rounded-full">{doc.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-white/80 mb-1">{doc.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-3">{doc.desc}</p>
                <div className="flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                  <span>Lire la documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* System Status */}
        {activeTab === 'status' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-emerald-500/10 flex items-center gap-4 mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Tous les systèmes opérationnels</p>
                <p className="text-xs text-white/40">Dernière vérification : il y a 2 minutes</p>
              </div>
            </div>
            <div className="glass rounded-2xl divide-y divide-white/5">
              {statusItems.map((item) => (
                <div key={item.service} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-sm text-white/70">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/30">{item.uptime} uptime</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${item.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {item.status === 'operational' ? 'Opérationnel' : 'Dégradé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: MessageSquare,
                title: 'Chat en direct',
                desc: 'Discutez avec notre équipe support en temps réel.',
                badge: 'Disponible',
                badgeColor: 'bg-emerald-500/10 text-emerald-400',
                detail: 'Lun–Ven, 9h–18h CET',
                cta: 'Ouvrir le chat',
                primary: true,
              },
              {
                icon: Mail,
                title: 'Email Support',
                desc: 'Envoyez-nous un ticket, réponse sous 4h ouvrées.',
                badge: '< 4h',
                badgeColor: 'bg-blue-500/10 text-blue-400',
                detail: 'support@vision-ai.com',
                cta: 'Envoyer un email',
                primary: false,
              },
              {
                icon: Clock,
                title: 'Support 24/7',
                desc: "Incidents critiques uniquement — pour les clients Enterprise.",
                badge: 'Enterprise',
                badgeColor: 'bg-purple-500/10 text-purple-400',
                detail: 'Hotline dédiée + Account Manager',
                cta: 'Contacter votre AM',
                primary: false,
              },
              {
                icon: Video,
                title: 'Session onboarding',
                desc: "Planifiez une session de 30 min avec un expert VISION.",
                badge: 'Gratuit',
                badgeColor: 'bg-white/10 text-white/50',
                detail: 'Disponibilité sous 48h',
                cta: 'Réserver un créneau',
                primary: false,
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-white/50" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${card.badgeColor}`}>{card.badge}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{card.desc}</p>
                  <p className="text-xs text-white/25 mt-2">{card.detail}</p>
                </div>
                <Button className={card.primary ? 'bg-white text-black hover:bg-white/90 font-semibold h-9' : 'border border-white/10 bg-transparent text-white hover:bg-white/5 font-medium h-9'}>
                  {card.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Database, Sparkles, Shield, Network, Brain, Check,
  Layers, Search, Zap, Globe, Lock, BarChart3, Eye,
  Cloud, FileText, MessageSquare, Activity, Tag, Factory,
  Scale, Server, Users, Bot, FileSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const features = [
  { icon: Database, title: 'Universal Data Hub', desc: 'Centralize all your data sources in one intelligent platform' },
  { icon: Sparkles, title: 'AI-Powered Analytics', desc: 'Natural language queries and automated insights' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Discover hidden relationships across your data' },
  { icon: Shield, title: 'Enterprise Security', desc: 'GDPR compliant with end-to-end encryption' },
  { icon: Brain, title: 'AI Automation', desc: 'Automate workflows with intelligent AI agents' },
  { icon: Activity, title: 'Real-time Observability', desc: 'Monitor every pipeline and data flow' }
];

const integrations = [
  'Google Drive', 'Dropbox', 'Salesforce', 'PostgreSQL', 'MongoDB', 
  'AWS S3', 'Slack', 'Gmail', 'HubSpot', 'SAP', 'Stripe', 'MySQL'
];

export default function Landing() {
  const { navigateToLogin } = useAuth();
  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden">
      {/* Video background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://media.base44.com/videos/public/6a066f863989732c963de421/5e555b5b6_2792370-hd_1920_1080_30fps.mp4"
        />
        <div className="absolute inset-0 bg-[#050505]/70" />
      </div>
      {/* Animated background */}
      <div className="fixed inset-0 grid-pattern opacity-30 z-0" />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5"
      >
        <img 
          src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
          alt="VISION AI"
          className="h-16"
        />
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
          <a href="#platform" className="text-sm text-white/50 hover:text-white transition-colors">Platform</a>
          <a href="#security" className="text-sm text-white/50 hover:text-white transition-colors">Security</a>
          <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" onClick={navigateToLogin}>
            Sign In
          </Button>
          <Link to="/dashboard">
            <Button className="btn-primary">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-32 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-white/60">AI-Native Data Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-space"
          >
            The Universal AI
            <br />
            <span className="gradient-text">Data Operating System</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Collect, organize, analyze, and automate all your enterprise data with 
            cutting-edge AI. One platform for structured, unstructured, and streaming data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <Button className="btn-primary h-12 px-8 text-base">
                Launch Platform <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button className="btn-ghost h-12 px-8 text-base text-black">
              Watch Demo
            </Button>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
            <div className="glass rounded-3xl border border-white/10 p-2 glow-ai">
              <div className="bg-[#0a0a0a] rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 h-8 bg-white/5 rounded-lg flex items-center px-4">
                    <Search className="w-4 h-4 text-white/30 mr-2" />
                    <span className="text-sm text-white/30">Ask AI: "Show me revenue trends for Q4..."</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Documents', value: '248K', icon: FileText },
                    { label: 'Queries/day', value: '1.2M', icon: Search },
                    { label: 'Pipelines', value: '89', icon: Activity },
                    { label: 'AI Insights', value: '3.4K', icon: Sparkles }
                  ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-4">
                      <stat.icon className="w-5 h-5 text-white/40 mb-3" />
                      <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
                      <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-space">
              Enterprise-Grade Intelligence
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Everything you need to transform raw data into actionable insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="relative z-10 py-24 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5">
              <span className="text-xs text-white/50 uppercase tracking-wider">La Plateforme</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 font-space">Un écosystème complet<br /><span className="gradient-text">pour vos données</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Six modules intégrés couvrant l&apos;intégralité du cycle de vie de vos données, de l&apos;ingestion à l&apos;industrialisation de l&apos;IA.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Database, label: 'Data Catalog', desc: 'Centralisez, cataloguez et explorez tous vos actifs de données. Import CSV, Excel, PDF, JSON, connecteurs standards.', badge: 'Business' },
              { icon: Brain, label: 'AI Agents Platform', desc: "Créez et déployez des agents IA autonomes pour automatiser vos workflows métiers et analytiques.", badge: 'Enterprise' },
              { icon: Tag, label: 'Annotation Studio', desc: "Annotez texte, images, vidéos et audios avec validation humaine pour préparer vos datasets d'entraînement.", badge: 'Enterprise' },
              { icon: Factory, label: 'Dataset Factory', desc: 'Industrialisez la préparation de datasets IA avec contrôle qualité, versionning et exports multi-formats.', badge: 'Enterprise' },
              { icon: Scale, label: 'Gouvernance & Compliance', desc: 'RBAC, SSO, audit complet, RGPD, ISO 27001, SOC 2, HIPAA — conformité totale pour les secteurs réglementés.', badge: 'Enterprise' },
              { icon: BarChart3, label: 'Reporting Center', desc: 'Générez des rapports PDF, tableaux de bord interactifs et exports Excel automatisés à la demande.', badge: 'Business' },
            ].map((module, i) => (
              <motion.div
                key={module.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <module.icon className="w-5 h-5 text-white/60" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${module.badge === 'Enterprise' ? 'border-blue-500/30 text-blue-400/70 bg-blue-500/5' : 'border-white/10 text-white/40'}`}>
                    {module.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{module.label}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{module.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 glass rounded-2xl p-7 border border-white/10"
          >
            <p className="text-xs uppercase tracking-wider text-white/30 mb-5">Infrastructure & Déploiement</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Cloud, label: 'Cloud', desc: 'AWS, Azure, GCP' },
                { icon: Server, label: 'On-Premise', desc: 'Votre infrastructure' },
                { icon: Layers, label: 'Hybride', desc: 'Multi-environnements' },
                { icon: Zap, label: 'Temps réel', desc: 'Sync & streaming' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <item.icon className="w-4 h-4 text-white/40 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.label}</p>
                    <p className="text-xs text-white/30">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="relative z-10 py-24 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
                <Shield className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/50 uppercase tracking-wider">Sécurité & Conformité</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-5 font-space leading-tight">
                Sécurité enterprise<br /><span className="gradient-text">by design</span>
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                VISION a été conçu dès l&apos;origine pour les environnements les plus exigeants — banques, assurances, santé, défense. Chaque donnée est protégée à chaque étape.
              </p>
              <div className="space-y-3">
                {[
                  'Chiffrement de bout en bout (AES-256)',
                  "Authentification SSO / Active Directory / Azure AD",
                  "Contrôle d'accès granulaire (RBAC)",
                  'Audit trail complet et immuable',
                  'Isolation des données par tenant',
                  'Déploiement on-premise disponible',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase tracking-wider text-white/30 mb-4">Certifications & Conformité</p>
                <div className="grid grid-cols-3 gap-3">
                  {['RGPD', 'ISO 27001', 'SOC 2', 'HIPAA', 'HDS', 'NIS 2'].map(cert => (
                    <div key={cert} className="flex flex-col items-center justify-center py-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <Shield className="w-5 h-5 text-emerald-500/70 mb-1.5" />
                      <span className="text-xs font-semibold text-white/70">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase tracking-wider text-white/30 mb-4">Contrôle des accès</p>
                <div className="space-y-3">
                  {[
                    { role: 'Admin', perms: 'Accès total + gestion utilisateurs', color: 'bg-red-500/20 text-red-400' },
                    { role: 'Data Manager', perms: 'Lecture / écriture données', color: 'bg-blue-500/20 text-blue-400' },
                    { role: 'Analyst', perms: 'Lecture + rapports uniquement', color: 'bg-emerald-500/20 text-emerald-400' },
                    { role: 'Viewer', perms: 'Visualisation en lecture seule', color: 'bg-white/10 text-white/50' },
                  ].map(r => (
                    <div key={r.role} className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.color}`}>{r.role}</span>
                      <span className="text-xs text-white/40">{r.perms}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '99.9%', label: 'Disponibilité SLA' },
                  { value: 'AES-256', label: 'Chiffrement' },
                  { value: '24/7', label: 'Monitoring actif' },
                  { value: 'Zero Trust', label: 'Architecture' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center border border-white/5">
                    <p className="text-lg font-bold text-white font-space">{s.value}</p>
                    <p className="text-xs text-white/40 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative z-10 py-24 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-space">
              Connect Everything
            </h2>
            <p className="text-white/50">20+ native integrations and growing</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {integrations.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:bg-white/5 hover:text-white/80 transition-all cursor-pointer"
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section id="pricing" className="relative z-10 py-24 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-space">Nos Offres</h2>
            <p className="text-white/50">Choisissez la formule adaptée à votre organisation</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Business */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-7 border border-white/10 flex flex-col"
            >
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-white/30 mb-2">VISION</p>
                <h3 className="text-2xl font-bold text-white font-space mb-1">Business</h3>
                <p className="text-3xl font-bold text-white mt-3">299 €<span className="text-base font-normal text-white/40">/mois</span></p>
              </div>
              <p className="text-sm text-white/50 mb-5">Pour les PME souhaitant exploiter leurs données avec l'IA.</p>
              <ul className="space-y-2 flex-1">
                {['Centralisation des données', 'Assistant IA conversationnel', 'Data Quality & nettoyage', 'Knowledge Graph', 'Reporting PDF & Excel', 'Support standard'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="mt-7 block">
                <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold h-10">
                  Démarrer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-7 border border-white/20 bg-white/[0.04] flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs uppercase tracking-wider text-white/30">VISION</p>
                  <span className="text-[10px] uppercase tracking-wider border border-white/20 text-white/50 px-2 py-0.5 rounded-full">Recommandé</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-space mb-1">Enterprise</h3>
                <p className="text-3xl font-bold text-white mt-3">Sur devis</p>
              </div>
              <p className="text-sm text-white/50 mb-5">Pour les grandes organisations nécessitant gouvernance, sécurité et industrialisation de l'IA.</p>
              <ul className="space-y-2 flex-1">
                {['Tout le contenu Business', 'Gouvernance & Compliance (RGPD, SOC 2…)', 'AI Dataset Factory & Annotation', 'AI Safety Lab & Red Teaming', 'Agents IA personnalisés', 'Déploiement Cloud / Hybride / On-Premise', 'Support 24/7 & Account Manager'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="mt-7 block">
                <Button className="w-full border border-white/20 bg-transparent text-white hover:bg-white/10 font-semibold h-10">
                  Demander un devis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Professional Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-7 border border-white/10 flex flex-col"
            >
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-white/30 mb-2">VISION</p>
                <h3 className="text-2xl font-bold text-white font-space mb-1">Professional Services</h3>
                <p className="text-3xl font-bold text-white mt-3">Sur devis</p>
              </div>
              <p className="text-sm text-white/50 mb-5">Pour l'intégration et l'accompagnement à la mise en œuvre.</p>
              <ul className="space-y-2 flex-1">
                {['Migration des données', 'Intégration systèmes', 'Développement spécifique', 'Formation des équipes', 'Conseil IA', 'Forfait projet / Régie'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="mt-7 block">
                <Button className="w-full border border-white/10 bg-transparent text-white hover:bg-white/5 font-semibold h-10">
                  Nous contacter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Link to="/pricing">
              <span className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4 cursor-pointer">
                Voir le détail complet des offres →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-white/10 glow-white"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-space">
              Ready to transform your data?
            </h2>
            <p className="text-white/50 mb-8">
              Join thousands of enterprises using VISION AI
            </p>
            <Link to="/dashboard">
              <Button className="btn-primary h-12 px-10 text-base">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img 
            src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
            alt="VISION AI"
            className="h-8 opacity-60"
          />
          <p className="text-xs text-white/30">© 2026 VISION AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
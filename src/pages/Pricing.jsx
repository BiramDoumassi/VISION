import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, Sparkles, Shield, Database, Brain,
  Network, BarChart3, Users, Zap, Eye, Scale, Factory,
  HeadphonesIcon, Globe, Server, Cpu, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const businessFeatures = [
  {
    category: 'Gestion des Données',
    icon: Database,
    items: ['Centralisation des données', 'Catalogue de données', 'Import CSV, Excel, PDF, JSON', 'Connecteurs standards']
  },
  {
    category: 'IA & Recherche',
    icon: Brain,
    items: ['Assistant IA conversationnel', 'Recherche intelligente', 'Génération de rapports', 'Résumés automatiques']
  },
  {
    category: 'Data Quality',
    icon: Sparkles,
    items: ['Nettoyage automatique des données', 'Détection de doublons', 'Contrôle qualité']
  },
  {
    category: 'Knowledge Graph',
    icon: Network,
    items: ['Cartographie des données', 'Relations entre documents', 'Recherche contextuelle']
  },
  {
    category: 'Sécurité',
    icon: Shield,
    items: ['Gestion des utilisateurs', 'Authentification sécurisée', 'Permissions par équipe']
  },
  {
    category: 'Reporting',
    icon: BarChart3,
    items: ['Rapports PDF', 'Export Excel', 'Tableaux de bord']
  },
  {
    category: 'Support',
    icon: HeadphonesIcon,
    items: ['Support standard', 'Documentation', 'Centre d\'aide']
  }
];

const enterpriseFeatures = [
  {
    category: 'Gouvernance Avancée',
    icon: Scale,
    items: ['RBAC avancé', 'SSO', 'Active Directory', 'Azure AD', 'Audit complet']
  },
  {
    category: 'Data Engine Avancé',
    icon: Database,
    items: ['Connecteurs illimités', 'API avancées', 'Synchronisation temps réel', 'Data Lake intégré']
  },
  {
    category: 'Human-in-the-Loop',
    icon: Users,
    items: ['Validation humaine', 'Workflows collaboratifs', 'Contrôle qualité expert']
  },
  {
    category: 'AI Dataset Factory',
    icon: Factory,
    items: ['Annotation texte', 'Annotation image', 'Annotation vidéo', 'Annotation audio', 'Préparation datasets IA']
  },
  {
    category: 'AI Safety Lab',
    icon: Shield,
    items: ['Tests de modèles IA', 'Détection de biais', 'Évaluation LLM', 'Red Teaming']
  },
  {
    category: 'Automatisation',
    icon: Zap,
    items: ['Agents IA personnalisés', 'Workflows automatisés', 'Déclencheurs intelligents']
  },
  {
    category: 'Observabilité',
    icon: Eye,
    items: ['Monitoring temps réel', 'Logs avancés', 'Alertes intelligentes', 'Centre de supervision']
  },
  {
    category: 'Compliance',
    icon: Scale,
    items: ['RGPD', 'ISO 27001', 'SOC 2', 'HIPAA', 'Archivage légal']
  },
  {
    category: 'Infrastructure',
    icon: Server,
    items: ['Déploiement Cloud', 'Déploiement Hybride', 'Déploiement On-Premise']
  },
  {
    category: 'Support Premium',
    icon: HeadphonesIcon,
    items: ['Account Manager dédié', 'Support prioritaire 24/7', 'Accompagnement technique', 'Formation des équipes']
  }
];

const businessTargets = ['PME', 'Startups', 'Cabinets de conseil', 'Agences', 'Équipes Data', 'Entreprises en croissance'];
const enterpriseTargets = ['Grandes entreprises', 'Groupes internationaux', 'Administrations publiques', 'Banques', 'Assurances', 'Santé', 'Industrie', 'Défense'];

const services = [
  { label: 'Migration des données', icon: Database },
  { label: 'Intégration systèmes', icon: Zap },
  { label: 'Développement spécifique', icon: Cpu },
  { label: 'Formation', icon: Users },
  { label: 'Conseil IA', icon: Brain },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
        <Link to="/">
          <img
            src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
            alt="VISION AI"
            className="h-10 w-auto"
          />
        </Link>
        <Link to="/dashboard">
          <Button className="bg-white text-black hover:bg-white/90 text-sm font-semibold px-5 h-9">
            Accéder à la plateforme <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="py-20 px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-white/60">VISION Data Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-space leading-tight">
            Nos Offres d'Abonnement
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Choisissez la formule adaptée à votre organisation et transformez vos données en avantage compétitif.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-8 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Business Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold font-space">VISION Business</h2>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">299 €</span>
                <span className="text-white/40 text-sm ml-2">/mois</span>
              </div>
              <p className="text-white/40 text-sm">Idéal pour les équipes qui souhaitent centraliser et exploiter leurs données avec l'IA.</p>
            </div>

            {/* Targets */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-white/30 mb-3">Pour qui ?</p>
              <div className="flex flex-wrap gap-2">
                {businessTargets.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60">{t}</span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-5 flex-1">
              {businessFeatures.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <group.icon className="w-3.5 h-3.5 text-white/40" />
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{group.category}</p>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {group.items.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/dashboard">
                <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold h-12">
                  Démarrer l'essai gratuit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/20 bg-white/[0.04] p-8 flex flex-col relative overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-space">VISION Enterprise</h2>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
                    Recommandé
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">Sur devis</span>
              </div>
              <p className="text-white/40 text-sm">Solution complète pour les organisations exigeantes avec des besoins avancés en IA et conformité.</p>
            </div>

            {/* Includes Business */}
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-white/70">Tout le contenu de <strong className="text-white">VISION Business</strong>, plus :</span>
            </div>

            {/* Targets */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-white/30 mb-3">Pour qui ?</p>
              <div className="flex flex-wrap gap-2">
                {enterpriseTargets.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60">{t}</span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-5 flex-1">
              {enterpriseFeatures.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <group.icon className="w-3.5 h-3.5 text-white/40" />
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{group.category}</p>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {group.items.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button className="w-full border border-white/20 bg-transparent text-white hover:bg-white/10 font-semibold h-12">
                Demander un devis <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/30">Services Additionnels</p>
                    <h3 className="text-2xl font-bold font-space">VISION Professional Services</h3>
                  </div>
                </div>
                <p className="text-white/50 mb-6 max-w-lg">
                  Accompagnement expert à la mise en œuvre pour maximiser votre retour sur investissement.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map(({ label, icon: ServiceIcon }) => (
                    <div key={label} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                      <ServiceIcon className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm text-white/70">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-48 flex flex-col gap-3">
                <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Forfait projet</p>
                  <p className="text-xs text-white/40 mt-1">Prix fixe défini en amont</p>
                </div>
                <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Régie</p>
                  <p className="text-xs text-white/40 mt-1">Facturation au temps passé</p>
                </div>
                <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Sur devis</p>
                  <p className="text-xs text-white/40 mt-1">Solution personnalisée</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">Une question sur nos offres ? Notre équipe commerciale vous répond sous 24h.</p>
              <Button className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-10 shrink-0">
                Nous contacter <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
            alt="VISION AI"
            className="h-8 opacity-50"
          />
          <p className="text-xs text-white/30">© 2026 VISION AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
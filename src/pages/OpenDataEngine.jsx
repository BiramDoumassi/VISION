import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Globe, Search, Download, RefreshCw, Plus, Filter,
  Database, BarChart3, Map, Leaf, Heart, TrendingUp,
  CheckCircle, Clock, ArrowRight, Zap, Star, StarOff,
  ExternalLink, Cloud, Activity, FileText, Layers,
  AlertCircle, ChevronRight, Sparkles, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'Government', 'Statistics', 'Geospatial', 'Finance', 'Environment', 'Health'];

const sources = [
  {
    id: 1,
    name: 'data.gouv.fr',
    provider: 'Gouvernement Français',
    category: 'Government',
    flag: '🇫🇷',
    desc: 'Portail officiel des données ouvertes de l\'État français. Plus de 45 000 jeux de données publics.',
    datasets: 45820,
    records: '2.4B',
    status: 'connected',
    lastSync: '12 min ago',
    starred: true,
    tags: ['Officiel', 'Temps réel', 'API REST'],
  },
  {
    id: 2,
    name: 'INSEE Open Data',
    provider: 'Institut National de la Statistique',
    category: 'Statistics',
    flag: '🇫🇷',
    desc: 'Données statistiques de référence : population, emploi, économie, logement — France métropolitaine et DOM.',
    datasets: 12400,
    records: '890M',
    status: 'connected',
    lastSync: '1h ago',
    starred: true,
    tags: ['Statistiques', 'Démographie', 'Économie'],
  },
  {
    id: 3,
    name: 'EU Open Data Portal',
    provider: 'Commission Européenne',
    category: 'Government',
    flag: '🇪🇺',
    desc: 'Données ouvertes des institutions européennes. Couverture de 27 pays membres et institutions UE.',
    datasets: 89200,
    records: '5.1B',
    status: 'connected',
    lastSync: '3h ago',
    starred: false,
    tags: ['Europe', 'Multi-langues', 'SPARQL'],
  },
  {
    id: 4,
    name: 'Eurostat',
    provider: 'Office Statistique de l\'UE',
    category: 'Statistics',
    flag: '🇪🇺',
    desc: 'Statistiques comparatives harmonisées pour tous les pays de l\'Union Européenne.',
    datasets: 7800,
    records: '340M',
    status: 'available',
    lastSync: null,
    starred: false,
    tags: ['Macro-économie', 'Social', 'Comparatif'],
  },
  {
    id: 5,
    name: 'World Bank Open Data',
    provider: 'Banque Mondiale',
    category: 'Finance',
    flag: '🌍',
    desc: 'Indicateurs de développement mondial, données financières et économiques pour 217 pays.',
    datasets: 16000,
    records: '1.2B',
    status: 'connected',
    lastSync: '6h ago',
    starred: true,
    tags: ['Développement', 'PIB', 'Pauvreté'],
  },
  {
    id: 6,
    name: 'Copernicus Open Access Hub',
    provider: 'Agence Spatiale Européenne',
    category: 'Geospatial',
    flag: '🛰️',
    desc: 'Données satellites Sentinel en accès libre. Imagerie multispectrale, SAR, et données atmosphériques.',
    datasets: 3200,
    records: '98TB',
    status: 'available',
    lastSync: null,
    starred: false,
    tags: ['Satellite', 'GeoTIFF', 'Sentinel'],
  },
  {
    id: 7,
    name: 'OpenStreetMap',
    provider: 'OSM Foundation',
    category: 'Geospatial',
    flag: '🗺️',
    desc: 'Cartographie mondiale collaborative et libre. Données vectorielles de routes, bâtiments, POI.',
    datasets: 1,
    records: '7.8B',
    status: 'connected',
    lastSync: '30 min ago',
    starred: false,
    tags: ['Cartographie', 'PBF', 'GeoJSON'],
  },
  {
    id: 8,
    name: 'FRED Economic Data',
    provider: 'Federal Reserve Bank of St. Louis',
    category: 'Finance',
    flag: '🇺🇸',
    desc: 'Plus de 800 000 séries temporelles économiques et financières américaines et mondiales.',
    datasets: 819000,
    records: '2.1B',
    status: 'available',
    lastSync: null,
    starred: false,
    tags: ['Séries temporelles', 'Macroéconomie', 'API JSON'],
  },
  {
    id: 9,
    name: 'WHO Global Health Observatory',
    provider: 'Organisation Mondiale de la Santé',
    category: 'Health',
    flag: '🏥',
    desc: 'Données sanitaires mondiales : mortalité, morbidité, déterminants de santé pour 194 pays membres.',
    datasets: 2400,
    records: '180M',
    status: 'connected',
    lastSync: '2 days ago',
    starred: false,
    tags: ['Santé', 'Épidémies', 'ODD'],
  },
  {
    id: 10,
    name: 'NASA Open Data',
    provider: 'NASA / data.nasa.gov',
    category: 'Environment',
    flag: '🚀',
    desc: 'Données spatiales, climatiques et scientifiques de la NASA. Images, mesures atmosphériques, exoplanètes.',
    datasets: 68000,
    records: '450TB',
    status: 'available',
    lastSync: null,
    starred: false,
    tags: ['Spatial', 'Climat', 'Astronomie'],
  },
  {
    id: 11,
    name: 'data.europa.eu',
    provider: 'Publications Office of the EU',
    category: 'Government',
    flag: '🇪🇺',
    desc: 'Portail officiel des données ouvertes de l\'UE incluant les données des institutions et agences européennes.',
    datasets: 124000,
    records: '8.2B',
    status: 'available',
    lastSync: null,
    starred: false,
    tags: ['Officiel', 'DCAT', 'Linked Data'],
  },
  {
    id: 12,
    name: 'UN SDG Indicators',
    provider: 'Nations Unies',
    category: 'Statistics',
    flag: '🌐',
    desc: 'Indicateurs officiels de suivi des Objectifs de Développement Durable (ODD 2030) pour tous les États membres.',
    datasets: 248,
    records: '92M',
    status: 'connected',
    lastSync: '1 day ago',
    starred: false,
    tags: ['ODD', 'Développement', 'Suivi'],
  },
];

const recentImports = [
  { source: 'data.gouv.fr', dataset: 'Base SIRENE — Établissements actifs', records: '12.4M records', time: '8 min ago', status: 'success' },
  { source: 'INSEE', dataset: 'Taux de chômage par région 2025', records: '248K records', time: '2h ago', status: 'success' },
  { source: 'World Bank', dataset: 'GDP per capita — All countries', records: '45K records', time: '6h ago', status: 'success' },
  { source: 'OpenStreetMap', dataset: 'France métropolitaine POIs', records: '3.2M records', time: '1 day ago', status: 'success' },
  { source: 'WHO', dataset: 'Global mortality estimates 2024', records: '890K records', time: '2 days ago', status: 'warning' },
];

const statusConfig = {
  connected: { label: 'Connecté', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  available: { label: 'Disponible', color: 'text-white/40', bg: 'bg-white/5 border-white/10', dot: 'bg-white/30' },
  syncing: { label: 'Syncing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500 animate-pulse' },
  error: { label: 'Erreur', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
};

const categoryIcons = {
  Government: Globe,
  Statistics: BarChart3,
  Geospatial: Map,
  Finance: TrendingUp,
  Environment: Leaf,
  Health: Heart,
  All: Layers,
};

export default function OpenDataEngine() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [starred, setStarred] = useState({});
  const [selectedSource, setSelectedSource] = useState(null);
  const [importingId, setImportingId] = useState(null);

  const handleImport = (id) => {
    setImportingId(id);
    setTimeout(() => setImportingId(null), 2500);
  };

  const filtered = sources.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const connectedCount = sources.filter(s => s.status === 'connected').length;
  const totalDatasets = sources.reduce((sum, s) => sum + s.datasets, 0);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header
        title="Open Data Engine"
        subtitle="Discover, connect and ingest public open datasets"
      />

      <div className="p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Sources disponibles', value: sources.length, icon: Globe, color: 'text-white/60' },
            { label: 'Sources connectées', value: connectedCount, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Total datasets', value: totalDatasets.toLocaleString(), icon: Database, color: 'text-blue-400' },
            { label: 'Imports actifs', value: '3', icon: Activity, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-semibold text-white font-space">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Rechercher une source, un jeu de données, un tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white/80 placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => {
                const CatIcon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-white text-black'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CatIcon className="w-3 h-3" />
                    {cat}
                  </button>
                );
              })}
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Sources Grid */}
          <div className={`${selectedSource ? 'lg:col-span-2' : 'lg:col-span-2'} space-y-0`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/40">
                <span className="text-white font-medium">{filtered.length}</span> sources trouvées
              </p>
              <Button className="bg-white text-black hover:bg-white/90 gap-2 h-8 text-xs">
                <Plus className="w-3 h-3" /> Ajouter une source
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((source, i) => {
                const s = statusConfig[source.status];
                const isStarred = starred[source.id] ?? source.starred;
                const isImporting = importingId === source.id;
                const isSelected = selectedSource?.id === source.id;

                return (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    onClick={() => setSelectedSource(isSelected ? null : source)}
                    className={`glass rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/[0.04] group ${
                      isSelected ? 'border-white/20' : ''
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-white/10 transition-colors">
                          {source.flag}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{source.name}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">{source.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStarred((prev) => ({ ...prev, [source.id]: !isStarred }));
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          {isStarred
                            ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            : <StarOff className="w-3.5 h-3.5 text-white/25" />}
                        </button>
                        <ChevronRight className={`w-4 h-4 text-white/25 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium mb-3 ${s.bg} ${s.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                      {source.lastSync && (
                        <span className="text-white/30 font-normal ml-1">— {source.lastSync}</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">{source.desc}</p>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-white font-space">
                          {source.datasets.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/30">datasets</p>
                      </div>
                      <div className="w-px h-6 bg-white/5" />
                      <div>
                        <p className="text-sm font-semibold text-white font-space">{source.records}</p>
                        <p className="text-[10px] text-white/30">records</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {source.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      {source.status === 'connected' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleImport(source.id); }}
                            className={`flex-1 h-7 text-xs gap-1.5 transition-all ${
                              isImporting
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white text-black hover:bg-white/90'
                            }`}
                          >
                            {isImporting ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" /> Import en cours...
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" /> Importer
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-7 text-xs bg-white/5 hover:bg-white/10 text-white/60 gap-1.5"
                        >
                          <Plus className="w-3 h-3" /> Connecter
                        </Button>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/5"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3 h-3 text-white/30" />
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Suggestion IA</p>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Ce jeu de données peut être enrichi avec {source.name === 'data.gouv.fr' ? 'INSEE' : 'World Bank'} pour
                          ajouter des indicateurs démographiques. Compatibilité estimée à 94%.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Add custom source card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-5 border-2 border-dashed border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                  <Plus className="w-6 h-6 text-white/40" />
                </div>
                <p className="text-sm font-medium text-white/50">Nouvelle source</p>
                <p className="text-xs text-white/30 mt-1 text-center">API REST, SPARQL,<br />S3, FTP, CSV distant</p>
              </motion.div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Recent Imports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium text-sm">Imports récents</h3>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">5 derniers</span>
              </div>
              <div className="space-y-4">
                {recentImports.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/70 truncate">{item.dataset}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{item.source} · {item.records}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5 text-white/20" />
                        <span className="text-[10px] text-white/25">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 pt-4 border-t border-white/5 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5">
                Voir tout l'historique <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>

            {/* Active Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium text-sm">Pipelines actifs</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'data.gouv.fr → Data Hub', progress: 78, status: 'running', records: '9.1M / 12.4M' },
                  { name: 'INSEE → Knowledge Graph', progress: 45, status: 'running', records: '112K / 248K' },
                  { name: 'OSM France → Catalog', progress: 92, status: 'finishing', records: '2.9M / 3.2M' },
                ].map((pipeline, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-white/70 truncate">{pipeline.name}</p>
                      <span className={`text-[10px] font-medium ${
                        pipeline.status === 'finishing' ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                        {pipeline.progress}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pipeline.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                        className={`h-full rounded-full ${
                          pipeline.status === 'finishing' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-white/25 font-mono-code">{pipeline.records}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Enrichment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-medium text-sm">Enrichissement IA</h3>
              </div>
              <p className="text-xs text-white/40 mb-4 leading-relaxed">
                L'IA détecte les corrélations entre sources et propose des enrichissements automatiques.
              </p>
              <div className="space-y-2">
                {[
                  { match: 'SIRENE ↔ OSM', score: 94, desc: 'Géolocalisation établissements' },
                  { match: 'INSEE ↔ WHO', score: 87, desc: 'Indicateurs santé/démographie' },
                  { match: 'World Bank ↔ Eurostat', score: 91, desc: 'Harmonisation indicateurs PIB' },
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all group">
                    <div>
                      <p className="text-xs font-medium text-white/70 font-mono-code">{suggestion.match}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{suggestion.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-medium">{suggestion.score}%</span>
                      <Play className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white/60 text-xs h-8 gap-2">
                <Zap className="w-3 h-3" /> Lancer l'enrichissement auto
              </Button>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="text-white font-medium text-sm mb-4">Couverture par catégorie</h3>
              <div className="space-y-3">
                {[
                  { label: 'Government', count: 3, color: 'bg-blue-500' },
                  { label: 'Statistics', count: 3, color: 'bg-purple-500' },
                  { label: 'Finance', count: 2, color: 'bg-amber-500' },
                  { label: 'Geospatial', count: 2, color: 'bg-emerald-500' },
                  { label: 'Health', count: 1, color: 'bg-red-500' },
                  { label: 'Environment', count: 1, color: 'bg-teal-500' },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.color} flex-shrink-0`} />
                    <p className="text-xs text-white/50 flex-1">{cat.label}</p>
                    <p className="text-xs font-medium text-white/70">{cat.count} sources</p>
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color} opacity-70`}
                        style={{ width: `${(cat.count / sources.length) * 100 * 4}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

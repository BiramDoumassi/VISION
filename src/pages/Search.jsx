import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Search as SearchIcon, Sparkles, Clock, TrendingUp,
  FileText, Database, Building2, Filter,
  ChevronRight, ArrowRight, Loader2
} from 'lucide-react';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import { Document, AIInsight } from '@/api/entities';

const recentSearches = ['Financial reports', 'Customer data', 'Security alerts', 'Pipeline status'];
const trendingQueries = ['Revenue trends', 'Pipeline performance', 'Data quality', 'Security alerts'];

const typeIcons = { document: FileText, record: Database, entity: Building2, insight: Sparkles };

function relativeDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterMap = { All: null, Documents: 'document', Data: 'record', Entities: 'entity', Insights: 'insight' };
  const filteredResults = activeFilter === 'All'
    ? results
    : results.filter(r => r.type === filterMap[activeFilter]);

  const handleSearch = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    setShowResults(true);

    try {
      const [docs, insights] = await Promise.allSettled([
        Document.list('-created_date', 200),
        AIInsight.list('-created_date', 100),
      ]);

      const docResults = (docs.status === 'fulfilled' ? docs.value : [])
        .filter(d => !q || d.name?.toLowerCase().includes(q) || d.ai_summary?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q))
        .map(d => ({
          type: 'document',
          title: d.name || 'Untitled',
          snippet: d.ai_summary || `${d.category || 'General'} · ${d.sensitivity || 'internal'}`,
          source: d.category || 'DataHub',
          date: relativeDate(d.created_date),
          relevance: d.name?.toLowerCase().includes(q) ? 95 : 80,
        }));

      const insightResults = (insights.status === 'fulfilled' ? insights.value : [])
        .filter(i => !q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
        .map(i => ({
          type: 'insight',
          title: i.title || 'AI Insight',
          snippet: i.description || 'AI-generated insight',
          source: 'AI Engine',
          date: relativeDate(i.created_date),
          relevance: 75,
        }));

      setResults([...docResults, ...insightResults].sort((a, b) => b.relevance - a.relevance));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Universal AI Search" 
        subtitle="Search across all your data" 
      />
      
      <div className="p-6 max-w-4xl mx-auto">
        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <DoumassiLogo className="h-10 w-auto" />
            <div>
              <h2 className="text-xl text-white font-medium">Ask AI Anything</h2>
              <p className="text-sm text-white/40">Semantic search across documents, databases, and knowledge graph</p>
            </div>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search documents, data, insights..."
              className="w-full h-14 pl-12 pr-28 bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-base rounded-xl outline-none focus:border-white/20"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-white/90 px-4 h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-white/30">Filter:</span>
            {['All', 'Documents', 'Data', 'Entities', 'Insights'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeFilter === filter
                    ? 'bg-white text-black font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {!showResults ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-medium">Recent Searches</h3>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <span className="text-sm text-white/60 group-hover:text-white/90">{search}</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Trending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-medium">Trending Queries</h3>
              </div>
              <div className="space-y-2">
                {trendingQueries.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <span className="text-sm text-white/60 group-hover:text-white/90">{search}</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-white/30">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Searching your data…</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-white/50">
                    <span className="text-white">{filteredResults.length}</span> result{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Filter className="w-3 h-3" /> Sorted by relevance
                  </span>
                </div>

                {filteredResults.length === 0 && (
                  <div className="glass rounded-xl p-10 text-center text-white/30 text-sm">
                    No results found — try different keywords or upload documents in DataHub.
                  </div>
                )}

                {filteredResults.map((result, i) => {
                  const Icon = typeIcons[result.type] || FileText;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                          <Icon className="w-5 h-5 text-white/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white/90">{result.title}</h4>
                            <span className="text-[10px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded-full">
                              {result.relevance}% match
                            </span>
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2 mb-2">{result.snippet}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/30">{result.source}</span>
                            <span className="text-[10px] text-white/20">•</span>
                            <span className="text-[10px] text-white/30">{result.date}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50" />
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
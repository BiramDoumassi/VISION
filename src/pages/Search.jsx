import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Search as SearchIcon, Sparkles, Clock, TrendingUp,
  FileText, Database, Users, Building2, Tag, Filter,
  ChevronRight, Star, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DoumassiLogo from '@/components/ui/DoumassiLogo';

const recentSearches = [
  'Q4 financial reports',
  'Customer churn analysis',
  'Sales by region Europe',
  'Employee contracts 2025'
];

const trendingQueries = [
  'Revenue trends',
  'Pipeline performance',
  'Data quality issues',
  'Security alerts'
];

const searchResults = [
  {
    type: 'document',
    title: 'Q4 2025 Financial Report',
    snippet: 'Comprehensive analysis of quarterly performance with 23% revenue growth...',
    source: 'Google Drive',
    date: '2 days ago',
    relevance: 98
  },
  {
    type: 'record',
    title: 'Sales Data - European Market',
    snippet: 'Transaction records showing regional performance metrics across EU countries...',
    source: 'Salesforce',
    date: '1 week ago',
    relevance: 94
  },
  {
    type: 'entity',
    title: 'Acme Corporation',
    snippet: 'Enterprise customer with 45 associated contracts and $2.4M annual revenue...',
    source: 'Knowledge Graph',
    date: 'Updated today',
    relevance: 89
  },
  {
    type: 'insight',
    title: 'Customer Retention Analysis',
    snippet: 'AI-generated insight: 12% improvement opportunity identified in onboarding...',
    source: 'AI Engine',
    date: '3 hours ago',
    relevance: 85
  }
];

const typeIcons = {
  document: FileText,
  record: Database,
  entity: Building2,
  insight: Sparkles
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filterMap = { All: null, Documents: 'document', Data: 'record', Entities: 'entity', Insights: 'insight' };

  const filteredResults = activeFilter === 'All'
    ? searchResults
    : searchResults.filter(r => r.type === filterMap[activeFilter]);

  const handleSearch = () => {
    if (query.trim()) {
      setShowResults(true);
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
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search documents, data, insights..."
              className="h-14 pl-12 pr-28 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base rounded-xl"
            />
            <Button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-white/90"
            >
              Search
            </Button>
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/50">
                <span className="text-white">{filteredResults.length}</span> results for "{query}"
              </p>
              <Button variant="ghost" size="sm" className="text-white/40 text-xs">
                <Filter className="w-3 h-3 mr-1" /> Sort by relevance
              </Button>
            </div>

            {filteredResults.map((result, i) => {
              const Icon = typeIcons[result.type];
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
                        <Badge variant="outline" className="text-[10px] text-white/40 border-white/10">
                          {result.relevance}% match
                        </Badge>
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  Search,
  Sparkles,
  Shield,
  Activity,
  Network,
  MessageSquare,
  Settings,
  ChevronRight,
  Layers,
  FileSearch,
  CircuitBoard,
  HelpCircle,
  Bot,
  Tag,
  Factory,
  Scale,
  FileBarChart,
  BookOpen,
  Globe,
  Earth
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Command Center', section: 'main' },
  { path: '/data-hub', icon: Database, label: 'Universal Data Hub', section: 'main' },
  { path: '/data-catalog', icon: BookOpen, label: 'Data Catalog', section: 'main' },
  { path: '/search', icon: Search, label: 'AI Search', section: 'main' },
  { path: '/ai-query', icon: Sparkles, label: 'AI Query', section: 'main' },
  { path: '/open-data', icon: Globe, label: 'Open Data Engine', section: 'data' },
  { path: '/data-cleaner', icon: FileSearch, label: 'Data Cleaner', section: 'data' },
  { path: '/annotation-studio', icon: Tag, label: 'Annotation Studio', section: 'data' },
  { path: '/dataset-factory', icon: Factory, label: 'Dataset Factory', section: 'data' },
  { path: '/knowledge-graph', icon: Network, label: 'Knowledge Graph', section: 'data' },
  { path: '/ai-agents', icon: Bot, label: 'AI Agents', section: 'ai' },
  { path: '/ai-assistant', icon: MessageSquare, label: 'AI Assistant', section: 'ai' },
  { path: '/earth', icon: Earth, label: 'Earth Intelligence', section: 'ops' },
  { path: '/observability', icon: Activity, label: 'Observability', section: 'ops' },
  { path: '/security', icon: Shield, label: 'Security Center', section: 'ops' },
  { path: '/governance', icon: Scale, label: 'Governance', section: 'ops' },
  { path: '/reporting', icon: FileBarChart, label: 'Reporting', section: 'ops' },
  { path: '/connectors', icon: CircuitBoard, label: 'Connectors', section: 'ops' },
  { path: '/personal-os', icon: Layers, label: 'Personal Data OS', section: 'personal' },
];

const sections = {
  main: 'Platform',
  data: 'Data Intelligence',
  ai: 'AI & Agents',
  ops: 'Operations',
  personal: 'Personal'
};

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-[#050505] border-r border-white/5 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center px-4 border-b border-white/5">
        <Link to="/" className="flex items-center justify-center">
          <img 
            src="https://media.base44.com/images/public/6a066f863989732c963de421/8662aeaf9_Capturedcran2026-06-07171213.png"
            alt="VISION AI"
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-6">
            <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium px-3 mb-2">
              {sections[section]}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 text-white/40" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/5 p-3">
        <Link to="/settings" className="sidebar-item">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <Link to="/help" className="sidebar-item">
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </Link>
      </div>
    </motion.aside>
  );
}
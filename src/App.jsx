import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import DataHub from '@/pages/DataHub';
import AIQuery from '@/pages/AIQuery';
import Security from '@/pages/Security';
import Observability from '@/pages/Observability';
import KnowledgeGraph from '@/pages/KnowledgeGraph';
import AIAssistant from '@/pages/AIAssistant';
import PersonalOS from '@/pages/PersonalOS';
import Connectors from '@/pages/Connectors';
import Settings from '@/pages/Settings';
import Search from '@/pages/Search';
import DataCleaner from '@/pages/DataCleaner';
import AIAgents from '@/pages/AIAgents';
import AnnotationStudio from '@/pages/AnnotationStudio';
import DatasetFactory from '@/pages/DatasetFactory';
import Governance from '@/pages/Governance';
import ReportingCenter from '@/pages/ReportingCenter';
import DataCatalog from '@/pages/DataCatalog';
import Pricing from '@/pages/Pricing';
import HelpSupport from '@/pages/HelpSupport';
import OpenDataEngine from '@/pages/OpenDataEngine';
import EarthView from '@/pages/EarthView';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm">Loading VISION AI...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* Dashboard Layout Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/data-hub" element={<DataHub />} />
        <Route path="/search" element={<Search />} />
        <Route path="/ai-query" element={<AIQuery />} />
        <Route path="/data-cleaner" element={<DataCleaner />} />
        <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="/observability" element={<Observability />} />
        <Route path="/security" element={<Security />} />
        <Route path="/connectors" element={<Connectors />} />
        <Route path="/personal-os" element={<PersonalOS />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/annotation-studio" element={<AnnotationStudio />} />
        <Route path="/dataset-factory" element={<DatasetFactory />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/reporting" element={<ReportingCenter />} />
        <Route path="/data-catalog" element={<DataCatalog />} />
        <Route path="/open-data" element={<OpenDataEngine />} />
        <Route path="/earth" element={<EarthView />} />
      </Route>
      
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner theme="dark" position="bottom-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIAssistantPanel from '../ai/AIAssistantPanel';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
      <AIAssistantPanel />
    </div>
  );
}
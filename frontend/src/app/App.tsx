import { useState } from 'react';
import { Droplet, BarChart3, Brain, Network } from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';



type TabType = 'dashboard' ;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Menu */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Logo & App Name */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Droplet className="w-10 h-10 text-cyan-600" />
              <BarChart3 className="w-5 h-5 text-blue-600 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">WaterPotability AI</h1>
              <p className="text-xs text-gray-500">Phân tích chất lượng nước</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-100 text-cyan-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">© 2026 WaterPotability AI</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
        </div>
      </div>
    </div>
  );
}

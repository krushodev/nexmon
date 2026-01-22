import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Moon, Sun, Monitor, Server, LayoutDashboard } from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';
import { ResourcesTab } from './components/ResourcesTab';
import { ProcessesTab } from './components/ProcessesTab';
import logoWhite from './assets/logo-white.png';
import logoBlack from './assets/logo-black.png';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}

interface SystemMetrics {
  cpu_usage: number;
  ram_total: number;
  ram_used: number;
  ram_free: number;
  net_rx_speed: number;
  net_tx_speed: number;
  all_processes: ProcessInfo[];
}

interface HistoryPoint {
  time: string;
  value: number;
}

const MAX_HISTORY_POINTS = 60;

function App() {
  const [isDark, setIsDark] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [cpuHistory, setCpuHistory] = useState<HistoryPoint[]>([]);
  const [ramHistory, setRamHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const unlistenPromise = listen<SystemMetrics>('metrics-update', event => {
      const newMetrics = event.payload;
      const now = new Date().toLocaleTimeString();

      setMetrics(newMetrics);

      setCpuHistory(prev => {
        const newData = [...prev, { time: now, value: newMetrics.cpu_usage }];
        return newData.slice(-MAX_HISTORY_POINTS);
      });

      setRamHistory(prev => {
        const gbUsed = newMetrics.ram_used / (1024 * 1024 * 1024);
        const newData = [...prev, { time: now, value: gbUsed }];
        return newData.slice(-MAX_HISTORY_POINTS);
      });
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    return `${formatBytes(bytesPerSec)}/s`;
  };

  const NavButton = ({ id, label, icon, isActive }: { id: string; label: string; icon: React.ReactNode; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 rounded-lg
        ${isActive ? 'bg-nx-primary/10 text-nx-primary' : 'text-nx-text-secondary hover:text-nx-text-main hover:bg-nx-bg-main/50'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-nx-bg-main text-nx-text-main font-sans select-none overflow-hidden">
      <header className="h-12 bg-nx-surface border-b border-nx-border-subtle flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={isDark ? logoWhite : logoBlack} alt="NEXMON" className="h-6 w-auto" />
          </div>

          <nav className="flex items-center gap-1">
            <NavButton id="dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} isActive={activeTab === 'dashboard'} />
            <NavButton id="resources" label="Resources" icon={<Monitor className="w-4 h-4" />} isActive={activeTab === 'resources'} />
            <NavButton id="processes" label="Processes" icon={<Server className="w-4 h-4" />} isActive={activeTab === 'processes'} />
          </nav>
        </div>

        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-nx-bg-main transition-colors text-nx-text-secondary hover:text-nx-primary">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative bg-nx-bg-secondary">
        {activeTab === 'dashboard' && (
          <DashboardTab
            cpuUsage={metrics?.cpu_usage ?? 0}
            ramUsed={metrics?.ram_used ?? 0}
            ramTotal={metrics?.ram_total ?? 0}
            netRx={metrics?.net_rx_speed ?? 0}
            netTx={metrics?.net_tx_speed ?? 0}
            formatBytes={formatBytes}
            isDark={isDark}
          />
        )}
        {activeTab === 'resources' && <ResourcesTab metrics={metrics} cpuHistory={cpuHistory} ramHistory={ramHistory} formatBytes={formatBytes} formatSpeed={formatSpeed} />}
        {activeTab === 'processes' && <ProcessesTab processes={metrics?.all_processes || []} formatBytes={formatBytes} />}
      </main>

      <footer className="h-7 bg-nx-surface border-t border-nx-border-subtle flex items-center px-4 text-[11px] text-nx-text-muted justify-between shrink-0">
        <div className="flex items-center gap-4">
          {metrics && (
            <>
              <span>CPU: {metrics.cpu_usage.toFixed(0)}%</span>
              <span>RAM: {formatBytes(metrics.ram_used)}</span>
            </>
          )}
        </div>
        <span>v1.0.1</span>
      </footer>
    </div>
  );
}

export default App;

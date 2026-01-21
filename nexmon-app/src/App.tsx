import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Moon, Sun, Activity, Zap, Cpu, ArrowDownUp, Server } from 'lucide-react';
import { AreaChart } from './components/AreaChart';

// --- TYPES ---
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
  top_processes: ProcessInfo[];
}

interface HistoryPoint {
  time: string;
  value: number;
}

const MAX_HISTORY_POINTS = 30;

function App() {
  const [isDark, setIsDark] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

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

  // --- HELPERS ---
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

  return (
    <div className="h-screen w-screen flex flex-col bg-nx-bg-main text-nx-text-main font-sans select-none overflow-hidden">
      {/* HEADER */}
      <header className="h-14 bg-nx-surface border-b border-nx-surface/50 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-nx-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-nx-primary" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">NEXMON</h1>
        </div>

        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-md hover:bg-nx-bg-main transition-colors text-nx-text-secondary hover:text-nx-primary cursor-pointer">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        {/* ROW 1: KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <MetricCard title="CPU Usage" value={metrics ? `${metrics.cpu_usage.toFixed(1)}%` : '...'} icon={<Cpu className="w-4 h-4" />} />
          <MetricCard title="RAM Used" value={metrics ? formatBytes(metrics.ram_used) : '...'} icon={<Zap className="w-4 h-4" />} />
          <MetricCard title="Net Download" value={metrics ? formatSpeed(metrics.net_rx_speed) : '...'} icon={<ArrowDownUp className="w-4 h-4 text-nx-success" />} />
          <MetricCard title="Net Upload" value={metrics ? formatSpeed(metrics.net_tx_speed) : '...'} icon={<ArrowDownUp className="w-4 h-4 text-nx-warning" />} />
        </div>

        {/* ROW 2: CHARTS & PROCESS TABLE */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Charts Column (Takes up 2/3 space on large screens) */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full">
            <div className="flex-1 bg-nx-surface rounded-xl border border-nx-bg-main shadow-sm p-4 flex flex-col min-h-0">
              <AreaChart data={cpuHistory} title="CPU History" colorVar="--primary" unit="%" />
            </div>
            <div className="flex-1 bg-nx-surface rounded-xl border border-nx-bg-main shadow-sm p-4 flex flex-col min-h-0">
              <AreaChart data={ramHistory} title="RAM History (GB)" colorVar="--secondary" unit=" GB" />
            </div>
          </div>

          {/* Processes Column (Takes up 1/3 space) */}
          <div className="bg-nx-surface rounded-xl border border-nx-bg-main shadow-sm p-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Server className="w-4 h-4 text-nx-text-secondary" />
              <h3 className="text-sm font-medium text-nx-text-secondary uppercase tracking-wider">Top Processes</h3>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-nx-surface text-xs text-nx-text-secondary uppercase">
                  <tr>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium text-right">CPU</th>
                    <th className="pb-3 font-medium text-right">Mem</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-nx-bg-main/50">
                  {metrics?.top_processes.map(proc => (
                    <tr key={proc.pid} className="group hover:bg-nx-bg-main/50 transition-colors">
                      <td className="py-2.5 truncate max-w-[120px]" title={proc.name}>
                        <div className="font-medium text-nx-text-main">{proc.name}</div>
                        <div className="text-[10px] text-nx-text-secondary">PID: {proc.pid}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-nx-primary">{proc.cpu.toFixed(1)}%</td>
                      <td className="py-2.5 text-right font-mono text-nx-text-secondary">{formatBytes(proc.memory)}</td>
                    </tr>
                  ))}
                  {!metrics && (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-nx-text-secondary text-xs">
                        Loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-8 bg-nx-surface border-t border-nx-surface/50 flex items-center px-4 text-xs text-nx-text-secondary justify-between shrink-0 transition-colors">
        <span>System: Online</span>
        <span>v0.8.0-beta</span>
      </footer>
    </div>
  );
}

const MetricCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-nx-surface p-4 rounded-xl border border-nx-bg-main shadow-sm transition-all duration-200">
    <div className="flex justify-between items-start mb-2">
      <span className="text-nx-text-secondary text-xs font-medium uppercase tracking-wider">{title}</span>
      <span className="text-nx-primary">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-nx-text-main tabular-nums tracking-tight">{value}</div>
  </div>
);

export default App;

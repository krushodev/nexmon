import { useState, useEffect } from 'react';
import { Moon, Sun, Activity, HardDrive, Cpu, Zap } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="h-screen w-screen flex flex-col bg-nx-bg-main text-nx-text-main font-sans select-none">
      {/* HEADER */}
      <header className="h-14 bg-nx-surface border-b border-nx-surface/50 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-nx-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-nx-primary" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">NEXMON</h1>
        </div>

        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-md hover:bg-nx-bg-main transition-colors text-nx-text-secondary hover:text-nx-primary cursor-pointer" title="Toggle Theme">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* DASHBOARD */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard title="CPU Usage" value="12%" icon={<Cpu className="w-4 h-4" />} />
          <MetricCard title="Memory" value="4.2 GB" icon={<Zap className="w-4 h-4" />} />
          <MetricCard title="Disk I/O" value="120 MB/s" icon={<HardDrive className="w-4 h-4" />} />
          <MetricCard title="Network" value="↓ 20 Mbps" icon={<Activity className="w-4 h-4" />} />
        </div>

        <div className="w-full h-64 bg-nx-surface rounded-xl border border-nx-bg-main shadow-sm p-4 flex items-center justify-center text-nx-text-secondary transition-colors">
          <span className="text-sm">Área reservada para gráficas (Recharts)</span>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-8 bg-nx-surface border-t border-nx-surface/50 flex items-center px-4 text-xs text-nx-text-secondary justify-between shrink-0 transition-colors">
        <span>System: Ready</span>
        <span>v0.1.0-alpha</span>
      </footer>
    </div>
  );
}

const MetricCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-nx-surface p-4 rounded-xl border border-nx-bg-main shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start mb-2">
      <span className="text-nx-text-secondary text-xs font-medium uppercase tracking-wider">{title}</span>
      <span className="text-nx-primary">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-nx-text-main">{value}</div>
  </div>
);

export default App;

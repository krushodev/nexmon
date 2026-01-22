import { AreaChart } from './AreaChart';

interface HistoryPoint {
  time: string;
  value: number;
}

interface ResourceDetailProps {
  type: 'cpu' | 'memory';
  cpuUsage: number;
  cpuHistory: HistoryPoint[];
  memoryUsed: number;
  memoryTotal: number;
  memoryHistory: HistoryPoint[];
  formatBytes: (bytes: number) => string;
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-nx-text-secondary text-sm">{label}</span>
    <span className="text-nx-text-main text-sm font-medium tabular-nums">{value}</span>
  </div>
);

const MemoryBar = ({ used, total, label }: { used: number; total: number; label: string }) => {
  const percent = total > 0 ? (used / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-nx-text-muted">
        <span>{label}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-6 bg-nx-bg-secondary rounded overflow-hidden flex">
        <div className="h-full bg-nx-primary transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export const ResourceDetail: React.FC<ResourceDetailProps> = ({ type, cpuUsage, cpuHistory, memoryUsed, memoryTotal, memoryHistory, formatBytes }) => {
  const memoryFree = memoryTotal - memoryUsed;
  const memoryPercent = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

  if (type === 'cpu') {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-nx-text-main">CPU</h2>
          <span className="text-2xl font-light text-nx-text-secondary">{cpuUsage.toFixed(1)}%</span>
        </div>

        {/* Chart */}
        <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4 mb-6 h-64">
          <AreaChart data={cpuHistory} title="% Utilization" colorVar="--primary" unit="%" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <h4 className="text-xs text-nx-text-muted uppercase tracking-wider mb-3">Performance</h4>
            <StatItem label="Utilization" value={`${cpuUsage.toFixed(1)}%`} />
            <StatItem label="Speed" value="-- GHz" />
            <StatItem label="Processes" value="--" />
            <StatItem label="Threads" value="--" />
          </div>
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <h4 className="text-xs text-nx-text-muted uppercase tracking-wider mb-3">System</h4>
            <StatItem label="Uptime" value="--" />
            <StatItem label="Base speed" value="-- GHz" />
            <StatItem label="Sockets" value="--" />
            <StatItem label="Cores" value="--" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'memory') {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-nx-text-main">Memory</h2>
          <span className="text-2xl font-light text-nx-text-secondary">{formatBytes(memoryTotal)}</span>
        </div>

        {/* Chart */}
        <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4 mb-6 h-64">
          <AreaChart data={memoryHistory} title="Memory usage" colorVar="--secondary" unit=" GB" />
        </div>

        {/* Memory Composition */}
        <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4 mb-6">
          <h4 className="text-xs text-nx-text-muted uppercase tracking-wider mb-4">Memory composition</h4>
          <MemoryBar used={memoryUsed} total={memoryTotal} label="In use" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <p className="text-xs text-nx-text-muted mb-1">In use</p>
            <p className="text-lg font-semibold text-nx-text-main">{formatBytes(memoryUsed)}</p>
          </div>
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <p className="text-xs text-nx-text-muted mb-1">Available</p>
            <p className="text-lg font-semibold text-nx-text-main">{formatBytes(memoryFree)}</p>
          </div>
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <p className="text-xs text-nx-text-muted mb-1">Committed</p>
            <p className="text-lg font-semibold text-nx-text-main">{formatBytes(memoryUsed)}</p>
          </div>
          <div className="bg-nx-surface rounded-xl border border-nx-border-subtle p-4">
            <p className="text-xs text-nx-text-muted mb-1">Usage</p>
            <p className="text-lg font-semibold text-nx-text-main">{memoryPercent.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

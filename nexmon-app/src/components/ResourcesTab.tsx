import { useState } from 'react';
import { ResourcesSidebar, ResourceType } from './ResourcesSidebar';
import { ResourceDetail } from './ResourceDetail';

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

interface ResourcesTabProps {
  metrics: SystemMetrics | null;
  cpuHistory: HistoryPoint[];
  ramHistory: HistoryPoint[];
  formatBytes: (bytes: number) => string;
  formatSpeed: (bytesPerSec: number) => string;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ metrics, cpuHistory, ramHistory, formatBytes }) => {
  const [activeResource, setActiveResource] = useState<ResourceType>('cpu');

  return (
    <div className="h-full flex overflow-hidden">
      <ResourcesSidebar
        activeResource={activeResource}
        onResourceChange={setActiveResource}
        cpuUsage={metrics?.cpu_usage ?? 0}
        cpuName="Processor"
        memoryUsed={metrics?.ram_used ?? 0}
        memoryTotal={metrics?.ram_total ?? 0}
        formatBytes={formatBytes}
      />
      <ResourceDetail
        type={activeResource}
        cpuUsage={metrics?.cpu_usage ?? 0}
        cpuHistory={cpuHistory}
        memoryUsed={metrics?.ram_used ?? 0}
        memoryTotal={metrics?.ram_total ?? 0}
        memoryHistory={ramHistory}
        formatBytes={formatBytes}
      />
    </div>
  );
};

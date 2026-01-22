import { Cpu, MemoryStick } from 'lucide-react';

export type ResourceType = 'cpu' | 'memory';

interface ResourceItemProps {
  type: ResourceType;
  label: string;
  sublabel: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ type, label, sublabel, value, isActive, onClick }) => {
  const getIcon = () => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'cpu':
        return <Cpu className={iconClass} />;
      case 'memory':
        return <MemoryStick className={iconClass} />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 transition-all duration-150
        border-l-2
        ${isActive ? 'bg-nx-primary/5 border-l-nx-primary text-nx-text-main' : 'bg-transparent border-l-transparent text-nx-text-secondary hover:bg-nx-bg-secondary hover:text-nx-text-main'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${isActive ? 'text-nx-primary' : 'text-nx-text-muted'}`}>{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate">{label}</span>
          </div>
          <p className="text-xs text-nx-text-muted truncate mt-0.5">{sublabel}</p>
          <p className={`text-xs mt-1 font-semibold tabular-nums ${isActive ? 'text-nx-primary' : 'text-nx-text-secondary'}`}>{value}</p>
        </div>
      </div>
    </button>
  );
};

interface ResourcesSidebarProps {
  activeResource: ResourceType;
  onResourceChange: (resource: ResourceType) => void;
  cpuUsage: number;
  cpuName: string;
  memoryUsed: number;
  memoryTotal: number;
  formatBytes: (bytes: number) => string;
}

export const ResourcesSidebar: React.FC<ResourcesSidebarProps> = ({ activeResource, onResourceChange, cpuUsage, cpuName, memoryUsed, memoryTotal, formatBytes }) => {
  const memoryPercent = memoryTotal > 0 ? ((memoryUsed / memoryTotal) * 100).toFixed(0) : '0';

  return (
    <div className="w-56 bg-nx-surface border-r border-nx-border-subtle flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <ResourceItem type="cpu" label="CPU" sublabel={cpuName} value={`${cpuUsage.toFixed(0)}%`} isActive={activeResource === 'cpu'} onClick={() => onResourceChange('cpu')} />

        <ResourceItem
          type="memory"
          label="Memory"
          sublabel={`${formatBytes(memoryUsed)}/${formatBytes(memoryTotal)}`}
          value={`${memoryPercent}%`}
          isActive={activeResource === 'memory'}
          onClick={() => onResourceChange('memory')}
        />
      </div>
    </div>
  );
};

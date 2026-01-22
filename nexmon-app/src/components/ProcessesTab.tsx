import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}

interface ProcessesTabProps {
  processes: ProcessInfo[];
  formatBytes: (bytes: number) => string;
}

type SortField = 'name' | 'pid' | 'cpu' | 'memory';
type SortDirection = 'asc' | 'desc';

export const ProcessesTab: React.FC<ProcessesTabProps> = ({ processes, formatBytes }) => {
  const [sortField, setSortField] = useState<SortField>('cpu');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProcesses = useMemo(() => {
    let filtered = processes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = processes.filter(p => p.name.toLowerCase().includes(query) || p.pid.toString().includes(query));
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'pid':
          comparison = a.pid - b.pid;
          break;
        case 'cpu':
          comparison = a.cpu - b.cpu;
          break;
        case 'memory':
          comparison = a.memory - b.memory;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [processes, sortField, sortDirection, searchQuery]);

  const SortableHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <div
      className={`inline-flex items-center gap-1 cursor-pointer hover:text-nx-primary transition-colors select-none ${align === 'right' ? 'flex-row-reverse' : ''}`}
      onClick={() => handleSort(field)}
    >
      <span>{label}</span>
      <span className="w-4 h-4 flex items-center justify-center">{sortField === field && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
    </div>
  );

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0) / (processes.length || 1);
  const totalMemory = processes.reduce((sum, p) => sum + p.memory, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header Stats */}
      <div className="shrink-0 px-6 py-4 bg-nx-surface border-b border-nx-border-subtle rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-nx-text-muted uppercase tracking-wider">CPU</span>
              <p className="text-lg font-semibold text-nx-primary tabular-nums">{totalCpu.toFixed(0)}%</p>
            </div>
            <div>
              <span className="text-xs text-nx-text-muted uppercase tracking-wider">Memory</span>
              <p className="text-lg font-semibold text-nx-secondary tabular-nums">{formatBytes(totalMemory)}</p>
            </div>
            <div>
              <span className="text-xs text-nx-text-muted uppercase tracking-wider">Processes</span>
              <p className="text-lg font-semibold text-nx-text-main tabular-nums">{processes.length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nx-text-muted" />
            <input
              type="text"
              placeholder="Find a process..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-nx-bg-main border border-nx-border rounded-lg text-nx-text-main placeholder:text-nx-text-muted focus:outline-none focus:border-nx-primary focus:ring-1 focus:ring-nx-primary/20 w-64"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-nx-surface rounded">
                <X className="w-3 h-3 text-nx-text-muted" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-nx-surface border border-t-0 border-nx-border-subtle rounded-b-xl">
        <div className="h-full overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-nx-surface text-xs text-nx-text-muted uppercase z-10 border-b border-nx-border-subtle">
              <tr>
                <th className="py-3 px-4 font-medium text-left">
                  <SortableHeader field="name" label="Name" />
                </th>
                <th className="py-3 px-2 font-medium text-center w-20">Status</th>
                <th className="py-3 px-4 font-medium text-right">
                  <SortableHeader field="cpu" label="CPU" align="right" />
                </th>
                <th className="py-3 px-4 font-medium text-right">
                  <SortableHeader field="memory" label="Memory" align="right" />
                </th>
                <th className="py-3 px-4 font-medium text-right w-24">Disk</th>
                <th className="py-3 px-4 font-medium text-right w-24">Network</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedProcesses.map(proc => (
                <tr key={proc.pid} className="border-b border-nx-border-subtle/50 hover:bg-nx-surface-hover transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-nx-bg-secondary flex items-center justify-center text-[10px] text-nx-text-muted font-medium">{proc.name.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-nx-text-main truncate max-w-[200px]" title={proc.name}>
                        {proc.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-nx-success/10">
                      <span className="w-2 h-2 rounded-full bg-nx-success"></span>
                    </span>
                  </td>
                  <td className={`py-2.5 text-right font-mono tabular-nums ${proc.cpu > 10 ? 'text-nx-warning' : proc.cpu > 50 ? 'text-nx-error' : 'text-nx-text-secondary'}`}>
                    {proc.cpu.toFixed(0)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-nx-text-secondary tabular-nums">{formatBytes(proc.memory)}</td>
                  <td className="py-2.5 text-right font-mono text-nx-text-muted tabular-nums">0 MB/s</td>
                  <td className="py-2.5 text-right font-mono text-nx-text-muted tabular-nums">0 Mbps</td>
                </tr>
              ))}
              {sortedProcesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-nx-text-muted text-sm">
                    {searchQuery ? 'No processes found' : 'Loading processes...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

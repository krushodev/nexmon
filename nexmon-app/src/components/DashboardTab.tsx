import { User, Monitor, Cpu, HardDrive, Wifi, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SystemInfo {
  username: string;
  hostname: string;
  os: string;
}

interface DashboardTabProps {
  cpuUsage: number;
  ramUsed: number;
  ramTotal: number;
  netRx: number;
  netTx: number;
  formatBytes: (bytes: number) => string;
  isDark: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ cpuUsage, ramUsed, ramTotal, netRx, netTx, formatBytes, isDark }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    username: 'Loading...',
    hostname: 'Loading...',
    os: 'Loading...'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    invoke<SystemInfo>('get_system_info')
      .then(info => {
        setSystemInfo(info);
      })
      .catch(() => {
        setSystemInfo({
          username: 'User',
          hostname: 'PC',
          os: 'windows'
        });
      });
  }, []);

  const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;

  const CircularProgress = ({ value, color, size = 120 }: { value: number; color: string; size?: number }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-nx-bg-secondary" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    );
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-nx-surface rounded-2xl border border-nx-border-subtle p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-gradient-to-br from-white to-[#8b949e]' : 'bg-gradient-to-br from-black to-[#495057]'}`}>
                <User className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-nx-text-main">Welcome, {systemInfo.username}</h1>
                <p className="text-sm text-nx-text-secondary flex items-center gap-2 mt-0.5">
                  <Monitor className="w-3.5 h-3.5" />
                  {systemInfo.hostname} • {systemInfo.os}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-light text-nx-text-main tabular-nums">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs text-nx-text-muted flex items-center gap-1 justify-end mt-1">
                <Calendar className="w-3 h-3" />
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU Card */}
          <div className="bg-nx-surface rounded-2xl border border-nx-border-subtle p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-nx-primary" />
                <h3 className="font-medium text-nx-text-main">Processor</h3>
              </div>
              <span className="text-xs text-nx-text-muted uppercase tracking-wider">CPU</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <CircularProgress value={cpuUsage} color="var(--primary)" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-nx-text-main tabular-nums">{cpuUsage.toFixed(0)}</span>
                  <span className="text-xs text-nx-text-muted">%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-nx-border-subtle">
              <div className="flex justify-between text-sm">
                <span className="text-nx-text-muted">Status</span>
                <span className={`font-medium ${cpuUsage > 80 ? 'text-nx-error' : cpuUsage > 50 ? 'text-nx-warning' : 'text-nx-success'}`}>
                  {cpuUsage > 80 ? 'High' : cpuUsage > 50 ? 'Moderate' : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-nx-surface rounded-2xl border border-nx-border-subtle p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-nx-secondary" />
                <h3 className="font-medium text-nx-text-main">Memory</h3>
              </div>
              <span className="text-xs text-nx-text-muted uppercase tracking-wider">RAM</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <CircularProgress value={ramPercent} color="var(--secondary)" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-nx-text-main tabular-nums">{ramPercent.toFixed(0)}</span>
                  <span className="text-xs text-nx-text-muted">%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-nx-border-subtle">
              <div className="flex justify-between text-sm">
                <span className="text-nx-text-muted">Used / Total</span>
                <span className="font-medium text-nx-text-main tabular-nums">
                  {formatBytes(ramUsed)} / {formatBytes(ramTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="bg-nx-surface rounded-2xl border border-nx-border-subtle p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wifi className="w-5 h-5 text-nx-text-secondary" />
            <h3 className="font-medium text-nx-text-main">Network</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-nx-success/10 flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-nx-success" />
              </div>
              <div>
                <p className="text-xs text-nx-text-muted uppercase tracking-wider">Download</p>
                <p className="text-xl font-semibold text-nx-text-main tabular-nums">{formatBytes(netRx)}/s</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-nx-warning/10 flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-nx-warning" />
              </div>
              <div>
                <p className="text-xs text-nx-text-muted uppercase tracking-wider">Upload</p>
                <p className="text-xl font-semibold text-nx-text-main tabular-nums">{formatBytes(netTx)}/s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

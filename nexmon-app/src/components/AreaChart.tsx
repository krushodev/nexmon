import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  colorVar: string; // Ej: "--primary" o "--secondary"
  title: string;
  unit?: string;
}

export const AreaChart = ({ data, colorVar, title, unit = '%' }: AreaChartProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-nx-text-secondary uppercase tracking-wider mb-4 px-2">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(${colorVar})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(${colorVar})`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-surface)" opacity={0.5} />
            <XAxis dataKey="time" hide={true} />
            <YAxis hide={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} domain={[0, 'auto']} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: `var(${colorVar})` }}
              formatter={(value: number | undefined) => [`${value?.toFixed(1)}${unit}`, title]}
              labelStyle={{ display: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`var(${colorVar})`}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${title})`}
              isAnimationActive={false} // Desactivar animación inicial para mejor performance en updates rápidos
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

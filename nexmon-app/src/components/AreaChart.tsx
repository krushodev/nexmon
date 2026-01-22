import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useEffect, useState } from 'react';

interface DataPoint {
  time: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  colorVar: string;
  title: string;
  unit?: string;
}

export const AreaChart = ({ data, colorVar, title, unit = '%' }: AreaChartProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Paleta de colores - Tema claro (minimalista blanco y negro)
  const lightColors = {
    primary: '#212529', // Negro suave
    secondary: '#495057', // Gris medio
    accent: '#343a40', // Gris oscuro
    grid: '#e9ecef', // Gris muy claro
    text: '#212529', // Negro principal
    textSecondary: '#495057', // Gris secundario
    tooltipBg: '#ffffff',
    tooltipBorder: '#dee2e6', // Borde gris
    tooltipText: '#212529'
  };

  // Paleta de colores - Tema oscuro (minimalista)
  const darkColors = {
    primary: '#ffffff', // Blanco
    secondary: '#c9d1d9', // Gris claro
    accent: '#8b949e', // Gris medio
    grid: '#30363d', // Gris oscuro
    text: '#f0f6fc', // Blanco brillante
    textSecondary: '#c9d1d9', // Gris claro
    tooltipBg: '#0d1117', // Fondo oscuro
    tooltipBorder: '#30363d', // Borde gris
    tooltipText: '#f0f6fc'
  };

  const colors = isDark ? darkColors : lightColors;

  const getColorValue = (colorVar: string) => {
    switch (colorVar) {
      case '--primary':
        return colors.primary;
      case '--secondary':
        return colors.secondary;
      case '--accent':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const color = getColorValue(colorVar);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-medium text-nx-text-secondary uppercase tracking-wider mb-4 px-2">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={colors.grid} opacity={0.4} />
            <XAxis dataKey="time" hide={true} />
            <YAxis
              hide={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: colors.textSecondary,
                fontSize: 11,
                fontFamily: 'Segoe UI, system-ui, sans-serif'
              }}
              domain={[0, 'dataMax + 5']}
              width={35}
              tickCount={4}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                borderColor: colors.tooltipBorder,
                color: colors.tooltipText,
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'Segoe UI, system-ui, sans-serif',
                border: '1px solid ' + colors.tooltipBorder,
                boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '8px 12px'
              }}
              itemStyle={{
                color: color,
                fontWeight: '500'
              }}
              formatter={(value: number | undefined) => [`${value?.toFixed(1)}${unit}`, title]}
              labelStyle={{ display: 'none' }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#gradient-${title})`} isAnimationActive={false} />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

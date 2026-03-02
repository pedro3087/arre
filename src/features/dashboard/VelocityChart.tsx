import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

interface VelocityChartProps {
  data: { day: string; completion: number }[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  const strokeColor = 'var(--accent-cyan)';

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '120px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            cursor={{ stroke: 'var(--text-tertiary)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area 
            type="monotone" 
            dataKey="completion" 
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVelocity)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

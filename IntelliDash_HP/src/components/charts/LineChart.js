import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import HorrorTooltip from './Tooltip';

export default function LinePlot({ data, chartSpec, theme }) {
  const secondaryColor = theme?.secondaryColor || '#a78bfa';
  const accentColor = theme?.accentColor || '#f472b6';
  const textSecondary = theme?.textSecondary || 'rgba(255, 255, 255, 0.6)';
  const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  return <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(167, 139, 250, 0.1)" />
      <XAxis
        dataKey="x"
        tick={{ fontSize: '0.5rem', fill: textSecondary, fontFamily }}
        stroke={textSecondary}
      />
      <YAxis
        tick={{ fontSize: '0.5rem', fill: textSecondary, fontFamily }}
        stroke={textSecondary}
      />
      <Tooltip content={(props) => <HorrorTooltip {...props} theme={theme} />} />
      <Legend wrapperStyle={{ color: textSecondary, fontSize: '0.8rem', fontFamily }} />
      <Line
        type="monotone"
        dataKey="y"
        stroke={`url(#lineGradient)`}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
        name={chartSpec.y}
      />
      <defs>
        <linearGradient id="lineGradient">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>
    </LineChart>
  </ResponsiveContainer>
}

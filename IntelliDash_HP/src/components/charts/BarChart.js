import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import HorrorTooltip from './Tooltip'


export default function BarPlot({ data, chartSpec, theme }) {
  const primaryColor = theme?.primaryColor || '#60a5fa';
  const primaryDark = theme?.primaryDark || '#3b82f6';
  const textSecondary = theme?.textSecondary || 'rgba(255, 255, 255, 0.6)';
  const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.1)" />
      <XAxis
        dataKey="x"
        stroke={textSecondary}
        tick={{ fill: textSecondary, fontSize: '0.5rem', fontFamily }}
      />
      <YAxis
        stroke={textSecondary}
        tick={{ fill: textSecondary, fontSize: '0.5rem', fontFamily }}
      />
      <Tooltip content={(props) => <HorrorTooltip {...props} theme={theme} />} />
      <Legend
        wrapperStyle={{ color: textSecondary, fontSize: '0.8rem', fontFamily }}
      />
      <Bar
        isAnimationActive={false}
        dataKey="y"
        fill={`url(#barGradient)`}
        name={chartSpec.y}
        radius={[8, 8, 0, 0]}
      />
      <defs>
        <linearGradient id="barGradient">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={primaryDark} />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
}

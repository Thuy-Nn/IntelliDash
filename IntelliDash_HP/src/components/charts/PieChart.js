import {
  PieChart, Pie, Sector, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import HorrorTooltip from './Tooltip'


export default function PiePlot({ data, chartSpec, theme }) {
  const textSecondary = theme?.textSecondary || 'rgba(255, 255, 255, 0.6)';
  const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

  const MyCustomPie = (props) => {
    return <Sector {...props} fill={COLORS[props.index % COLORS.length]} />;
  }

  return <ResponsiveContainer width="100%" height="100%">
    <PieChart data={data}>
      <Tooltip content={(props) => <HorrorTooltip {...props} theme={theme} />} />
      <Legend formatter={(value, entry, i) => (
        <span style={{ color: COLORS[i % COLORS.length], fontSize: '0.8rem', fontFamily }}>{value}</span>
      )}
        // wrapperStyle={{ color: textSecondary, fontSize: '0.8rem', fontFamily }}
      />
      <Pie
        isAnimationActive={false}
        dataKey="y"
        name={chartSpec.y}
        outerRadius="80%"
        shape={MyCustomPie}
        label={renderCustomizedLabel}
        labelLine={false}
      />
    </PieChart>
  </ResponsiveContainer>
}

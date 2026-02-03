import {
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import HorrorTooltip from './Tooltip';


export default function ScatterPlot({ data, chartSpec, theme }) {
  return <ResponsiveContainer width="100%" height="100%">
    <ScatterChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 113, 113, 0.1)" />
      <XAxis
        dataKey="x"
        name={chartSpec.x}
        type="number"
        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
        stroke="rgba(255, 255, 255, 0.3)"
      />
      <YAxis
        dataKey="y"
        name={chartSpec.y}
        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
        stroke="rgba(255, 255, 255, 0.3)"
      />
      <Tooltip content={HorrorTooltip} />
      <Legend wrapperStyle={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }} />
      <Scatter
        isAnimationActive={false}
        name={chartSpec.y}
        data={data}
        fill="#f87171"
        fillOpacity={0.5}
      />
    </ScatterChart>
  </ResponsiveContainer>
}

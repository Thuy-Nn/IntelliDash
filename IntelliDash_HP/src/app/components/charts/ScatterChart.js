import {
    ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


export default function ScatterPlot({commonProps, chart, chartData}){
    return <ResponsiveContainer width="100%" height="100%">
                <ScatterChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 113, 113, 0.1)" />
                    <XAxis 
                        dataKey="x" 
                        name={chart.x}
                        type="number"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
                        stroke="rgba(255, 255, 255, 0.3)"
                    />
                    <YAxis 
                        dataKey="y" 
                        name={chart.y}
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
                        stroke="rgba(255, 255, 255, 0.3)"
                    />
                    <Tooltip content={HorrorTooltip}/>
                    <Legend wrapperStyle={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }} />
                    <Scatter 
                        isAnimationActive={false}
                        name={chart.y} 
                        data={chartData} 
                        fill="#f87171"
                        fillOpacity={0.5}
                    />
                </ScatterChart>
            </ResponsiveContainer>
}

const HorrorTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
            style={{
                background: 'rgba(167, 139, 250, 0.6)',
                border: '1px solid  rgba(167, 139, 250, 0.3)',
                boxShadow: '0 12px 36px rgba(167, 139, 250, 0.15)',
                padding: '0.5rem 0.5rem',
                fontSize: '0.7rem',
                color: '#white',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                letterSpacing: '0.05em'
            }}
        >
            {/* <div style={{ color: '#ef4444', marginBottom: '4px' }}>
                {label}
            </div> */}
            <div>
                {payload[0].name}: <strong>{payload[0].value}</strong>
            </div>
            <div>
                {payload[1].name}: <strong>{payload[1].value}</strong>
            </div>
        </div>
        )
    };

}

import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'


export default function BarPlot({commonProps, chart}) {
    return <ResponsiveContainer width="100%" height="100%">
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.1)" />
                    <XAxis 
                        dataKey="x" 
                        stroke="rgba(255, 255, 255, 0.3)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
                    />
                    <YAxis 
                        stroke="rgba(255, 255, 255, 0.3)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: '0.5rem' }}
                    />
                    <Tooltip content={HorrorTooltip}/>
                    <Legend 
                        wrapperStyle={{ color: 'rgba(255, 255, 255, 0.8)', fontSize:'0.8rem'}}
                    />
                    <Bar 
                        isAnimationActive={false}
                        dataKey="y" 
                        fill="url(#barGradient)" 
                        name={chart.y}
                        radius={[8, 8, 0, 0]}
                    />
                    <defs>
                        <linearGradient id="barGradient">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </BarChart>
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
        </div>
        )
    };

}


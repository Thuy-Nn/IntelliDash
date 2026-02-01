import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function LinePlot({commonProps, chart, theme}) {
    const secondaryColor = theme?.secondaryColor || '#a78bfa';
    const accentColor = theme?.accentColor || '#f472b6';
    const textSecondary = theme?.textSecondary || 'rgba(255, 255, 255, 0.6)';
    const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    return <ResponsiveContainer width="100%" height="100%">
                <LineChart {...commonProps}>
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
                    <Tooltip content={(props) => <HorrorTooltip {...props} theme={theme} />}/>
                    <Legend wrapperStyle={{ color: textSecondary, fontSize:'0.8rem', fontFamily }} />
                    <Line 
                        type="monotone" 
                        dataKey="y" 
                        stroke={`url(#lineGradient)`} 
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                        name={chart.y}
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

const HorrorTooltip = ({ active, payload, label, theme }) => {
    const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
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
                fontFamily: fontFamily,
                letterSpacing: '0.05em'
            }}
        >
            <div style={{ color: '#white', marginBottom: '4px' }}>
                {label}
            </div>
            <div>
                {payload[0].name}: <strong>{payload[0].value}</strong>
            </div>
        </div>
        )
    };

}


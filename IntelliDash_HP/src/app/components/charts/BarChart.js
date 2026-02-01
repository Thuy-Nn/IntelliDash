import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'


export default function BarPlot({commonProps, chart, theme}) {
    const primaryColor = theme?.primaryColor || '#60a5fa';
    const primaryDark = theme?.primaryDark || '#3b82f6';
    const textSecondary = theme?.textSecondary || 'rgba(255, 255, 255, 0.6)';
    const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    return <ResponsiveContainer width="100%" height="100%">
                <BarChart {...commonProps}>
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
                    <Tooltip content={(props) => <HorrorTooltip {...props} theme={theme} />}/>
                    <Legend 
                        wrapperStyle={{ color: textSecondary, fontSize:'0.8rem', fontFamily }}
                    />
                    <Bar 
                        isAnimationActive={false}
                        dataKey="y" 
                        fill={`url(#barGradient)`} 
                        name={chart.y}
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

const HorrorTooltip = ({ active, payload, label, theme }) => {
    const secondaryColor = theme?.secondaryColor || '#a78bfa';
    const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    if (active && payload && payload.length) {
        return (
            <div
            style={{
                background: `rgba(167, 139, 250, 0.6)`,
                border: `1px solid rgba(167, 139, 250, 0.3)`,
                boxShadow: '0 12px 36px rgba(167, 139, 250, 0.15)',
                padding: '0.5rem 0.5rem',
                fontSize: '0.7rem',
                color: '#white',
                fontFamily: fontFamily,
                letterSpacing: '0.05em'
            }}
        >
            <div>
                {payload[0].name}: <strong>{payload[0].value}</strong>
            </div>
        </div>
        )
    };

}


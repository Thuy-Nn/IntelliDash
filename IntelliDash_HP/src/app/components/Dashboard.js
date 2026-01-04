"use client";

import styles from '../styles/Dashboard.module.css';
import React, { useEffect, useState } from 'react';

import BarPlot from './charts/BarChart';
import LinePlot from './charts/LineChart';
import ScatterPlot from './charts/ScatterChart';


const DEFAULT_CHART_SIZE = {
    'text': [1, 1],
    'bar': [2, 2],
    'line': [2, 2],
    'scatter': [2, 2],
}

export default function Dashboard(props) {    
    const [loading, setLoading] = useState(true);
    // const [gridSize, setGridSize] = useState([6, 4])
    const [chartsList, setChartsList] = useState([]);

    useEffect(() => {
        const loadVisualizationData = async () => {
            try {
                console.log('Fetching visualization data...');
                const response = await fetch('/visualization_output.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const charts = await response.json();
                console.log('Data loaded successfully:', charts.length, 'charts');

                for (let i = 0; i < charts.length; i++) {
                    charts[i].size = DEFAULT_CHART_SIZE[charts[i].chart.type] || [1, 1];
                }

                setChartsList(charts);
                setLoading(false);
            } catch (error) {
                console.error('Error loading visualization data:', error);
                setLoading(false);
            }
        };

        loadVisualizationData();
    }, []);

    
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading your analytics...</p>
            </div>
        );
    }
    
    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.title}>Analytics Dashboard</h1>
                <p className={styles.subtitle}>Real-time insights and data visualization</p>
            </div>
            
            <div className={styles.chartsGrid}>
                {chartsList.map((c, i) => (
                    <div
                        key={i}
                        className={styles.chartCard}
                        style={{
                            gridColumn: `span ${c.size[0]}`,
                            gridRow: `span ${c.size[1]}`
                        }}
                        >
                        <div className={styles.chartHeader}>
                                <h2 className={styles.chartTitle}>{c.chart.title}</h2>
                        </div>
                        <div className={styles.chartContent}>
                            {renderChart(c)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const parseDDMMYYYY = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const isDDMMYYYY = (value) => {
    return typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value);
};

const transformDataForChart = (chart) => {
    const { values } = chart;
    const chartData = [];

    if (values.x && values.y) {
        for (let i = 0; i < values.x.length; i++) {
            chartData.push({
                x: values.x[i],
                y: values.y[i]
            });
        }
    }

    const isDateAxis = isDDMMYYYY(values.x[0]);

    if (isDateAxis) {
        chartData.sort((a, b) => {
            const dateA = parseDDMMYYYY(a.x);
            const dateB = parseDDMMYYYY(b.x);
            return dateA - dateB;
        });
    }
    
    return chartData;
    };

const renderChart = (visualization) => {
    const { chart, values } = visualization;
    const chartData = transformDataForChart(visualization);

    if (!chartData || chartData.length === 0) {
        return null;
    }

    const commonProps = {
        data: chartData
    };

    switch (chart.type) {
        case 'line':
            return <LinePlot commonProps={commonProps} chart={chart}/>;
        case 'bar':
            return <BarPlot commonProps={commonProps} chart={chart}/>;
        case 'scatter':
            return <ScatterPlot commonProps={commonProps} chart={chart} chartData={chartData}/>;
                
        default:
            return null;
    }
};

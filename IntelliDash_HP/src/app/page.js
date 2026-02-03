"use client"

import { useEffect, useState } from 'react'
import styles from '../styles/Dashboard.module.css'


import { useTheme } from './ThemeContext'
import BarPlot from '../components/charts/BarChart'
import LinePlot from '../components/charts/LineChart'
import PiePlot from '../components/charts/PieChart'
import ScatterPlot from '../components/charts/ScatterChart'
import SingleValueChart from '../components/charts/SingleValueChart'
import IconButton from '../components/IconButton'
import SaveLayoutPanel from '../components/SaveLayoutPanel'
import SettingsPanel from '../components/SettingsPanel'
import UploadFilePanel from '../components/UploadFilePanel'


const DEFAULT_CHART_SIZE = {
  'single_value': [2, 1],
  'text': [2, 1],
  'bar': [2, 2],
  'line': [2, 2],
  'scatter': [2, 2],
  'pie': [2, 2],
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [chartsList, setChartsList] = useState([])
  const [chartSizes, setChartSizes] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [uploadFilePanelOpen, setUploadFilePanelOpen] = useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [saveLayoutPanelOpen, setSaveLayoutPanelOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const loadVisualizationData = async () => {
      try {
        console.log('Fetching visualization data...')
        const response = await fetch('/visualization_output.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const charts = await response.json()
        console.log('Data loaded successfully:', charts.length, 'charts')

        for (let i = 0; i < charts.length; i++) {
          charts[i].size = DEFAULT_CHART_SIZE[charts[i].chart.type] || [2, 1]
        }

        // reduce scatter plots for initial load test
        // for (let i = 0; i < charts.length; i++) {
        //     if (charts[i].chart.type === 'scatter') {
        //         charts[i].values.x = charts[i].values.x.slice(0, 200)
        //         charts[i].values.y = charts[i].values.y.slice(0, 200)
        //     }
        // }

        setChartsList(charts)
        // setChartsList(charts.filter(c => c.chart.type !== 'scatter'))
        setLoading(false)
      } catch (error) {
        console.error('Error loading visualization data:', error)
        setLoading(false)
      }
    }

    loadVisualizationData()
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your analytics...</p>
      </div>
    )
  }

  const handleChartResizeWidth = (index, width) => {
    setChartSizes(prev => {
      const current = prev[index] || DEFAULT_CHART_SIZE[chartsList[index].chart.type]
      //..prev is to keep other charts' sizes unchanged
      return { ...prev, [index]: [width, current[1]] }
    })
  }

  const handleChartResizeHeight = (index, height) => {
    setChartSizes(prev => {
      const current = prev[index] || DEFAULT_CHART_SIZE[chartsList[index].chart.type]
      return { ...prev, [index]: [current[0], height] }
    })
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    // dataTransfer is required for drag and drop to work
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    //can not drop by default
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newChartsList = [...chartsList]
    //function slice is for copy items and splice is change the array
    //array.splice(start, deleteCount, item1, item2, ...)
    const [draggedChart] = newChartsList.splice(draggedIndex, 1)
    newChartsList.splice(targetIndex, 0, draggedChart)

    // Swap sizes as well
    const newChartSizes = { ...chartSizes }
    const tempSize = newChartSizes[draggedIndex]
    newChartSizes[draggedIndex] = newChartSizes[targetIndex]
    newChartSizes[targetIndex] = tempSize

    setChartsList(newChartsList)
    setChartSizes(newChartSizes)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    //secure way to reset dragged index if drop not triggered
    setDraggedIndex(null)
  }

  const getFontWeightValue = () => {
    if (theme.fontWeight === 'light') return 300
    if (theme.fontWeight === 'bold') return 700
    return 400
  }

  const getFontSizeMultiplier = () => {
    if (theme.fontSize === 'small') return 0.9
    if (theme.fontSize === 'large') return 1.15
    return 1
  }


  return (
    <div
      className={styles.dashboardContainer}
      style={{
        '--primary-color': theme.primaryColor,
        '--primary-dark': theme.primaryDark,
        '--secondary-color': theme.secondaryColor,
        '--accent-color': theme.accentColor,
        '--text-color': theme.textColor,
        '--text-secondary': theme.textSecondary,
        '--font-family': theme.fontFamily,
        '--font-weight': getFontWeightValue(),
        '--font-size-multiplier': getFontSizeMultiplier(),
      }}
    >
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{theme.dashboardName}</h1>
            <p className={styles.subtitle}>{theme.dashboardDesc}</p>
          </div>
          <div className={styles.buttonGroup}>
            <IconButton
              iconClass={editMode ? "icon-check-circle" : "icon-edit-2"}
              label={editMode ? "Done" : "Edit"} title={editMode ? "Exit edit mode" : "Enter edit mode"}
              onClick={() => setEditMode(!editMode)}
            />
            <IconButton iconClass="icon-file-plus" label="New" title="Create a new dashboard"
              onClick={() => setUploadFilePanelOpen(!uploadFilePanelOpen)} />
            <IconButton iconClass="icon-bookmark" label="Save" title="Save the current layout"
              onClick={() => setSaveLayoutPanelOpen(!saveLayoutPanelOpen)} />
            <IconButton iconClass="icon-settings" label="Settings" title="Customize colors and fonts"
              onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
            />
          </div>
        </div>
      </div>

      <UploadFilePanel isOpen={uploadFilePanelOpen} onClose={() => setUploadFilePanelOpen(false)} />
      <SettingsPanel isOpen={settingsPanelOpen} onClose={() => setSettingsPanelOpen(false)} />
      <SaveLayoutPanel isOpen={saveLayoutPanelOpen} onClose={() => setSaveLayoutPanelOpen(false)} />

      <div className={styles.chartsGrid}>
        {chartsList.map((c, i) => {
          const size = chartSizes[i] || DEFAULT_CHART_SIZE[c.chart.type] || [1, 1]
          return (
            <div
              key={i}
              className={`${styles.chartCard} ${editMode ? styles.chartCardDraggable : ''} ${draggedIndex === i ? styles.chartCardDragging : ''}`}
              style={{
                gridColumn: `span ${size[0]}`,
                gridRow: `span ${size[1]}`
              }}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>{c.chart.title}</h2>
                {editMode && (
                  <div className={styles.resizeControls}>
                    <div className={styles.resizeGroup}>
                      <label className={styles.resizeLabel}>W:</label>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeWidth(i, Math.max(size[0] - 1, 1))}
                        disabled={size[0] <= 1}
                      >
                        −
                      </button>
                      <span className={styles.sizeValue}>{size[0]}</span>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeWidth(i, Math.min(size[0] + 1, 6))}
                        disabled={size[0] >= 6}
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.resizeGroup}>
                      <label className={styles.resizeLabel}>H:</label>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeHeight(i, Math.max(size[1] - 1, 1))}
                        disabled={size[1] <= 1}
                      >
                        −
                      </button>
                      <span className={styles.sizeValue}>{size[1]}</span>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeHeight(i, Math.min(size[1] + 1, 6))}
                        disabled={size[1] >= 6}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.chartContent}>
                {renderChart(c, theme)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper functions
const parseDDMMYYYY = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const isDDMMYYYY = (value) => {
  return typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)
}

const transformDataForChart = ({ chart, values }) => {
  if (chart.type === 'single_value') {
    return values.value
  }

  const chartData = []

  if (values.x && values.y) {
    for (let i = 0; i < values.x.length; i++) {
      chartData.push({
        x: values.x[i],
        y: values.y[i]
      })
    }
  }

  const isDateAxis = isDDMMYYYY(values.x[0])

  if (isDateAxis) {
    chartData.sort((a, b) => {
      const dateA = parseDDMMYYYY(a.x)
      const dateB = parseDDMMYYYY(b.x)
      return dateA - dateB
    })
  }

  return chartData
}


const renderChart = (chartVizInfo, theme) => {
  const { chart, values } = chartVizInfo
  const chartData = transformDataForChart(chartVizInfo)

  if (!chartData || chartData.length === 0) {
    return null
  }

  switch (chart.type) {
    case 'single_value':
      return <SingleValueChart valueData={values} chartSpec={chart} theme={theme} />
    case 'line':
      return <LinePlot data={chartData} chartSpec={chart} theme={theme} />
    case 'bar':
      return <BarPlot data={chartData} chartSpec={chart} theme={theme} />
    case 'scatter':
      return <ScatterPlot data={chartData} chartSpec={chart} theme={theme} />
    case 'pie':
      return <PiePlot data={chartData} chartSpec={chart} theme={theme} />
    default:
      return null
  }
}
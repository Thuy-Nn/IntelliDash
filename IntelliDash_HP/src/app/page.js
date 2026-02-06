"use client"

import { useState, useRef } from 'react'
import BarPlot from '../components/charts/BarChart'
import LinePlot from '../components/charts/LineChart'
import PiePlot from '../components/charts/PieChart'
import ScatterPlot from '../components/charts/ScatterChart'
import SingleValueChart from '../components/charts/SingleValueChart'
import IconButton from '../components/IconButton'
import SaveLayoutPanel from '../components/SaveLayoutPanel'
import SettingsPanel from '../components/SettingsPanel'
import UploadFilePanel from '../components/UploadFilePanel'
import styles from '../styles/Dashboard.module.css'
import { useTheme } from './ThemeContext'
import { useScreenshot } from '@/components/useScreenshot'


const DEFAULT_CHART_SIZE = {
  'single_value': [1, 1],
  'text': [1, 1],
  'bar': [1, 2],
  'line': [1, 2],
  'scatter': [1, 2],
  'pie': [1, 2],
}

const GRID_COLUMNS = 3
const GRID_ROWS = 6

export default function Dashboard() {
  const [chartsList, setChartsList] = useState([])
  const [chartSizes, setChartSizes] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [uploadFilePanelOpen, setUploadFilePanelOpen] = useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [saveLayoutPanelOpen, setSaveLayoutPanelOpen] = useState(false)
  const { theme, updateTheme } = useTheme()

  const ref = useRef(null)
  const [screenshotImage, takeScreenshot] = useScreenshot()

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

  const onUploadFilePanelClose = (newDashboardData) => {
    setUploadFilePanelOpen(false)
    if (newDashboardData) {
      const newCharts = newDashboardData.dashboard || []
      setChartsList(prev => [...prev, ...newCharts])
    }
  }

  const openSaveLayoutPanel = () => {
    takeScreenshot(ref.current, { backgroundColor: '#0f172a', scale: 0.2 })
    setSaveLayoutPanelOpen(true)
  }

  const loadDashboard = (data) => {
    const { chartsList: loadedCharts, chartSizes: loadedSizes } = data.chartData
    setChartsList(loadedCharts)
    setChartSizes(loadedSizes)
    updateTheme(data.theme)

    if (uploadFilePanelOpen) setUploadFilePanelOpen(false)
    if (saveLayoutPanelOpen) setSaveLayoutPanelOpen(false)
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
      {chartsList.length === 0 ? <div className={styles.emptyStateOuter}>
        <span className={styles.emptyStateTitle}>IntelliDash</span>
        <div className={styles.emptyStateInner}>
          <img src="/images/missing_dashboard.png" alt="No charts" className={styles.emptyStateImage} />
          <p className={styles.emptyStateText}>No charts to display.</p>
          <IconButton label="New Dashboard" title="Create a new dashboard"
            onClick={() => setUploadFilePanelOpen(!uploadFilePanelOpen)} />
        </div>
      </div>
        :
        <div className={styles.headerSection}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>{theme.dashboardName}</h1>
              <p className={styles.subtitle}>{theme.dashboardDesc}</p>
            </div>
            <div className={styles.buttonGroup}>
              <button className={'icon-menu ' + styles.menuIcon} />
              <div className={styles.menuOuter}>
                <div className={styles.menuInner}>
                  <IconButton
                    iconClass={editMode ? "icon-check-circle" : "icon-edit-2"}
                    label={editMode ? "Done" : "Edit"} title={editMode ? "Exit edit mode" : "Enter edit mode"}
                    onClick={() => setEditMode(!editMode)}
                  />
                  <IconButton iconClass="icon-file-plus" label="New" title="Create a new dashboard"
                    onClick={() => setUploadFilePanelOpen(!uploadFilePanelOpen)} />
                  <IconButton iconClass="icon-bookmark" label="Save" title="Save the current layout"
                    onClick={openSaveLayoutPanel} />
                  <IconButton iconClass="icon-settings" label="Settings" title="Customize colors and fonts"
                    onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      {chartsList.length && <div className={styles.chartGridOuter}>
        <div className={styles.chartsGrid} ref={ref}>
          {chartsList.map((c, i) => {
            const size = chartSizes[i] || DEFAULT_CHART_SIZE[c.chart.type] || [1, 1]
            return <div
              key={i}
              className={`${styles.chartCard} ${styles[`chartCard__${c.chart.type}`]} ${editMode ? styles.chartCardDraggable : ''} ${draggedIndex === i ? styles.chartCardDragging : ''}`}
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
                        -
                      </button>
                      <span className={styles.sizeValue}>{size[0]}</span>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeWidth(i, Math.min(size[0] + 1, GRID_COLUMNS))}
                        disabled={size[0] >= GRID_COLUMNS}
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
                        -
                      </button>
                      <span className={styles.sizeValue}>{size[1]}</span>
                      <button
                        className={styles.resizeBtn}
                        onClick={() => handleChartResizeHeight(i, Math.min(size[1] + 1, GRID_ROWS))}
                        disabled={size[1] >= GRID_ROWS}
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
          })}
        </div>
      </div>}

      <UploadFilePanel isOpen={uploadFilePanelOpen} onClose={onUploadFilePanelClose} onDashboardLoad={loadDashboard} />
      <SaveLayoutPanel data={{ chartsList, chartSizes }} thumb={screenshotImage} onDashboardLoad={loadDashboard}
        isOpen={saveLayoutPanelOpen} onClose={() => setSaveLayoutPanelOpen(false)} />
      <SettingsPanel isOpen={settingsPanelOpen} onClose={() => setSettingsPanelOpen(false)} />
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
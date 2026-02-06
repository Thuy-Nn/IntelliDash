'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../app/ThemeContext'
import IconButton from './IconButton'
import OpenDashboardsView from './OpenDashboardsView'
import Panel from './Panel'
import PanelSection from './PanelSection'


export default function SaveLayoutPanel({ data, thumb, isOpen, onClose, onDashboardLoad }) {
  const { theme } = useTheme()
  const [layoutName, setLayoutName] = useState(theme.dashboardName || '')
  const [triggerCounter, setTriggerCounter] = useState(0)  // to trigger useEffect when data changes

  useEffect(() => {
    // auto focus input when panel opens
    if (isOpen) {
      const input = document.querySelector('input[type="text"]')
      if (input) input.focus()
    }
  }, [isOpen])

  const onNameChange = (e) => {
    setLayoutName(e.target.value)
  }

  const saveLayout = (e) => {
    e.preventDefault()

    // Save the current dashboard layout to localStorage
    const layoutData = {
      name: layoutName,
      chartData: data,
      createdAt: new Date().toISOString(),
      theme,
      thumb
    }
    localStorage.setItem(`dashboard_${layoutName}`, JSON.stringify(layoutData))
    setLayoutName('')
    setTriggerCounter(triggerCounter + 1)  // trigger useEffect in OpenDashboardsView to reload dashboards
    // onClose()
  }

  return <Panel title="Save Layout" isOpen={isOpen} onClose={onClose}>
    {thumb && <div className='text-center mb-4'>
      <img className='inline-block w-32 border-border border-2' src={thumb} alt="Dashboard Thumbnail" />
    </div>}
    <form onSubmit={saveLayout} className="mb-8">
      <span className='input-label'>Name your layout</span>
      <input type="text" required value={layoutName} placeholder="Enter layout name..."
        onChange={onNameChange} />
      <div className="button-group">
        <IconButton type="submit" label="Save" />
      </div>
    </form>

    <PanelSection title="Existing Layouts" iconClass="icon-bookmark" expanded={true} expandable={false}>
      <OpenDashboardsView key={triggerCounter} onDashboardLoad={onDashboardLoad} />
    </PanelSection>
  </Panel>
}



'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../app/ThemeContext'
import IconButton from './IconButton'
import OpenDashboardsView from './OpenDashboardsView'
import Panel from './Panel'
import PanelSection from './PanelSection'


export default function SaveLayoutPanel({ isOpen, onClose }) {
    const { theme } = useTheme()
    const [dashboardName, setDashboardName] = useState(theme.dashboardName || '')

    useEffect(() => {
        // auto focus input when panel opens
        if (isOpen) {
            const input = document.querySelector('input[type="text"]')
            if (input) input.focus()
        }
    }, [isOpen])

    const onNameChange = (e) => {
        setDashboardName(e.target.value)
    }

    const saveLayout = () => {
        // Implement save logic here
        onClose()
    }

    return <Panel title="Save Layout" isOpen={isOpen} onClose={onClose}>
        <div className="mb-8">
            <span className='input-label'>Name your layout</span>
            <input type="text" value={dashboardName} placeholder="Enter layout name..."
                onChange={onNameChange} />
            <div className="button-group">
                <IconButton label="Cancel" onClick={onClose} />
                <IconButton label="Save" onClick={saveLayout} />
            </div>
        </div>

        <PanelSection title="Existing Layouts" iconClass="icon-bookmark" expanded={true} expandable={false}>
            <OpenDashboardsView />
        </PanelSection>
    </Panel>
}



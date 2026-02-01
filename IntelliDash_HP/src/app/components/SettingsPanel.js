'use client'

import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import styles from '../styles/SettingsPanel.module.css'
import IconButton from './IconButton'
import Panel from './Panel'
import PanelSection from './PanelSection'

const PRESET_THEMES = [
    {
        name: 'Blue Aurora',
        primaryColor: '#60a5fa',
        primaryDark: '#3b82f6',
        secondaryColor: '#a78bfa',
        accentColor: '#f87171',
    },
    {
        name: 'Green Mint',
        primaryColor: '#10b981',
        primaryDark: '#059669',
        secondaryColor: '#34d399',
        accentColor: '#f87171',
    },
    {
        name: 'Purple Haze',
        primaryColor: '#a855f7',
        primaryDark: '#9333ea',
        secondaryColor: '#e879f9',
        accentColor: '#fca5a5',
    },
    {
        name: 'Sunset',
        primaryColor: '#f97316',
        primaryDark: '#ea580c',
        secondaryColor: '#fbbf24',
        accentColor: '#fb7185',
    },
    {
        name: 'Ocean',
        primaryColor: '#0ea5e9',
        primaryDark: '#0284c7',
        secondaryColor: '#06b6d4',
        accentColor: '#ec4899',
    },
]

const FONT_FAMILIES = [
    { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' },
    { name: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    { name: 'Monospace', value: '"Courier New", monospace' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
]

export default function SettingsPanel({ isOpen, onClose }) {
    const { theme, updateTheme, resetTheme } = useTheme()
    const [expandedSection, setExpandedSection] = useState('colors')

    const handleColorChange = (colorKey, value) => {
        updateTheme({ [colorKey]: value })
    }

    const applyPresetTheme = (preset) => {
        updateTheme({
            primaryColor: preset.primaryColor,
            primaryDark: preset.primaryDark,
            secondaryColor: preset.secondaryColor,
            accentColor: preset.accentColor,
        })
    }

    return <Panel title="Customization Settings" isOpen={isOpen} onClose={onClose}>
        <div className={styles.metaSection}>
            <span className={styles.inputLabel}>Dashboard name</span>
            <input
                type="text"
                className={styles.textInput}
                placeholder="Enter dashboard name..."
                value={theme.dashboardName || ''}
                onChange={(e) => handleColorChange('dashboardName', e.target.value)}
            />
            <span className={styles.inputLabel}>Dashboard description</span>
            <input
                type="text"
                className={styles.textInput}
                placeholder="Enter dashboard description..."
                value={theme.dashboardDesc || ''}
                onChange={(e) => handleColorChange('dashboardDesc', e.target.value)}
            />
        </div>
        {/* Preset Themes Section */}
        <PanelSection title="Color Themes" expanded={expandedSection === 'presets'} onExpand={() => setExpandedSection(expandedSection === 'presets' ? null : 'presets')}>
            <div className={styles.presetGrid}>
                {PRESET_THEMES.map((preset, idx) => (
                    <button
                        key={idx}
                        className={styles.presetButton}
                        onClick={() => applyPresetTheme(preset)}
                        title={preset.name}>
                        <div className={styles.presetPreview}>
                            <div style={{ background: preset.primaryColor }}></div>
                            <div style={{ background: preset.secondaryColor }}></div>
                            <div style={{ background: preset.accentColor }}></div>
                        </div>
                        <span>{preset.name}</span>
                    </button>
                ))}
            </div>
        </PanelSection>

        {/* Custom Colors Section */}
        <PanelSection title="Custom Colors" expanded={expandedSection === 'colors'} onExpand={() => setExpandedSection(expandedSection === 'colors' ? null : 'colors')}>
            <div className={styles.colorControl}>
                <label>Primary Color</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    />
                    <span>{theme.primaryColor}</span>
                </div>
            </div>
            <div className={styles.colorControl}>
                <label>Primary Dark</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={theme.primaryDark}
                        onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                    />
                    <span>{theme.primaryDark}</span>
                </div>
            </div>

            <div className={styles.colorControl}>
                <label>Secondary Color</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={theme.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    />
                    <span>{theme.secondaryColor}</span>
                </div>
            </div>

            <div className={styles.colorControl}>
                <label>Accent Color</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    />
                    <span>{theme.accentColor}</span>
                </div>
            </div>

            <div className={styles.colorControl}>
                <label>Text Color</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={theme.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                    />
                    <span>{theme.textColor}</span>
                </div>
            </div>
        </PanelSection>

        {/* Font Styles Section */}
        <PanelSection title="Font Styles" expanded={expandedSection === 'fonts'} onExpand={() => setExpandedSection(expandedSection === 'fonts' ? null : 'fonts')}>
            <div className={styles.formGroup}>
                <label>Font Family</label>
                <select
                    value={theme.fontFamily}
                    onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                    className={styles.select}
                >
                    {FONT_FAMILIES.map((font, idx) => (
                        <option key={idx} value={font.value}>{font.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Font Size</label>
                <div className={styles.optionGroup}>
                    {['small', 'normal', 'large'].map((size) => (
                        <button
                            key={size}
                            className={`${styles.optionBtn} ${theme.fontSize === size ? styles.optionBtnActive : ''}`}
                            onClick={() => handleColorChange('fontSize', size)}
                        >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Font Weight</label>
                <div className={styles.optionGroup}>
                    {['light', 'normal', 'bold'].map((weight) => (
                        <button
                            key={weight}
                            className={`${styles.optionBtn} ${theme.fontWeight === weight ? styles.optionBtnActive : ''}`}
                            onClick={() => handleColorChange('fontWeight', weight)}
                        >
                            {weight.charAt(0).toUpperCase() + weight.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.preview} style={{
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize === 'small' ? '0.875rem' : theme.fontSize === 'large' ? '1.25rem' : '1rem',
                fontWeight: theme.fontWeight === 'light' ? 300 : theme.fontWeight === 'bold' ? 700 : 400,
            }}>
                Preview text with current font settings
            </div>
        </PanelSection>

        {/* Actions */}
        <div className={styles.actionsRow}>
            <IconButton iconClass="icon-rotate-ccw" label="Reset to Default" onClick={resetTheme} />
        </div>
    </Panel>
}

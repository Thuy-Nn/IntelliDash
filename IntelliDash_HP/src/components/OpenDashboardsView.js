import { useEffect, useState } from 'react'
import styles from '../styles/OpenDashboardView.module.css'


export default function OpenDashboardsView({ onDashboardLoad }) {
  const [dashboards, setDashboards] = useState([])

  useEffect(() => {
    // Load saved dashboards from localStorage
    const loaded = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('dashboard_')) {
        const data = JSON.parse(localStorage.getItem(key))
        loaded.push(data)
      }
    }
    // sort by created date desc
    loaded.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setDashboards(loaded)
  }, [dashboards.length])  // re-run when a dashboard is added or removed

  const loadDashboard = idx => {
    onDashboardLoad(dashboards[idx])
  }

  const deleteDashboard = idx => {
    if (!confirm(`Are you sure you want to delete the dashboard "${dashboards[idx].name}"?`)) return
    localStorage.removeItem(`dashboard_${dashboards[idx].name}`)
    setDashboards(dashboards.filter((_, i) => i !== idx))
  }

  return <div>
    {dashboards.length === 0 && <div className={styles.empty}>No saved layouts found.</div>}
    {dashboards.map((d, i) => <LayoutItem key={i} name={d.name} thumb={d.thumb} createdAt={d.createdAt}
      onLoad={() => loadDashboard(i)} onDelete={() => deleteDashboard(i)} />)}
  </div>
}


function LayoutItem({ name, thumb, createdAt, onLoad, onDelete }) {
  return <div className={styles.outer}>
    <div className={styles.inner} onClick={onLoad}>
      {thumb && <div className={styles.thumb} style={{ backgroundImage: `url(${thumb})` }} />}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.time}>{formatIso(createdAt)}</div>
      </div>
    </div>
    <div className={styles.buttons} title="Delete" onClick={onDelete}>
      <span style={{ color: 'var(--negative)' }} className="icon-trash-2" />
    </div>
  </div>
}


function formatIso(iso) {
  const locale = navigator.language || 'de-DE'
  return new Date(iso).toLocaleString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

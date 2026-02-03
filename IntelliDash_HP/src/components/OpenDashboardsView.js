import styles from '../styles/OpenDashboardView.module.css'
import IconButton from './IconButton'


export default function OpenDashboardsView() {
    return <div>
        <LayoutItem name="Sales Dashboard" thumb='/images/thumb1.jpg' createdAt="2026-01-05T13:40:26" />
        <LayoutItem name="Marketing Overview" thumb='/images/thumb2.jpg' createdAt="2026-01-12T16:25:04" />
        <LayoutItem name="Financial Summary" thumb='/images/thumb3.jpg' createdAt="2026-01-21T21:10:32" />
    </div>
}


function LayoutItem({ name, thumb, createdAt, onLoad, onDelete }) {
    return <div className={styles.outer} onClick={onLoad}>
        <div className={styles.thumb} style={{ backgroundImage: `url(${thumb})` }} />
        <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            <div className={styles.time}>{formatIso(createdAt)}</div>
            <div className={styles.buttons}>
                <IconButton style={{ color: 'var(--negative)' }} iconClass="icon-trash-2"
                    transparent={true} title="Delete" onClick={onDelete} />
            </div>
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

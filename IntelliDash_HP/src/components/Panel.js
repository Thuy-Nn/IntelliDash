import styles from '../styles/Panel.module.css';


export default function Panel({ title, isOpen, onClose, children }) {
    if (!isOpen) return null

    return <>
        <div className={styles.overlay} onClick={onClose}/>
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2>{title}</h2>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div className={styles.content}>
                {children}
            </div>
        </div>
    </>
}

import styles from '../styles/PanelSection.module.css';


export default function PanelSection({ title, children, expanded, onExpand, iconClass, expandable = true }) {
    return <div className={styles.section}>
        <div className={styles.sectionHeader + (expandable ? " " + styles.sectionHeader__expandable : "")}
            onClick={onExpand}>
            <div className={styles.sectionHeaderOuter}>
                {iconClass && <span className={styles.sectionIcon + " " + iconClass} />}
                <h3>{title}</h3>
            </div>
            {expandable && <span className={styles.arrow + (expanded ? " " + styles.arrow__expanded : "")}>▼</span>}
        </div>
        {expanded && <div className={styles.sectionContent}>
            {children}
        </div>}
    </div>
}
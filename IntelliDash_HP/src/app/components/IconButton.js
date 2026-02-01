import styles from '../styles/IconButton.module.css';

export default function IconButton({ iconClass, label, transparent = false, className = "", ...props }) {
    return <button {...props}
        className={styles.buttonOuter + (transparent ? "" : " " + styles.buttonOuter__withBorder) + " " + className}>
        {iconClass && <span className={iconClass} />}
        {label}
    </button>
}
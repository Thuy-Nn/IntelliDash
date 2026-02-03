import styles from '@/styles/SingleValueChart.module.css'

export default function SingleValueChart({ valueData }) {
  if (!valueData || valueData.value === null || valueData.value === undefined) return null

  const { value, unit, position } = valueData
  return <div className={styles.container}>
    <div>
      {position === 'prefix' && unit ? <span className={`${styles.unit} ${styles.unitPrefix}`}>{unit}</span> : null}
      {value.toLocaleString()}
      {position !== 'prefix' && unit ? <span className={`${styles.unit} ${styles.unitSuffix}`}>{unit}</span> : null}
    </div>
  </div>
}
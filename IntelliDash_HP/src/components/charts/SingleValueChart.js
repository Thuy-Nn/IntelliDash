export default function SingleValueChart({ valueData }) {
  if (!valueData || valueData.value === null || valueData.value === undefined) return null

  const { value, unit, position } = valueData
  return <div className="text-6xl overflow-hidden whitespace-nowrap font-bold flex items-center justify-center h-full pb-4 md:pb-8">
    <div>
      {position === 'prefix' && unit ? <span className="mr-2 text-4xl opacity-50 align-baseline">{unit}</span> : null}
      {value.toLocaleString()}
      {position !== 'prefix' && unit ? <span className="ml-2 text-4xl opacity-50 align-baseline">{unit}</span> : null}
    </div>
  </div>
}
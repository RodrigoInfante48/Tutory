interface MetricCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
  loading?: boolean
}

const colorMap = {
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
}

export default function MetricCard({ label, value, icon, color = 'green', loading }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white leading-none">
            {value}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  )
}

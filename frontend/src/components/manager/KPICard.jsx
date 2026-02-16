export default function KPICard({ title, value, subtitle, icon, trend, colorClass = 'bg-gradient-to-br from-emerald-800 to-emerald-900' }) {
  return (
    <div className={`${colorClass} rounded-xl p-6 shadow-lg border border-emerald-700`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-emerald-200 text-sm mb-2">{title}</p>
          <p className="text-white text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-emerald-300 text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-300' : trend < 0 ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

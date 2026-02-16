export default function TrendIndicator({ trend, percent }) {
  if (trend === 'stable') {
    return (
      <span className="mr-2 text-gray-400">
        →
      </span>
    );
  }
  
  if (trend === 'up') {
    return (
      <span className="mr-2 text-green-500 font-bold">
        ↑ {percent > 0 && `${percent.toFixed(1)}%`}
      </span>
    );
  }
  
  return (
    <span className="mr-2 text-red-500 font-bold">
      ↓ {percent < 0 && `${Math.abs(percent).toFixed(1)}%`}
    </span>
  );
}

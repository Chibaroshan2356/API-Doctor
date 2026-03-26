import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  miniChart?: number[];
}

const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  miniChart
}: MetricCardProps) => {
  const variants = {
    default: 'from-gray-500/10 to-gray-600/10 dark:from-gray-500/20 dark:to-gray-600/20',
    success: 'from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20',
    warning: 'from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20',
    danger: 'from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20'
  };

  const iconColors = {
    default: 'text-gray-600 dark:text-gray-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400'
  };

  const renderTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (trend.positive) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const renderMiniChart = () => {
    if (!miniChart || miniChart.length === 0) return null;
    
    const max = Math.max(...miniChart);
    const min = Math.min(...miniChart);
    const range = max - min || 1;
    
    const points = miniChart.map((val, idx) => {
      const x = (idx / (miniChart.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = variant === 'success' ? '#10b981' : 
                       variant === 'warning' ? '#f59e0b' : 
                       variant === 'danger' ? '#ef4444' : '#3b82f6';

    return (
      <svg viewBox="0 0 100 100" className="w-24 h-12 opacity-60">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
        <polygon
          fill={`url(#gradient-${variant})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    );
  };

  return (
    <Card variant="glass" className={`bg-gradient-to-br ${variants[variant]}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-3 space-x-2">
                {renderTrendIcon()}
                <span className={`text-sm font-medium ${trend.positive ? 'text-emerald-600' : trend.value === 0 ? 'text-gray-500' : 'text-red-600'}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            {icon && (
              <div className={`p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 ${iconColors[variant]}`}>
                {icon}
              </div>
            )}
            {renderMiniChart()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;

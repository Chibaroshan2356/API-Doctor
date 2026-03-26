interface StatusCardProps {
  title: string;
  value: number | string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

const StatusCard = ({ title, value, color = "text-gray-900 dark:text-white", icon, className }: StatusCardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {icon && (
          <div className="text-3xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCard;

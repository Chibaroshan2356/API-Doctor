interface ApiData {
  id: string;
  name: string;
  status: "healthy" | "down";
  avgResponseTime: number;
  uptime: number;
  trend?: number; // percentage change
}

interface DashboardTableProps {
  data: ApiData[];
  onApiClick?: (apiName: string) => void;
  selectedApi?: string | null;
}

const DashboardTable = ({ data, onApiClick, selectedApi }: DashboardTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition-colors">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">API Status</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">API Name</th>
              <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
              <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Avg Response Time</th>
              <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Trend</th>
              <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Uptime %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((api) => (
              <tr 
                key={api.id} 
                className={`border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedApi === api.name ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => onApiClick?.(api.name)}
              >
                <td className="py-3 dark:text-gray-200">{api.name}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                      api.status === "healthy"
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  >
                    {api.status === "healthy" ? "UP" : "DOWN"}
                  </span>
                </td>
                <td className={`py-3 dark:text-gray-200 ${
                  api.avgResponseTime > 200 ? 'text-red-400 font-bold' : ''
                }`}>{api.avgResponseTime}ms</td>
                <td className="py-3">
                  {api.trend !== undefined && (
                    <span className={`text-xs font-medium ${
                      api.trend > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {api.trend > 0 ? '↑' : '↓'} {Math.abs(api.trend)}%
                    </span>
                  )}
                </td>
                <td className="py-3 dark:text-gray-200">{api.uptime}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTable;

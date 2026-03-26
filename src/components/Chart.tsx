import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  time: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  type: "line" | "bar";
  title: string;
  color?: string;
}

const Chart = ({ data, type, title, color = "#3b82f6" }: ChartProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition-colors">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Bar dataKey="value" fill={color} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;

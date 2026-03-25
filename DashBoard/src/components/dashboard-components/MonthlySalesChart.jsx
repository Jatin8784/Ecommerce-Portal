import { useSelector } from "react-redux";
import {
  XAxis,
  YAxis,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLastNMonths } from "../../lib/helper";
import { useTheme } from "../../context/ThemeContext";

const MonthlySalesChart = () => {
  const { monthlySales } = useSelector((state) => state.admin);
  const months = getLastNMonths(4).map((m) => m.month);
  const filled = months.map((m) => {
    const found = monthlySales?.find((item) => item.month === m);
    return { month: m, totalSales: found?.totalSales || 0 };
  });

  const { theme } = useTheme();

  return (
    <>
      <div className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Monthly Sales</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={filled}
            margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          >
            <XAxis
              dataKey="month"
              scale="point"
              interval="preserveStartEnd"
              padding={{ left: 30, right: 30 }}
              tickFormatter={(value) => {
                const [m, y] = value.split(" ");
                return `${m} ’${y.slice(2)}`;
              }}
              tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
            />
            <YAxis tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1a1c23' : '#fff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: theme === 'dark' ? '#f3f4f6' : '#111827'
              }}
            />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default MonthlySalesChart;

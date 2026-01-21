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

const MonthlySalesChart = () => {
  const { monthlySales } = useSelector((state) => state.admin);
  const months = getLastNMonths(4).map((m) => m.month);
  const filled = months.map((m) => {
    const found = monthlySales?.find((item) => item.month === m);
    return { month: m, totalSales: found?.totalSales || 0 };
  });

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="font-semibold mb-2">Monthly Sales</h3>
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
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
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

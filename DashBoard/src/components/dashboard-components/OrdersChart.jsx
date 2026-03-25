import { useSelector } from "react-redux";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "../../context/ThemeContext";

const OrdersChart = () => {
  const { orderStatusCounts = {} } = useSelector((state) => state.admin);
  const { theme } = useTheme();

  const statusColors = {
    Processing: "#facc15", // yellow
    Shipped: "#3b82f6", // blue
    Delivered: "#22c55e", // green
    Cancelled: "#ef4444", // red
  };
  const orderStatusData = Object.keys(orderStatusCounts)
    .map((status) => ({
      status,
      count: parseInt(orderStatusCounts[status]) || 0,
    }))
    .filter((item) => item.count > 0);

  return (
    <>
      <div className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Order Status</h3>
        <ResponsiveContainer width="150%" height={250}>
          <PieChart>
            <Pie
              data={orderStatusData}
              dataKey="count"
              nameKey="status"
              cx="35%"
              cy="50%"
              outerRadius={80}
              label
            >
              {orderStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[entry.status] || "#ccc"} // fallback color
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1a1c23' : '#fff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: theme === 'dark' ? '#f3f4f6' : '#111827'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default OrdersChart;

import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

const TopProductsChart = () => {
  const { topSellingProducts } = useSelector((state) => state.admin);
  const { theme } = useTheme();

  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <foreignObject x={x - 36} y={y - 16} width={32} height={32}>
        <img
          src={payload.value}
          alt="product"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </foreignObject>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const product = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1a1c23] p-2 rounded shadow border border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200">
          <p className="font-semibold">Title: {product.name}</p>
          <p>Sold: {product.total_sold}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Top Selling Products</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              layout="vertical"
              data={topSellingProducts.slice(0, 3)}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barSize={50}
            >
              <XAxis type="number" tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
              <YAxis
                dataKey="image"
                type="category"
                tick={<CustomYAxisTick />}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ pointerEvents: "auto" }}
              />
              <Bar
                dataKey="total_sold"
                radius={[4, 4, 4, 4]}
                isAnimationActive={false}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
              >
                {topSellingProducts.slice(0, 3).map((entry, index) => {
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#3b82f6"
                          : index === 1
                            ? "#10b981"
                            : "#f59e0b"
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default TopProductsChart;

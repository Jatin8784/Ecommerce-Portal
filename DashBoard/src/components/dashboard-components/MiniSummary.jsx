import React from "react";
import {
  Wallet,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  BarChart4,
  UserPlus,
} from "lucide-react";
import { useSelector } from "react-redux";

const MiniSummary = () => {
  const {
    topSellingProducts,
    lowStockProducts,
    revenueGrowth,
    newUsersThisMonth,
    currentMonthSales,
    orderStatusCounts,
  } = useSelector((state) => state.admin);

  let totalOrders = 0;
  totalOrders = Object.values(orderStatusCounts).reduce(
    (acc, count) => acc + count,
    0,
  );

  const summary = [
    {
      text: "Total Sales this Month",
      subText: `this month's sales: INR ${currentMonthSales * 283}`,
      icon: <Wallet className="text-green-600" />,
    },
    {
      text: "Total Orders Placed",
      subText: `Total orders placed: ${totalOrders}`,
      icon: <PackageCheck className="text-blue-600" />,
    },
    {
      text: "Top Selling Product",
      subText: `Best Seller: ${topSellingProducts[0]?.name} (${topSellingProducts[0]?.total_sold} sold)`,
      icon: <TrendingUp className="text-emerald-600" />,
    },
    {
      text: "Low Stock Alerts",
      subText: `${lowStockProducts} products running low on stock`,
      icon: <AlertTriangle className="text-red-600" />,
    },
    {
      text: "Revenue Growth Rate",
      subText: `Revenue ${revenueGrowth.includes("+") ? "up" : "down"} by ${revenueGrowth} compared to last month`,
      icon: <BarChart4 className="text-purple-600" />,
    },
    {
      text: "New Customers This Month",
      subText: `New customers joined: ${newUsersThisMonth}`,
      icon: <UserPlus className="text-yellow-600" />,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p className="text-sm text-gray-500 mb-4">
          Summary of key metrics for the current month
        </p>
        <div className="space-y-4">
          {summary.map((item, index) => {
            return (
              <div key={index} className="flex items-center space-x-3">
                {item.icon}
                <div>
                  <p className="text-sm">{item.text}</p>
                  <p className="text-sm text-gray-500">{item.subText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MiniSummary;

import React, { useEffect } from "react";
import Header from "./Header";
import MiniSummary from "./dashboard-components/MiniSummary";
import TopSellingProducts from "./dashboard-components/TopSellingProducts";
import Stats from "./dashboard-components/Stats";
import MonthlySalesChart from "./dashboard-components/MonthlySalesChart";
import OrdersChart from "./dashboard-components/OrdersChart";
import TopProductsChart from "./dashboard-components/TopProductsChart";
import { useDispatch } from "react-redux";
import { getDashboardStats } from "../store/slices/adminSlice";

const Dashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  return (
    <main className="p-4 sm:p-6">
      <div className="flex-1">
        <Header />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Check your sales and store performance.</p>
        </div>

        <Stats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <MonthlySalesChart />
          <OrdersChart />
          <TopProductsChart />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 py-4">
          <TopSellingProducts />
          <div className="xl:col-span-1">
            <MiniSummary />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

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
    <div className="flex-1 md:pl-6">
      <Header />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Check the sales and value.</p>
      </div>

      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <MonthlySalesChart />
        <OrdersChart />
        <TopProductsChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 py-6">
        <div className="xl:col-span-2">
          <TopSellingProducts />
        </div>
        <div className="xl:col-span-1">
          <MiniSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const Dashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  return (
    <main className="p-[10px] pl-[10px] md:pl-[17rem]">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 md:p-6"
      >
        <Header />
        
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-3xl font-bold bg-dark-gradient bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">Real-time performance and sales metrics</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stats />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6"
        >
          <MonthlySalesChart />
          <OrdersChart />
          <TopProductsChart />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 py-4"
        >
          <TopSellingProducts />
          <div className="xl:col-span-1">
            <MiniSummary />
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Dashboard;

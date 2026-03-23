import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    loading: false,
    totalUsers: 0,
    users: [],
    totalRevenueAllTime: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    totalUsersCount: 0,
    monthlySales: [],
    orderStatusCounts: {},
    topSellingProducts: [],
    lowStockProducts: 0,
    revenueGrowth: "",
    newUsersThisMonth: 0,
    currentMonthSales: 0,
  },
  reducers: {
    getAllUserRequest(state) {
      state.loading = true;
    },
    getAllUserSuccess(state, action) {
      state.loading = false;
      state.users = action.payload.users;
      state.totalUsers = action.payload.totalUsers;
    },
    getAllUserFailed(state) {
      state.loading = false;
    },
    deleteUserRequest(state) {
      state.loading = true;
    },
    deleteUserSuccess(state, action) {
      state.loading = false;
      state.users = state.users.filter((user) => user.id !== action.payload);
      state.totalUsers = Math.max(0, state.totalUsers - 1);
      state.totalUsersCount = Math.max(0, state.totalUsersCount - 1);
    },
    deleteUserFailed(state) {
      state.loading = false;
    },
    getStatsRequest(state) {
      state.loading = true;
    },
    getStatsSuccess(state, action) {
      state.loading = false;
      state.totalRevenueAllTime = action.payload.totalRevenueAllTime;
      state.todayRevenue = action.payload.todayRevenue;
      state.yesterdayRevenue = action.payload.yesterdayRevenue;
      state.totalUsersCount = action.payload.totalUsersCount;
      state.monthlySales = action.payload.monthlySales;
      state.orderStatusCounts = action.payload.orderStatusCounts;
      state.topSellingProducts = action.payload.topSellingProducts;
      state.lowStockProducts = action.payload.lowStockProducts?.length;
      state.revenueGrowth = action.payload.revenueGrowth;
      state.newUsersThisMonth = action.payload.revenueGrowth.newUsersThisMonth;
      state.currentMonthSales = action.payload.currentMonthSales;
    },
    getStatsFailed(state) {
      state.loading = false;
    },
    updateStatusRequest(state) {
      state.loading = true;
    },
    updateStatusSuccess(state) {
      state.loading = false;
    },
    updateStatusFailed(state) {
      state.loading = false;
    },
  },
});

export const fetchAllUsers = (page) => async (dispatch) => {
  dispatch(adminSlice.actions.getAllUserRequest());
  try {
    const res = await axiosInstance.get(`/admin/getallusers?page=${page || 1}`);
    dispatch(adminSlice.actions.getAllUserSuccess(res.data));
  } catch (err) {
    dispatch(adminSlice.actions.getAllUserFailed());
  }
};

export const deleteAllUsers = (id, page) => async (dispatch, getState) => {
  dispatch(adminSlice.actions.deleteUserRequest());
  try {
    const res = await axiosInstance.delete(`/admin/delete/${id}`);
    dispatch(adminSlice.actions.deleteUserSuccess(id));
    toast.success(res.data.message || "User Deleted Successfully");
    const state = getState();
    const updatedTotal = state.admin.totalUsers;
    const updatedMaxPage = Math.ceil(updatedTotal / 10) || 1;
    const validPage = Math.min(page, updatedMaxPage);
    dispatch(fetchAllUsers(validPage));
  } catch (err) {
    dispatch(adminSlice.actions.deleteUserFailed());
    toast.error(err?.response?.data?.message || "Failed to delete user");
  }
};

export const getDashboardStats = () => async (dispatch) => {
  dispatch(adminSlice.actions.getStatsRequest());
  try {
    const res = await axiosInstance.get(`/admin/fetch/dashboard-stats`);
    dispatch(adminSlice.actions.getStatsSuccess(res.data));
  } catch (err) {
    dispatch(adminSlice.actions.getStatsFailed());
  }
};

export const updateOrderStatusAction =
  (orderId, status) => async (dispatch) => {
    dispatch(adminSlice.actions.updateStatusRequest());
    try {
      const res = await axiosInstance.put(`/admin/order-status/${orderId}`, {
        status,
      });
      dispatch(adminSlice.actions.updateStatusSuccess());
      toast.success(res.data.message || "Status Updated Successfully");
      dispatch(getDashboardStats());
    } catch (err) {
      dispatch(adminSlice.actions.updateStatusFailed());
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

export default adminSlice.reducer;

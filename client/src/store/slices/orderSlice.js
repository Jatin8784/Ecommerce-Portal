import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "sonner";

export const fetchMyOrders = createAsyncThunk(
  "/order/orders/me",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/order/orders/me");
      return res.data.myOrders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "/order/single",
  async (orderId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const PlaceOrder = createAsyncThunk(
  "/order/new",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/new", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to place order, try again."
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Order failed"
      );
    }
  }
);

export const VerifyPayment = createAsyncThunk(
  "/payment/verify",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/payment/verify", data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "/order/delete",
  async (orderId, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/order/delete/${orderId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false,
    finalPrice: null,
    orderStep: 1,
    razorpayOrderId: null,
    razorpayAmount: null,
    razorpayCurrency: "INR",
    currentOrderId: null,
    orderDetails: null,
    fetchingOrderDetails: false,
  },
  reducers: {
    toggleOrderStep(state) {
      state.orderStep = 1;
    },
    resetOrderState(state) {
      state.orderStep = 1;
      state.razorpayOrderId = null;
      state.currentOrderId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.fetchingOrders = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.fetchingOrders = false;
      })
      .addCase(PlaceOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(PlaceOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.finalPrice = action.payload.total_price;
        state.currentOrderId = action.payload.orderId; // Make sure backend returns orderId
        if (action.payload.razorpayOrderId) {
          state.razorpayOrderId = action.payload.razorpayOrderId;
          state.razorpayAmount = action.payload.amount;
          state.razorpayCurrency = action.payload.currency;
          state.orderStep = 2;
        } else {
          state.orderStep = 3;
        }
      })
      .addCase(PlaceOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = action.payload || "An unexpected error occurred";
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.fetchingOrderDetails = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.fetchingOrderDetails = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state) => {
        state.fetchingOrderDetails = false;
      })
      .addCase(VerifyPayment.fulfilled, (state) => {
        state.orderStep = 3;
      });
  },
});

export default orderSlice.reducer;
export const { toggleOrderStep, resetOrderState } = orderSlice.actions;

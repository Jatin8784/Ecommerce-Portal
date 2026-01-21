/* eslint-disable no-self-assign */

import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-toastify";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);
    },
    loginFailed(state) {
      state.loading = false;
      state.isAuthenticated = false;
    },
    getUserRequest(state) {
      state.loading = true;
    },
    getUserSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    getUserFailed(state) {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    },
    logoutRequest(state) {
      state.loading = false;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    },
    logoutFailed(state) {
      state.loading = false;
    },
    forgotPasswordRequest(state) {
      state.loading = true;
    },
    forgotPasswordSuccess(state, action) {
      state.loading = false;
    },
    forgotPasswordFailed(state) {
      state.loading = false;
    },
    resetPasswordRequest(state) {
      state.loading = true;
    },
    resetPasswordSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetPasswordFailed(state) {
      state.loading = false;
    },
    updateProfileRequest(state) {
      state.loading = true;
    },
    updateProfileSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },
    updateProfileFailed(state) {
      state.loading = false;
    },
    updatePasswordRequest(state) {
      state.loading = true;
    },
    updatePasswordSuccess(state, action) {
      state.loading = false;
    },
    updatePasswordFailed(state) {
      state.loading = false;
    },
    resetAuthSlice(state) {
      state.loading = false;
      state.user = state.user;
      state.isAuthenticated = state.isAuthenticated;
    },
  },
});

export const login = (data) => async (dispatch) => {
  dispatch(authSlice.actions.loginRequest());
  try {
    await axiosInstance.post("/auth/login", data).then((res) => {
      if (res.data.user.role === "Admin") {
        dispatch(authSlice.actions.loginSuccess(res.data.user));
        toast.success(res.data.message);
      } else {
        dispatch(authSlice.actions.loginFailed());
        toast.error(res.data.message);
      }
    });
  } catch (error) {
    dispatch(authSlice.actions.loginFailed());
    toast.error(error.response.data.message || "Login Failed");
  }
};

export const getUser = (data) => async (dispatch) => {
  dispatch(authSlice.actions.getUserRequest());
  try {
    await axiosInstance.get("/auth/me").then((res) => {
      dispatch(authSlice.actions.getUserSuccess(res.data.user));
    });
  } catch (error) {
    dispatch(authSlice.actions.getUserFailed());
  }
};

export const logout = (data) => async (dispatch) => {
  dispatch(authSlice.actions.logoutRequest());
  try {
    await axiosInstance.get("/auth/logout").then((res) => {
      dispatch(authSlice.actions.logoutSuccess());
      toast.success(res.data.message);
      dispatch(authSlice.actions.resetAuthSlice());
    });
  } catch (error) {
    dispatch(authSlice.actions.loginFailed());
    toast.error(error.response.data.message || "Logout Failed");
    dispatch(authSlice.actions.resetAuthSlice());
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  dispatch(authSlice.actions.forgotPasswordRequest());
  try {
    await axiosInstance
      .post(`/auth/password/forgot?frontendUrl=http://localhost:5173`, email)
      .then((res) => {
        dispatch(authSlice.actions.forgotPasswordSuccess());
        toast.success(res.data.message);
      });
  } catch (error) {
    dispatch(authSlice.actions.forgotPasswordFailed());
    toast.error(
      error.response.data.message || "Cannot request for rest password"
    );
  }
};

export const resetPassword = (newData, token) => async (dispatch) => {
  dispatch(authSlice.actions.resetPasswordRequest());
  try {
    await axiosInstance
      .put(`/auth/password/reset/${token}`, newData)
      .then((res) => {
        dispatch(authSlice.actions.resetPasswordSuccess(res.data.user));
        toast.success(res.data.message);
      });
  } catch (error) {
    dispatch(authSlice.actions.resetPasswordFailed());
    toast.error(error.response.data.message || "Password cannot be reset");
  }
};

export const updateAdminProfile = (data) => async (dispatch) => {
  dispatch(authSlice.actions.updateProfileRequest());
  try {
    await axiosInstance.put(`/auth/profile/update`, data).then((res) => {
      dispatch(authSlice.actions.updateProfileSuccess(res.data.user));
      toast.success(res.data.message);
    });
  } catch (error) {
    dispatch(authSlice.actions.updateProfileFailed());
    toast.error(error.response.data.message || "Failed to update profile");
  }
};

export const updateAdminPassword = (data) => async (dispatch) => {
  dispatch(authSlice.actions.updatePasswordRequest());
  try {
    await axiosInstance.put(`/auth/password/update`, data).then((res) => {
      dispatch(authSlice.actions.updatePasswordSuccess());
      toast.success(res.data.message);
    });
  } catch (error) {
    dispatch(authSlice.actions.updatePasswordFailed());
    toast.error(error.response.data.message || "Failed to update password");
  }
};

export const resetAuthSlice = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export default authSlice.reducer;

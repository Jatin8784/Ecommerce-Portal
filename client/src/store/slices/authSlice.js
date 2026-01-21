import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice";

export const register = createAsyncThunk(
  "auth/register",
  async (data, thumbAPI) => {
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success(res.data.message);
      thumbAPI.dispatch(toggleAuthPopup());
      return res.data.user;
    } catch (error) {
      toast.error(error.response.data.message);
      return thumbAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);
    toast.success(res.data.message);
    thunkAPI.dispatch(toggleAuthPopup());
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const getUser = createAsyncThunk("auth/getUser", async (_, thumbAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
  } catch (error) {
    return thumbAPI.rejectWithValue(
      error.response.data.message || "Failed to get User"
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thumbAPI) => {
  try {
    const res = await axiosInstance.get("/auth/logout");
    thumbAPI.dispatch(toggleAuthPopup());
    return null;
  } catch (error) {
    toast.error(error.response.data.message);
    return thumbAPI.rejectWithValue(
      error.response.data.message || "Failed to get User"
    );
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgot/password",
  async (email, thumbAPI) => {
    try {
      const res = await axiosInstance.post(
        "/auth/password/forgot?frontendUrl=http://localhost:5173",
        email
      );
      toast.success(res.data.message);
      return null;
    } catch (error) {
      toast.error(error.response.data.message);
      return thumbAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thumbAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      const message =
        error.response.data.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
      return thumbAPI.rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/password/update",
  async (data, thumbAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/update`, data);
      toast.success(res.data.message);
      return res.date;
    } catch (error) {
      const message = error.response.data.message;
      toast.error(message);
      return thumbAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/profile/update",
  async (data, thumbAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/profile/update`, data);
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      const message = error.response.data.message;
      toast.error(message);
      return thumbAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(register.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(getUser.pending, (state, action) => {
        state.isCheckingAuth = true;
        state.authUser = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // eslint-disable-next-line no-self-assign
        state.authUser = state.authUser;
      })
      .addCase(forgotPassword.pending, (state, action) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isRequestingForToken = false;
      })
      .addCase(resetPassword.pending, (state, action) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updatePassword.pending, (state, action) => {
        state.isUpdatingPassword = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updateProfile.pending, (state, action) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.authUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
      });
  },
});

export default authSlice.reducer;

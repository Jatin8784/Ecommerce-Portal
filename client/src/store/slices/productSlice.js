/* eslint-disable react-hooks/rules-of-hooks */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAIModal } from "../slices/popupSlice.js";
import { useSelector } from "react-redux";

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async (
    {
      availability = "",
      price = "0 - 10000",
      category = "",
      ratings = "",
      search = "",
      page = 1,
    },
    thunkAPI
  ) => {
    try {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (price) params.append("price", price);
      if (search) params.append("search", search);
      if (ratings) params.append("ratings", ratings);
      if (availability) params.append("availability", availability);
      if (page) params.append("page", page);

      const res = await axiosInstance.get(`/product?${params.toString()}`);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response.data.message || "Failed to fetch productss"
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/product/singleProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/singleProduct/${id}`);
      return res.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response.message || "Failed to fetch product Details."
      );
    }
  }
);

export const postReview = createAsyncThunk(
  "product/post-new/review",
  async ({ productId, review }, thunkAPI) => {
    const state = thunkAPI.getState();
    const authUser = state.auth.authUser;
    try {
      const res = await axiosInstance.put(
        `/product/post-new/review/${productId}`,
        review
      );
      toast.success(res.data.message);
      return {
        review: res.data.review,
        authUser,
      };
    } catch (error) {
      toast.error(error.response.message || "Failed to Post review.");
      return thunkAPI.rejectWithValue(
        error.response.message || "Failed to Post review."
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "product/delete/review",
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/product/delete/review/${productId}`
      );
      toast.success(res.data.message);
      return reviewId;
    } catch (error) {
      toast.error(error.response.message || "Failed to Delete review.");
      return thunkAPI.rejectWithValue(
        error.response.message || "Failed to Delete review."
      );
    }
  }
);

export const fetchProductWithAI = createAsyncThunk(
  "/product/ai-search",
  async (userPrompt, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/product/ai-search", {
        userPrompt: userPrompt, // ✅ EXACT KEY NAME
      });

      thunkAPI.dispatch(toggleAIModal());
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "AI Search Failed");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI Filtered Products."
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
        state.productReviews = action.payload.reviews;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postReview.pending, (state) => {
        state.isPostingReview = true;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.isPostingReview = false;
        const newReview = action.payload.review;
        const authUser = action.payload.authUser;
        const existingReviewIndex = state.productReviews.findIndex(
          (rev) => rev.reviewer?.id === newReview.user_id
        );
        if (existingReviewIndex !== -1) {
          state.productReviews[existingReviewIndex].rating = Number(
            newReview.rating
          );
          state.productReviews[existingReviewIndex].comment = newReview.comment;
        } else {
          state.productReviews = [
            {
              ...newReview,
              reviewer: {
                id: authUser?.id,
                name: authUser?.name,
                avatar: authUser?.avatar?.url,
              },
            },
            ...state.productReviews,
          ];
        }
      })
      .addCase(postReview.rejected, (state) => {
        state.isPostingReview = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isReviewDeleting = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isReviewDeleting = false;
        state.productReviews = state.productReviews.filter(
          (review) => review.review_id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state) => {
        state.isReviewDeleting = false;
      })
      .addCase(fetchProductWithAI.pending, (state) => {
        state.aiSearching = true;
      })
      .addCase(fetchProductWithAI.fulfilled, (state, action) => {
        state.aiSearching = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.products.length;
      })
      .addCase(fetchProductWithAI.rejected, (state) => {
        state.aiSearching = false;
      });
  },
});

export default productSlice.reducer;

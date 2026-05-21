import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/services/projects.api';
import { getWishlistApi, toggleWishlistApi, removeFromWishlistApi } from '@/services/wishlist.api';

export interface WishlistState {
  items: Project[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  lastAction: 'added' | 'removed' | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
  lastAction: null,
};

export const fetchWishlist = createAsyncThunk<Project[], void, { rejectValue: string }>(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      return await getWishlistApi();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch wishlist');
    }
  }
);

export const toggleWishlist = createAsyncThunk<{ items: Project[]; action: 'added' | 'removed' }, string, { rejectValue: string }>(
  'wishlist/toggleWishlist',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await toggleWishlistApi(projectId);
      return { items: response.wishlist, action: response.action || (response.message.includes('Added') ? 'added' : 'removed') };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to toggle wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk<Project[], string, { rejectValue: string }>(
  'wishlist/removeFromWishlist',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await removeFromWishlistApi(projectId);
      return response.wishlist;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    clearLastAction: (state) => {
      state.lastAction = null;
    },
    addToWishlistOptimistic: (state, action: PayloadAction<Project>) => {
      // Check if already exists
      if (!state.items.some(item => item._id === action.payload._id)) {
        state.items.unshift(action.payload);
      }
    },
    removeFromWishlistOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload.items;
        state.lastAction = action.payload.action;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      
      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.actionLoading = false;
        state.items = action.payload;
        state.lastAction = 'removed';
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlistError, clearLastAction, addToWishlistOptimistic, removeFromWishlistOptimistic } = wishlistSlice.actions;
export default wishlistSlice.reducer;
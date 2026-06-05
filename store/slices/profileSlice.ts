import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api/axios';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  role: 'user' | 'admin';
  isVerified: boolean;
  wishlistCount: number;
  purchasedCount: number;
  createdAt: string;
}

export interface ProfileStats {
  totalPurchases: number;
  totalSpent: number;
  pendingOrders: number;
  wishlistCount: number;
}

interface ProfileState {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  profile: null,
  stats: null,
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: { name?: string; avatar?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.stats = action.payload.stats;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.profile = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, clearUpdateSuccess } = profileSlice.actions;
export default profileSlice.reducer;
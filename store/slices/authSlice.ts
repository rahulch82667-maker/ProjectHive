import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthResponse, loginApi, signupApi, googleAuthApi, getMeApi, forgotPasswordApi } from '@/services/auth/auth.api';

interface AuthState {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const data = await getMeApi();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user');
  }
});

export const signupUser = createAsyncThunk('auth/signup', async (userData: { firebaseUid: string; email: string; name: string; provider: string; avatar?: string }, { rejectWithValue }) => {
  try {
    const data = await signupApi(userData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Signup failed');
  }
});

export const loginUserThunk = createAsyncThunk('auth/login', async (_, { rejectWithValue }) => {
  try {
    const data = await loginApi();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
  }
});

export const googleAuthThunk = createAsyncThunk('auth/google', async (_, { rejectWithValue }) => {
  try {
    const data = await googleAuthApi();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Google authentication failed');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email: string, { rejectWithValue }) => {
  try {
    const data = await forgotPasswordApi(email);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Forgot password failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Current User
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUserThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUserThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUserThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Google Auth
    builder.addCase(googleAuthThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleAuthThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(googleAuthThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logoutUser, clearError } = authSlice.actions;
export default authSlice.reducer;

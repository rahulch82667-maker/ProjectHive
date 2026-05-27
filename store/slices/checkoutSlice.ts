import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api/axios';

export interface IBillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  gstin?: string;
}

export interface CheckoutState {
  loading: boolean;
  error: string | null;
  sessionUrl: string | null;
  billingDetailsCache: IBillingDetails | null;
}

const initialState: CheckoutState = {
  loading: false,
  error: null,
  sessionUrl: null,
  billingDetailsCache: null,
};

// Async thunk to initiate the Stripe Checkout session
export const initiateCheckoutSession = createAsyncThunk(
  'checkout/initiateSession',
  async (
    payload: { projectId: string; billingDetails: IBillingDetails },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/checkout/initiate', payload);
      return response.data; // Expecting { sessionUrl: string }
    } catch (error: any) {
      console.error('Redux initiate checkout error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to initiate checkout'
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckoutState: (state) => {
      state.loading = false;
      state.error = null;
      state.sessionUrl = null;
    },
    cacheBillingDetails: (state, action: PayloadAction<IBillingDetails>) => {
      state.billingDetailsCache = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.sessionUrl = null;
      })
      .addCase(initiateCheckoutSession.fulfilled, (state, action: PayloadAction<{ sessionUrl: string }>) => {
        state.loading = false;
        state.sessionUrl = action.payload.sessionUrl;
        state.error = null;
      })
      .addCase(initiateCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.sessionUrl = null;
      });
  },
});

export const { clearCheckoutState, cacheBillingDetails } = checkoutSlice.actions;
export default checkoutSlice.reducer;

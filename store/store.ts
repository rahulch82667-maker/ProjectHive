import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import collectionsReducer from './slices/collectionsSlice';
import wishlistReducer from './slices/wishlistSlice';
import photosReducer from './slices/photosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    collections: collectionsReducer,
    wishlist: wishlistReducer,
    photos: photosReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

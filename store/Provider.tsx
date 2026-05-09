'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import React, { useEffect } from 'react';
import { fetchCurrentUser } from './slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // @ts-ignore - fixing type error for dispatching async thunk
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}


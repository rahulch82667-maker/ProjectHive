'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated && user?.role === 'admin' ? <>{children}</> : null;
};

export const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated && user?.role === 'user' ? <>{children}</> : null;
};

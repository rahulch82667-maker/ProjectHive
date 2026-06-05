'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import Container from '@/components/layout/Container';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileQuickLinks from '@/components/profile/ProfileQuickLinks';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { fetchProfile } from '@/store/slices/profileSlice';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const { profile, stats, loading } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <Container className="py-24">
          <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto ring-4 ring-amber-100">
              <LogIn className="h-9 w-9 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in Required</h2>
            <p className="text-slate-500 text-sm">Please sign in to view your profile.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MainLayout>
        <Container className="py-8 sm:py-12">
          {loading && !profile ? (
            <ProfileSkeleton />
          ) : profile ? (
            <div className="space-y-6">

              {/* ── Hero Banner ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
                <ProfileAvatar
                  name={profile.name}
                  avatar={profile.avatar}
                  isVerified={profile.isVerified}
                  provider={profile.provider}
                  role={profile.role}
                />

                <div className="hidden sm:block w-px self-stretch bg-slate-100" />

                <div className="text-center sm:text-left flex-1 space-y-1">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    My Profile
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                  <p className="text-xs text-slate-400 pt-0.5">
                    Member since{' '}
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-6 px-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats?.totalPurchases ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Projects</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">${stats?.totalSpent?.toFixed(0) ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Spent</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats?.wishlistCount ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Wishlist</p>
                  </div>
                </div>
              </div>

              {/* ── Stats Row ── */}
              {stats && <ProfileStats stats={stats} />}

              {/* ── Main Content ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <ProfileInfo profile={profile} />
                  <ProfileQuickLinks />
                </div>
                <div className="lg:col-span-2">
                  <ProfileEditForm />
                </div>
              </div>

            </div>
          ) : null}
        </Container>
      </MainLayout>
    </div>
  );
}
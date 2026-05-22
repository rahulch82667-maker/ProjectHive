import { UserProtectedRoute } from '@/components/auth';
import VideoProjectsPage from '@/components/video/VideoProjectsPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Video Templates - ProjectHive',
  description: 'Discover and preview premium video templates, stock footage, and motion graphics on ProjectHive.',
};

export default function VideoPage() {
  return (
    <UserProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-brown-250 border-t-brown-700 animate-spin"></div>
            <p className="text-brown-700 font-semibold text-sm animate-pulse">Loading Video Templates...</p>
          </div>
        </div>
      }>
        <VideoProjectsPage />
      </Suspense>
    </UserProtectedRoute>
  );
}

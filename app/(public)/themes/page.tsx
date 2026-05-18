import { UserProtectedRoute } from '@/components/auth';
import { TemplatesPage } from '@/components/templates';
import { Suspense } from 'react';

export default function Themes() {
  return (
    <UserProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-brown-200 border-t-brown-700 animate-spin"></div>
            <p className="text-brown-700 font-semibold text-sm">Loading ProjectHive...</p>
          </div>
        </div>
      }>
        <TemplatesPage />
      </Suspense>
    </UserProtectedRoute>
  );
}

import { UserProtectedRoute } from '@/components/auth';

export default function Home() {
  return (
    <UserProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to ProjectHive</h1>
        <p className="text-lg text-center text-gray-600">
          Your project management dashboard
        </p>
      </div>
    </UserProtectedRoute>
  );
}

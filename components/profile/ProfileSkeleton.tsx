export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero skeleton */}
      <div className="h-52 bg-slate-200 rounded-3xl" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
          <div className="h-10 bg-slate-200 rounded-xl w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
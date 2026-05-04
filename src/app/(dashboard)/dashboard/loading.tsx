import { Skeleton, StatCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-7 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full mb-2 rounded-lg" />)}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full mb-2 rounded-lg" />)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

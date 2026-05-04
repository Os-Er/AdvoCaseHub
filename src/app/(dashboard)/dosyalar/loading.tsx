import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-7 w-32 mb-2" /><Skeleton className="h-4 w-24" /></div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-3"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 w-32" /><Skeleton className="h-9 w-28" /></div>
      </div>
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

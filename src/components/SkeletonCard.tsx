export default function SkeletonCard() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
      <div className="w-16 h-16 bg-slate-800 rounded-full mb-3" />
      <div className="w-3/4 h-4 bg-slate-800 rounded mb-2" />
      <div className="w-1/2 h-3 bg-slate-800 rounded" />
    </div>
  );
}

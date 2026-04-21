export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading…</p>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-black text-brand-pink mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">This page doesn&apos;t exist or was removed.</p>
        <Link href="/" className="btn-primary">Back to feed</Link>
      </div>
    </div>
  );
}

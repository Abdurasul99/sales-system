export default function BillingLoading() {
  return (
    <div className="p-6 max-w-6xl animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded-xl" />
      </div>

      {/* Status card */}
      <div className="h-28 bg-gray-100 rounded-2xl mb-8" />

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border-2 border-gray-100 p-5 space-y-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div className="h-5 w-24 bg-gray-200 rounded-lg" />
            <div className="h-8 w-32 bg-gray-200 rounded-lg" />
            <div className="space-y-2 pt-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-3 bg-gray-100 rounded-full w-full" />
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded-xl mt-4" />
          </div>
        ))}
      </div>

      {/* Payment info */}
      <div className="mt-8 h-40 bg-gray-100 rounded-2xl" />
    </div>
  );
}

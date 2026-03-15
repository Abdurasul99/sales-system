export default function ABCLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 bg-gray-100 rounded-2xl" />
    </div>
  );
}

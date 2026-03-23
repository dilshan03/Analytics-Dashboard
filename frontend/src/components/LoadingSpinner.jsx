function LoadingSpinner() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-500">Loading dashboard data...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
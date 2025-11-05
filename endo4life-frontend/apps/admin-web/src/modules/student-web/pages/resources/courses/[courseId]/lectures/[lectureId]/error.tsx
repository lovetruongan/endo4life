export function LecturePlayerError() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something Went Wrong
        </h2>
        <p className="text-gray-600">
          There was an error loading the lecture. Please try again later.
        </p>
      </div>
    </div>
  );
}

export default LecturePlayerError;


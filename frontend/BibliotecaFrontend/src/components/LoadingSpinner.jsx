const LoadingSpinner = ({ message = 'Buscando libros...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12" role="status" aria-live="polite">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-amber-700 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg className="h-8 w-8 text-amber-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <p className="mt-4 text-amber-800">{message}</p>
      
      <div className="mt-2 flex justify-center">
        <div className="w-8 h-2 bg-amber-800/20 animate-pulse rounded-full mx-1"></div>
        <div className="w-8 h-2 bg-amber-800/20 animate-pulse rounded-full mx-1" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-8 h-2 bg-amber-800/20 animate-pulse rounded-full mx-1" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

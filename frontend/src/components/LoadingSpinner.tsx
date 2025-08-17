import { Loader2 } from 'lucide-react'

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <img src="/loading-illustration.svg" alt="Loading" className="h-32 w-auto mb-4" />
        <p className="text-gray-600">Loading your dream property...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner 
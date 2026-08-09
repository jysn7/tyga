export function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <span className="animate-loader-bar h-4 w-1 rounded-full bg-primary [animation-delay:-0.3s]" />
      <span className="animate-loader-bar h-4 w-1 rounded-full bg-primary [animation-delay:-0.15s]" />
      <span className="animate-loader-bar h-4 w-1 rounded-full bg-primary" />
    </div>
  )
}

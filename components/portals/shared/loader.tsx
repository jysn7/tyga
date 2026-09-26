export function Loader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70 animation-duration-[0.9s]"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  )
}

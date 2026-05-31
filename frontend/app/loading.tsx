export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[#4f90f3]/20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-[#4f90f3] border-r-[#4f90f3] border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-[#4f90f3]/5 animate-pulse" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4f90f3] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#4f90f3] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#4f90f3] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

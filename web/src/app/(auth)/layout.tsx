export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 px-4 py-8 shadow-sm rounded-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800">
        {children}
      </div>
    </div>
  )
}

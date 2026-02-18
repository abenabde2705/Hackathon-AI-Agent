export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-bold text-blue-600">Staff Dashboard</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}

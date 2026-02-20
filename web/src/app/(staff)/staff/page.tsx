export default function StaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      <p className="text-zinc-500">Gérez les offres d&apos;emploi et les événements.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
          <h3 className="font-semibold">Jobs Actifs</h3>
          <p className="text-2xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  )
}

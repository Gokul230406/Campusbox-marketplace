import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <main className="min-h-screen bg-background py-12 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </main>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      <Link href="/admin">
        <Button>Admin</Button>
      </Link>
    </main>
  )
}

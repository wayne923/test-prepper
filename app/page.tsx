import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          SAT with {' '}
          <span className="text-blue-600">AI-powered</span> Practice
        </h1>
        
        <p className="mt-3 text-2xl">
          Adaptive learning that finds your weak spot and helps you improve
        </p>

        <div className="flex mt-6">
          <Link href="/diagnostic">
            <Button size="lg" className="text-lg px-8">
              Start Free Diagnostic Test →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
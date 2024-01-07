'use client' // Error components must be Client Components
 
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div> 
        <div className="flex flex-col items-center justify-center">
            <h2 className="flex text-4xl">Something went wrong!</h2>
            <p className="flex m-4 text-2xl font-bold text-red-600">
                {error.message}
            </p>
            <Link href={`/`} className="flex items-center">
                <Button variant={"default"}>
                    Go Home
                </Button>
            </Link>
        </div>
    </div>
  )
}
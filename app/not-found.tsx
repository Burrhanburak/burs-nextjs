import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link
        href={siteConfig.links.dashboard.home}
        aria-label="Go to home page"
      >
        <div className="relative flex items-center justify-center rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
          <Logo
            className="size-8 text-blue-500 dark:text-blue-500"
            aria-hidden="true"
          />
        </div>
      </Link>
      <div className="mt-6 flex flex-col">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {siteConfig.name}
        </h1>
      </div>
      <p
        className="mt-6 text-4xl font-semibold text-blue-600 sm:text-5xl dark:text-blue-500"
        aria-hidden="true"
      >
        404
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sorry, we could not find the page you are looking for.
      </p>
      <Button asChild className="group mt-8" variant="secondary">
        <Link href={siteConfig.links.dashboard.home}>Go to the home page</Link>
      </Button>
    </div>
  )
}

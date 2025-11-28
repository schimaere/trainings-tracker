"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Training Tracker
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/dashboard/body-metrics"
            className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Body Metrics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your weight and body fat percentage over time
            </p>
            <div className="mt-4 text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              View &rarr;
            </div>
          </Link>

          <Link
            href="/dashboard/nutrition"
            className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Nutrition Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Log your meals and track calories and macros
            </p>
            <div className="mt-4 text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              View &rarr;
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}


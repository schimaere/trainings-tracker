"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface BodyMetric {
  id: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  recorded_at: string;
  created_at: string;
}

export default function BodyMetricsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: "",
    body_fat_percentage: "",
    recorded_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMetrics();
    }
  }, [session]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/body-metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/body-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
          body_fat_percentage: formData.body_fat_percentage
            ? parseFloat(formData.body_fat_percentage)
            : undefined,
          recorded_at: formData.recorded_at,
        }),
      });

      if (response.ok) {
        await fetchMetrics();
        setShowForm(false);
        setFormData({
          weight_kg: "",
          body_fat_percentage: "",
          recorded_at: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error creating metric:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/body-metrics/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMetrics();
      }
    } catch (error) {
      console.error("Error deleting metric:", error);
    }
  };

  const chartData = metrics
    .filter((m) => m.weight_kg || m.body_fat_percentage)
    .map((m) => ({
      date: format(parseISO(m.recorded_at), "MMM dd"),
      weight: m.weight_kg,
      bodyFat: m.body_fat_percentage,
    }))
    .reverse();

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600"
            >
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Body Metrics
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Track Your Progress
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Add Entry"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, weight_kg: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.body_fat_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      body_fat_percentage: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.recorded_at}
                  onChange={(e) =>
                    setFormData({ ...formData, recorded_at: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Save Entry
            </button>
          </form>
        )}

        {chartData.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Progress Chart
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  name="Weight (kg)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#ef4444"
                  name="Body Fat (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              History
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {metrics.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No entries yet. Add your first entry to get started!
              </div>
            ) : (
              metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {format(parseISO(metric.recorded_at), "MMM dd, yyyy")}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.weight_kg && `Weight: ${metric.weight_kg} kg`}
                      {metric.weight_kg && metric.body_fat_percentage && " • "}
                      {metric.body_fat_percentage &&
                        `Body Fat: ${metric.body_fat_percentage}%`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(metric.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


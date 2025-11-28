"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  quantity: number;
  unit: string;
  consumed_at: string;
  created_at: string;
}

interface Totals {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export default function NutritionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<Totals>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [goals, setGoals] = useState<Goals>({
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
  });
  const [goalsFormData, setGoalsFormData] = useState<Goals>({
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState({
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    quantity: "1",
    unit: "serving",
    consumed_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(`/api/nutrition?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setTotals(data.totals);
        if (data.goals) {
          setGoals(data.goals);
        }
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch("/api/nutrition/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        setGoalsFormData(data);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchGoals();
    }
  }, [session, fetchGoals]);

  useEffect(() => {
    if (session) {
      fetchEntries();
    }
  }, [session, fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_name: formData.food_name,
          calories: parseFloat(formData.calories),
          protein_g: parseFloat(formData.protein_g) || 0,
          carbs_g: parseFloat(formData.carbs_g) || 0,
          fat_g: parseFloat(formData.fat_g) || 0,
          quantity: parseFloat(formData.quantity) || 1,
          unit: formData.unit,
          consumed_at: formData.consumed_at,
        }),
      });

      if (response.ok) {
        await fetchEntries();
        setShowForm(false);
        setFormData({
          food_name: "",
          calories: "",
          protein_g: "",
          carbs_g: "",
          fat_g: "",
          quantity: "1",
          unit: "serving",
          consumed_at: selectedDate,
        });
      }
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/nutrition/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEntries();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/nutrition/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalsFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        setShowGoalsForm(false);
        await fetchEntries(); // Refresh to get updated goals
      }
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

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
              Nutrition Tracking
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Track Your Nutrition
          </h2>
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {showForm ? "Cancel" : "Add Food"}
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.food_name}
                  onChange={(e) =>
                    setFormData({ ...formData, food_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calories *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein_g}
                  onChange={(e) =>
                    setFormData({ ...formData, protein_g: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs_g}
                  onChange={(e) =>
                    setFormData({ ...formData, carbs_g: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat_g}
                  onChange={(e) =>
                    setFormData({ ...formData, fat_g: e.target.value })
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
                  value={formData.consumed_at}
                  onChange={(e) =>
                    setFormData({ ...formData, consumed_at: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Add Entry
            </button>
          </form>
        )}

        {/* Goals Section */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily Nutrition Goals
            </h3>
            <button
              onClick={() => {
                setGoalsFormData(goals);
                setShowGoalsForm(!showGoalsForm);
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {showGoalsForm ? "Cancel" : "Edit Goals"}
            </button>
          </div>

          {showGoalsForm ? (
            <form onSubmit={handleGoalsSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Calories
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={goalsFormData.calories}
                    onChange={(e) =>
                      setGoalsFormData({
                        ...goalsFormData,
                        calories: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={goalsFormData.protein_g}
                    onChange={(e) =>
                      setGoalsFormData({
                        ...goalsFormData,
                        protein_g: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={goalsFormData.carbs_g}
                    onChange={(e) =>
                      setGoalsFormData({
                        ...goalsFormData,
                        carbs_g: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={goalsFormData.fat_g}
                    onChange={(e) =>
                      setGoalsFormData({
                        ...goalsFormData,
                        fat_g: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Save Goals
              </button>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Calories
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(totals.total_calories)} / {Math.round(goals.calories)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      getProgressPercentage(totals.total_calories, goals.calories)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(totals.total_calories, goals.calories),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(
                    getProgressPercentage(totals.total_calories, goals.calories)
                  )}
                  % of goal
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Protein
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(totals.total_protein)}g / {Math.round(goals.protein_g)}g
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      getProgressPercentage(totals.total_protein, goals.protein_g)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(totals.total_protein, goals.protein_g),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(
                    getProgressPercentage(totals.total_protein, goals.protein_g)
                  )}
                  % of goal
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(totals.total_carbs)}g / {Math.round(goals.carbs_g)}g
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      getProgressPercentage(totals.total_carbs, goals.carbs_g)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(totals.total_carbs, goals.carbs_g),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(
                    getProgressPercentage(totals.total_carbs, goals.carbs_g)
                  )}
                  % of goal
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fat</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(totals.total_fat)}g / {Math.round(goals.fat_g)}g
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      getProgressPercentage(totals.total_fat, goals.fat_g)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(totals.total_fat, goals.fat_g),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(
                    getProgressPercentage(totals.total_fat, goals.fat_g)
                  )}
                  % of goal
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Food Entries - {format(parseISO(selectedDate + "T00:00:00"), "MMM dd, yyyy")}
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {entries.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No entries for this date. Add your first meal to get started!
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {entry.food_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.calories} cal • {entry.protein_g}g protein •{" "}
                      {entry.carbs_g}g carbs • {entry.fat_g}g fat
                      {entry.quantity !== 1 && ` • ${entry.quantity} ${entry.unit}`}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {format(parseISO(entry.consumed_at), "h:mm a")}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400"
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


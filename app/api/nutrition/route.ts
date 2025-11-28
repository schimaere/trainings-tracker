import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const foodEntrySchema = z.object({
  food_name: z.string().min(1),
  calories: z.number().positive(),
  protein_g: z.number().min(0).default(0),
  carbs_g: z.number().min(0).default(0),
  fat_g: z.number().min(0).default(0),
  quantity: z.number().positive().default(1),
  unit: z.string().default("serving"),
  consumed_at: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = sql`
        SELECT id, food_name, calories, protein_g, carbs_g, fat_g, quantity, unit, consumed_at, created_at
        FROM food_entries
        WHERE user_id = ${session.user.id}
          AND consumed_at >= ${startOfDay.toISOString()}
          AND consumed_at <= ${endOfDay.toISOString()}
        ORDER BY consumed_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT id, food_name, calories, protein_g, carbs_g, fat_g, quantity, unit, consumed_at, created_at
        FROM food_entries
        WHERE user_id = ${session.user.id}
        ORDER BY consumed_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const entries = await query;

    // Calculate totals for the day
    const totals = await sql`
      SELECT 
        COALESCE(SUM(calories), 0) as total_calories,
        COALESCE(SUM(protein_g), 0) as total_protein,
        COALESCE(SUM(carbs_g), 0) as total_carbs,
        COALESCE(SUM(fat_g), 0) as total_fat
      FROM food_entries
      WHERE user_id = ${session.user.id}
        ${date ? sql`AND DATE(consumed_at) = DATE(${date})` : sql``}
    `;

    // Fetch user's nutrition goals
    const goals = await sql`
      SELECT calories, protein_g, carbs_g, fat_g
      FROM nutrition_goals
      WHERE user_id = ${session.user.id}
    `;

    const defaultGoals = {
      calories: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 65,
    };

    const userGoals = goals.length > 0 ? goals[0] : defaultGoals;

    return NextResponse.json({
      entries,
      totals: totals[0],
      goals: userGoals,
    });
  } catch (error) {
    console.error("Error fetching nutrition entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = foodEntrySchema.parse(body);

    const consumedAt = validated.consumed_at
      ? new Date(validated.consumed_at)
      : new Date();

    const result = await sql`
      INSERT INTO food_entries (
        user_id, food_name, calories, protein_g, carbs_g, fat_g, quantity, unit, consumed_at
      )
      VALUES (
        ${session.user.id},
        ${validated.food_name},
        ${validated.calories},
        ${validated.protein_g},
        ${validated.carbs_g},
        ${validated.fat_g},
        ${validated.quantity},
        ${validated.unit},
        ${consumedAt.toISOString()}
      )
      RETURNING id, food_name, calories, protein_g, carbs_g, fat_g, quantity, unit, consumed_at, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating food entry:", error);
    return NextResponse.json(
      { error: "Failed to create food entry" },
      { status: 500 }
    );
  }
}


import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const nutritionGoalsSchema = z.object({
  calories: z.number().positive().optional(),
  protein_g: z.number().min(0).optional(),
  carbs_g: z.number().min(0).optional(),
  fat_g: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await sql`
      SELECT id, calories, protein_g, carbs_g, fat_g, updated_at
      FROM nutrition_goals
      WHERE user_id = ${session.user.id}
    `;

    if (goals.length === 0) {
      // Return default goals if none exist
      return NextResponse.json({
        id: null,
        calories: 2000,
        protein_g: 150,
        carbs_g: 200,
        fat_g: 65,
        updated_at: null,
      });
    }

    return NextResponse.json(goals[0]);
  } catch (error) {
    console.error("Error fetching nutrition goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition goals" },
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
    const validated = nutritionGoalsSchema.parse(body);

    // Use upsert to create or update goals
    const result = await sql`
      INSERT INTO nutrition_goals (user_id, calories, protein_g, carbs_g, fat_g, updated_at)
      VALUES (
        ${session.user.id},
        ${validated.calories ?? 2000},
        ${validated.protein_g ?? 150},
        ${validated.carbs_g ?? 200},
        ${validated.fat_g ?? 65},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        calories = EXCLUDED.calories,
        protein_g = EXCLUDED.protein_g,
        carbs_g = EXCLUDED.carbs_g,
        fat_g = EXCLUDED.fat_g,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, calories, protein_g, carbs_g, fat_g, updated_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating/updating nutrition goals:", error);
    return NextResponse.json(
      { error: "Failed to save nutrition goals" },
      { status: 500 }
    );
  }
}


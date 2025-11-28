import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyMetricSchema = z.object({
  weight_kg: z.number().positive().optional(),
  body_fat_percentage: z.number().min(0).max(100).optional(),
  recorded_at: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    const metrics = await sql`
      SELECT id, weight_kg, body_fat_percentage, recorded_at, created_at
      FROM body_metrics
      WHERE user_id = ${session.user.id}
      ORDER BY recorded_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching body metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch body metrics" },
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
    const validated = bodyMetricSchema.parse(body);

    const recordedAt = validated.recorded_at
      ? new Date(validated.recorded_at)
      : new Date();

    const result = await sql`
      INSERT INTO body_metrics (user_id, weight_kg, body_fat_percentage, recorded_at)
      VALUES (
        ${session.user.id},
        ${validated.weight_kg || null},
        ${validated.body_fat_percentage || null},
        ${recordedAt.toISOString()}
      )
      RETURNING id, weight_kg, body_fat_percentage, recorded_at, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating body metric:", error);
    return NextResponse.json(
      { error: "Failed to create body metric" },
      { status: 500 }
    );
  }
}


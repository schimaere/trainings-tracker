import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await sql`
      DELETE FROM body_metrics
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting body metric:", error);
    return NextResponse.json(
      { error: "Failed to delete body metric" },
      { status: 500 }
    );
  }
}


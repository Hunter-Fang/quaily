import { NextResponse } from "next/server";
import { getSportStats } from "@/lib/sport";

export async function GET() {
  try {
    const stats = await getSportStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("Sport API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load sport data" },
      { status: 500 }
    );
  }
}

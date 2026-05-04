import { NextResponse } from "next/server";
import { getSportRecords } from "@/lib/sport";

/**
 * GET /api/sport/all
 * Returns ALL sport records (for "Load More" button).
 */
export async function GET() {
  try {
    const records = await getSportRecords(0); // 0 = all records
    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

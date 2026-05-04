import { NextResponse } from "next/server";
import { getSportStats, getSportRecords } from "@/lib/sport";

/**
 * GET /api/sport/initial
 * Returns stats (computed from ALL records) + first 20 records for fast initial load.
 */
export async function GET() {
  try {
    // Get all records for accurate stats
    const allRecords = await getSportRecords(0); // 0 = all
    if (!allRecords || allRecords.length === 0) {
      return NextResponse.json({ totalCount: 0, records: [] });
    }

    // Compute stats from all records
    const stats = await getSportStats(allRecords);

    // Only send first 20 records to client (reduce payload)
    const records = allRecords.slice(0, 20);

    return NextResponse.json({ stats, records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

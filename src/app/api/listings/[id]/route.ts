import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prisma = await getPrisma();

    const listings = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT l."id", l."title", l."description", l."rent", l."propertyType", l."address", l."images",
              ST_X(l."location"::geometry) as longitude,
              ST_Y(l."location"::geometry) as latitude,
              l."createdAt", l."updatedAt",
              u."id" as "userId", u."name" as "ownerName", u."role" as "ownerType", u."phone" as "ownerPhone"
       FROM listings l
       JOIN users u ON l."userId" = u."id"
       WHERE l."id" = $1`,
      id
    );

    if (!listings.length) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listings[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { searchListingsSchema } from "@/lib/validations/listing";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = searchListingsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { longitude, latitude, radius, propertyType, minRent, maxRent, ownerType, limit, offset } = parsed.data;
    const prisma = await getPrisma();

    const conditions: string[] = [
      `ST_DWithin(l."location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    ];
    const values: (string | number)[] = [longitude, latitude, radius];
    let paramIndex = 4;

    if (propertyType) {
      conditions.push(`l."propertyType" = $${paramIndex}::"PropertyType"`);
      values.push(propertyType);
      paramIndex++;
    }

    if (minRent !== undefined) {
      conditions.push(`l."rent" >= $${paramIndex}`);
      values.push(minRent);
      paramIndex++;
    }

    if (maxRent !== undefined) {
      conditions.push(`l."rent" <= $${paramIndex}`);
      values.push(maxRent);
      paramIndex++;
    }

    if (ownerType) {
      conditions.push(`u."role" = $${paramIndex}::"Role"`);
      values.push(ownerType);
      paramIndex++;
    }

    values.push(limit, offset);

    const sql = `
      SELECT l."id", l."title", l."rent", l."propertyType", l."address", l."images",
             ST_X(l."location"::geometry) as longitude,
             ST_Y(l."location"::geometry) as latitude,
             ST_Distance(l."location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance,
             u."name" as "ownerName", u."role" as "ownerType"
      FROM listings l
      JOIN users u ON l."userId" = u."id"
      WHERE ${conditions.join(" AND ")}
      ORDER BY distance ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const listings = await prisma.$queryRawUnsafe(sql, ...values);

    return NextResponse.json({ listings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

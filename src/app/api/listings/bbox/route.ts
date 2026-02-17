import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { boundingBoxSchema } from "@/lib/validations/listing";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = boundingBoxSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { swLng, swLat, neLng, neLat, propertyType, minRent, maxRent, ownerType, limit } = parsed.data;
    const prisma = await getPrisma();

    const conditions: string[] = [
      `ST_Intersects(l."location", ST_MakeEnvelope($1, $2, $3, $4, 4326)::geography)`,
    ];
    const values: (string | number)[] = [swLng, swLat, neLng, neLat];
    let paramIndex = 5;

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

    values.push(limit);

    const sql = `
      SELECT l."id", l."title", l."rent", l."propertyType", l."address", l."images",
             ST_X(l."location"::geometry) as longitude,
             ST_Y(l."location"::geometry) as latitude,
             u."name" as "ownerName", u."role" as "ownerType"
      FROM listings l
      JOIN users u ON l."userId" = u."id"
      WHERE ${conditions.join(" AND ")}
      LIMIT $${paramIndex}
    `;

    const listings = await prisma.$queryRawUnsafe(sql, ...values);

    return NextResponse.json({ listings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

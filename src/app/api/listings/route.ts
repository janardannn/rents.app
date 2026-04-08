import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations/listing";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Only owners can create listings" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title, description, rent, deposit, maintenance, propertyType, furnishing,
      bedrooms, bathrooms, floor, totalFloors, area, amenities, availableFrom,
      address, longitude, latitude, images,
    } = parsed.data;
    const prisma = await getPrisma();

    const listing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `INSERT INTO listings (
        "id", "title", "description", "rent", "deposit", "maintenance",
        "propertyType", "furnishing", "bedrooms", "bathrooms", "floor", "totalFloors",
        "area", "amenities", "availableFrom", "address", "location", "images",
        "userId", "createdAt", "updatedAt"
       )
       VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5,
        $6::"PropertyType", $7::"FurnishingStatus", $8, $9, $10, $11,
        $12, $13, $14, $15, ST_SetSRID(ST_MakePoint($16, $17), 4326)::geography, $18,
        $19, NOW(), NOW()
       )
       RETURNING "id"`,
      title,
      description,
      rent,
      deposit ?? null,
      maintenance ?? null,
      propertyType,
      furnishing,
      bedrooms ?? null,
      bathrooms ?? null,
      floor ?? null,
      totalFloors ?? null,
      area ?? null,
      amenities,
      availableFrom ? new Date(availableFrom) : null,
      address,
      longitude,
      latitude,
      images,
      session.user.id
    );

    return NextResponse.json({ id: listing[0].id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

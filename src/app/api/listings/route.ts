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

    if (!["OWNER", "BROKER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only owners and brokers can create listings" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, rent, propertyType, address, longitude, latitude, images } = parsed.data;
    const prisma = await getPrisma();

    const listing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `INSERT INTO listings ("id", "title", "description", "rent", "propertyType", "address", "location", "images", "userId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4::"PropertyType", $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, $8, $9, NOW(), NOW())
       RETURNING "id"`,
      title,
      description,
      rent,
      propertyType,
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

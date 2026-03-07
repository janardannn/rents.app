CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "Role" AS ENUM ('USER', 'OWNER', 'ADMIN');
CREATE TYPE "OwnerType" AS ENUM ('INDIVIDUAL', 'BROKER');
CREATE TYPE "PropertyType" AS ENUM ('PG', 'FLAT', 'SHARED');
CREATE TYPE "FurnishingStatus" AS ENUM ('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "ownerType" "OwnerType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rent" INTEGER NOT NULL,
    "deposit" INTEGER,
    "maintenance" INTEGER,
    "propertyType" "PropertyType" NOT NULL,
    "furnishing" "FurnishingStatus" NOT NULL DEFAULT 'SEMI_FURNISHED',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "area" INTEGER,
    "amenities" TEXT[],
    "availableFrom" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "images" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "listings_location_idx" ON "listings" USING GIST ("location");

CREATE INDEX "listings_userId_idx" ON "listings"("userId");

ALTER TABLE "listings" ADD CONSTRAINT "listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

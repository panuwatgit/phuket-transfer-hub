-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('VAN_VIP8', 'VAN_VIP10', 'SUV', 'SEDAN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('AIRPORT', 'POINT_TO_POINT', 'DAILY_CHARTER', 'MULTI_DAY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'SOURCING', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentTerm" AS ENUM ('FULL_PREPAID', 'DEPOSIT_50', 'CREDIT');

-- CreateEnum
CREATE TYPE "ContactChannel" AS ENUM ('LINE', 'PHONE');

-- CreateEnum
CREATE TYPE "AirportDirection" AS ENUM ('FROM_AIRPORT', 'TO_AIRPORT');

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 4,
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "type" "VehicleType" NOT NULL,
    "plate" TEXT NOT NULL,
    "model" TEXT,
    "seats" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "costAirport" INTEGER,
    "costDaily" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleCount" INTEGER NOT NULL DEFAULT 1,
    "serviceType" "ServiceType" NOT NULL,
    "direction" "AirportDirection",
    "pickupDate" DATE NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "pickupPlace" TEXT NOT NULL,
    "dropoffPlace" TEXT,
    "dropoffProvince" TEXT,
    "roundTrip" BOOLEAN NOT NULL DEFAULT false,
    "returnDate" DATE,
    "returnTime" TEXT,
    "flightNo" TEXT,
    "days" INTEGER,
    "itinerary" TEXT,
    "passengers" INTEGER NOT NULL,
    "luggage" INTEGER NOT NULL DEFAULT 0,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "company" TEXT,
    "contactChannel" "ContactChannel" NOT NULL DEFAULT 'LINE',
    "customerNote" TEXT,
    "lineUserId" TEXT,
    "lineLinkedAt" TIMESTAMP(3),
    "vehicleId" INTEGER,
    "costPrice" INTEGER,
    "sellPrice" INTEGER,
    "otRate" INTEGER NOT NULL DEFAULT 300,
    "otHours" INTEGER NOT NULL DEFAULT 0,
    "fuelIncluded" BOOLEAN NOT NULL DEFAULT false,
    "paymentTerm" "PaymentTerm" NOT NULL DEFAULT 'FULL_PREPAID',
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusLog" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus" NOT NULL,
    "note" TEXT,
    "actor" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Vehicle_type_active_idx" ON "Vehicle"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequest_code_key" ON "BookingRequest"("code");

-- CreateIndex
CREATE INDEX "BookingRequest_status_createdAt_idx" ON "BookingRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BookingRequest_pickupDate_idx" ON "BookingRequest"("pickupDate");

-- CreateIndex
CREATE INDEX "BookingRequest_lineUserId_idx" ON "BookingRequest"("lineUserId");

-- CreateIndex
CREATE INDEX "StatusLog_requestId_createdAt_idx" ON "StatusLog"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

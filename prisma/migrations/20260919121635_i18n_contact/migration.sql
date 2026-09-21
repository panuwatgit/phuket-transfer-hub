-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContactChannel" ADD VALUE 'WHATSAPP';
ALTER TYPE "ContactChannel" ADD VALUE 'EMAIL';

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "email" TEXT,
ADD COLUMN     "lang" TEXT NOT NULL DEFAULT 'th';

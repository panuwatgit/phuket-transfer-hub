-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('QUOTE', 'RECEIPT');

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "token" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'th',
    "requestId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerCompany" TEXT,
    "customerPhone" TEXT NOT NULL,
    "customerTaxId" TEXT,
    "customerAddress" TEXT,
    "items" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "paidBefore" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentTerm" TEXT,
    "validDays" INTEGER,
    "showTaxId" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_number_key" ON "Document"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Document_token_key" ON "Document"("token");

-- CreateIndex
CREATE INDEX "Document_requestId_type_idx" ON "Document"("requestId", "type");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

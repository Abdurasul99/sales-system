-- Phase 2: Master data hardening
-- Adds supplier lead time, supplier rating, customer CRM fields,
-- and exchange rate + customer indexes.

-- Supplier: add leadTimeDays and rating
ALTER TABLE "Supplier" ADD COLUMN "leadTimeDays" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "Supplier" ADD COLUMN "rating" DECIMAL(3,2) NOT NULL DEFAULT 0;

-- Customer: add address, notes, purchaseCount, lastPurchaseAt
ALTER TABLE "Customer" ADD COLUMN "address" TEXT;
ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;
ALTER TABLE "Customer" ADD COLUMN "purchaseCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN "lastPurchaseAt" TIMESTAMP(3);

-- Customer: indexes for CRM queries (segment filter, RFM analysis)
CREATE INDEX "Customer_organizationId_segment_idx" ON "Customer"("organizationId", "segment");
CREATE INDEX "Customer_organizationId_lastPurchaseAt_idx" ON "Customer"("organizationId", "lastPurchaseAt");

-- ExchangeRate: index for fast lookups by org + currency pair + date
CREATE INDEX "ExchangeRate_organizationId_fromCurrency_toCurrency_effectiveDate_idx"
  ON "ExchangeRate"("organizationId", "fromCurrency", "toCurrency", "effectiveDate");

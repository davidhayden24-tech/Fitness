-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionProductId" TEXT,
ADD COLUMN     "subscriptionPurchaseToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionPurchaseToken_key" ON "User"("subscriptionPurchaseToken");


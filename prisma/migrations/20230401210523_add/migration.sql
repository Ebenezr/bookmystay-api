-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "accountNumber" DROP NOT NULL,
ALTER COLUMN "PaymentMode" DROP NOT NULL,
ALTER COLUMN "referenceId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Discount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ratio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

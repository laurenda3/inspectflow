-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MACHINIST', 'INSPECTOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "requiredThread" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gauge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastCalibrated" TIMESTAMP(3) NOT NULL,
    "calibrationIntervalDays" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gauge_pkey" PRIMARY KEY ("id")
);

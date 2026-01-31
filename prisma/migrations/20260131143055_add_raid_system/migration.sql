-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('READY', 'ACTIVE', 'SUCCESS', 'FAIL');

-- CreateTable
CREATE TABLE "Raid" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "problemId" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "damagePerHit" INTEGER NOT NULL DEFAULT 1,
    "status" "RaidStatus" NOT NULL DEFAULT 'READY',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Raid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidParticipation" (
    "id" TEXT NOT NULL,
    "raidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "solvedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaidParticipation_raidId_userId_key" ON "RaidParticipation"("raidId", "userId");

-- AddForeignKey
ALTER TABLE "RaidParticipation" ADD CONSTRAINT "RaidParticipation_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidParticipation" ADD CONSTRAINT "RaidParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

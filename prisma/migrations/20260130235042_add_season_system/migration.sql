-- AlterTable
ALTER TABLE "User" ADD COLUMN     "initialSolvedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "initialTier" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SeasonHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "finalSolvedCount" INTEGER NOT NULL,
    "finalTier" INTEGER NOT NULL,
    "earnedPoint" INTEGER NOT NULL,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeasonHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonHistory_userId_seasonName_key" ON "SeasonHistory"("userId", "seasonName");

-- AddForeignKey
ALTER TABLE "SeasonHistory" ADD CONSTRAINT "SeasonHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

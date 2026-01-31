-- CreateTable
CREATE TABLE "ClassRanking" (
    "id" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "classNum" INTEGER NOT NULL,
    "previousRank" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassRanking_campus_classNum_key" ON "ClassRanking"("campus", "classNum");

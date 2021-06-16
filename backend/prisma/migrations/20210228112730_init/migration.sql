-- CreateTable
CREATE TABLE "Puzzle" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" CHAR(42) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleInstance" (
    "id" CHAR(64) NOT NULL,
    "parameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "puzzleId" INTEGER,
    "authorId" CHAR(42),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT,
    "email" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Puzzle.name_unique" ON "Puzzle"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleInstance.parameters_unique" ON "PuzzleInstance"("parameters");

-- AddForeignKey
ALTER TABLE "Puzzle" ADD FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleInstance" ADD FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleInstance" ADD FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseOffering" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prerequisite" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "requiresId" TEXT NOT NULL,

    CONSTRAINT "Prerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workload" (
    "courseId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "Workload_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "public"."GECategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitsReq" INTEGER NOT NULL,
    "isHardReq" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GECategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "id" TEXT NOT NULL,
    "unitsPerQuarter" INTEGER NOT NULL,
    "quartersRemaining" INTEGER NOT NULL,
    "interests" TEXT[],
    "geUnitsDone" INTEGER NOT NULL DEFAULT 0,
    "writingSatisfied" BOOLEAN NOT NULL DEFAULT false,
    "completedIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "public"."Course"("code");

-- CreateIndex
CREATE INDEX "CourseOffering_courseId_year_quarter_idx" ON "public"."CourseOffering"("courseId", "year", "quarter");

-- AddForeignKey
ALTER TABLE "public"."CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prerequisite" ADD CONSTRAINT "Prerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prerequisite" ADD CONSTRAINT "Prerequisite_requiresId_fkey" FOREIGN KEY ("requiresId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workload" ADD CONSTRAINT "Workload_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

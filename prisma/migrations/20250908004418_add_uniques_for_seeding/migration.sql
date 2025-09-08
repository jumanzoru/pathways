/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,year,quarter]` on the table `CourseOffering` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,requiresId]` on the table `Prerequisite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "public"."Club"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_year_quarter_key" ON "public"."CourseOffering"("courseId", "year", "quarter");

-- CreateIndex
CREATE UNIQUE INDEX "Prerequisite_courseId_requiresId_key" ON "public"."Prerequisite"("courseId", "requiresId");

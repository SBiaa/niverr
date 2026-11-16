ALTER TABLE "Party" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Party_slug_key" ON "Party"("slug");
ALTER TABLE "Guest" ADD COLUMN "selfRegistered" BOOLEAN NOT NULL DEFAULT false;

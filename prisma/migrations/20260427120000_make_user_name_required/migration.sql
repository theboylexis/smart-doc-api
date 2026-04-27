-- Backfill any existing NULL names so the NOT NULL constraint can be applied.
-- Falls back to the email's local-part (the part before @) which is always
-- present and is a reasonable display name for legacy rows.
UPDATE "User" SET "name" = SPLIT_PART("email", '@', 1) WHERE "name" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

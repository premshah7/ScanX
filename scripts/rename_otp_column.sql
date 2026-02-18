-- Rename the column
ALTER TABLE "Otp" RENAME COLUMN "phone" TO "identifier";

-- Rename the index if it exists (Prisma usually names it Otp_phone_key)
ALTER INDEX "Otp_phone_key" RENAME TO "Otp_identifier_key";

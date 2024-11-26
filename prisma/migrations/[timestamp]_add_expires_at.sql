-- Add expiresAt column as nullable first
ALTER TABLE "intervenants" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Update existing rows to set expiresAt to 2 months after createdAt
UPDATE "intervenants" 
SET "expiresAt" = "createdAt" + INTERVAL '2 months';

-- Make the column required after setting values
ALTER TABLE "intervenants" ALTER COLUMN "expiresAt" SET NOT NULL; 
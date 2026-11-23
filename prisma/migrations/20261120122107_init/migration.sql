-- CreateEnum
CREATE TYPE "contact_topic" AS ENUM ('candidates', 'employers', 'verifiers', 'reviewers', 'enterprises', 'other');

-- CreateEnum
CREATE TYPE "contact_status" AS ENUM ('new', 'read', 'replied', 'archived');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('pending', 'sent', 'partial', 'failed', 'not_configured');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference" VARCHAR(32) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "organization" VARCHAR(120),
    "topic" "contact_topic" NOT NULL,
    "subject" VARCHAR(140) NOT NULL,
    "message" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "status" "contact_status" NOT NULL DEFAULT 'new',
    "delivery_status" "delivery_status" NOT NULL DEFAULT 'pending',
    "delivery_detail" VARCHAR(1000),
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(300),
    "referer" VARCHAR(300),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Unique reference (a real UNIQUE constraint, so it is listed under Constraints in pgAdmin)
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_reference_key" UNIQUE ("reference");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- Data-integrity CHECK constraints (not expressible in schema.prisma; Prisma leaves them untouched)
-- Mirrors the zod rules in lib/contact/schema.ts.
ALTER TABLE "contact_messages"
  ADD CONSTRAINT "contact_messages_reference_format_check" CHECK ("reference" ~ '^SP-[0-9]{8}-[A-Z0-9]{6,}$'),
  ADD CONSTRAINT "contact_messages_name_check"             CHECK (char_length(btrim("name")) >= 2),
  ADD CONSTRAINT "contact_messages_email_check"            CHECK ("email" = lower("email") AND "email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  ADD CONSTRAINT "contact_messages_subject_check"          CHECK (char_length(btrim("subject")) >= 4),
  ADD CONSTRAINT "contact_messages_message_check"          CHECK (char_length("message") BETWEEN 20 AND 4000),
  ADD CONSTRAINT "contact_messages_consent_check"          CHECK ("consent" = true);

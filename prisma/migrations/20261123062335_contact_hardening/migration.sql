-- contact_hardening: inet IP column, non-blank CHECKs, inbox index.
-- Existing rows are preserved (no DROP COLUMN; values are converted in place).

-- 1) ip: VARCHAR(64) -> INET.
--    Values that are not a valid IPv4/IPv6 address (e.g. "unknown") become NULL instead of failing.
CREATE FUNCTION pg_temp.sp_try_inet(value text) RETURNS inet
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;
  RETURN btrim(value)::inet;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

ALTER TABLE "contact_messages"
  ALTER COLUMN "ip" TYPE INET USING pg_temp.sp_try_inet("ip");

-- 2) Whitespace-only values are rejected by the database too (zod already trims on client + server).
ALTER TABLE "contact_messages"
  ADD CONSTRAINT "contact_messages_name_not_blank_check"    CHECK (btrim("name") <> ''),
  ADD CONSTRAINT "contact_messages_email_not_blank_check"   CHECK (btrim("email") <> ''),
  ADD CONSTRAINT "contact_messages_subject_not_blank_check" CHECK (btrim("subject") <> ''),
  ADD CONSTRAINT "contact_messages_message_not_blank_check" CHECK (btrim("message") <> '');

-- 3) Inbox index: WHERE status = ... ORDER BY created_at DESC.
--    Its leading column is "status", so it also serves status-only filters;
--    the old single-column status index is redundant and is dropped.
CREATE INDEX "contact_messages_status_created_at_idx" ON "contact_messages"("status", "created_at" DESC);

DROP INDEX "contact_messages_status_idx";
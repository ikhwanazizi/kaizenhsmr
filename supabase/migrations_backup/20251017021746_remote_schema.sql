


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."newsletter_status" AS ENUM (
    'subscribed',
    'unverified',
    'unsubscribed'
);


ALTER TYPE "public"."newsletter_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_active_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- When a user's status changes to inactive or suspended, ban them in auth
  IF NEW.status IN ('inactive', 'suspended') AND OLD.status = 'active' THEN
    -- Note: This requires a separate service to call the auth admin API
    -- The trigger itself cannot directly call auth.admin functions
    RAISE NOTICE 'User % status changed to %. Should be banned in auth.', NEW.id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_user_active_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_post_revision"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    next_revision_number integer;
    blocks_snapshot jsonb;
BEGIN
    -- Only create revision when status changes to 'published'
    IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN

        -- Get next revision number
        SELECT COALESCE(MAX(revision_number), 0) + 1
        INTO next_revision_number
        FROM public.post_revisions
        WHERE post_id = NEW.id;

        -- Get all blocks as JSONB array
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', type,
                'content', content,
                'order_index', order_index
            ) ORDER BY order_index
        )
        INTO blocks_snapshot
        FROM public.post_blocks
        WHERE post_id = NEW.id;

        -- Insert revision
        INSERT INTO public.post_revisions (
            post_id, title, excerpt, featured_image, featured_image_alt,
            seo_meta_title, seo_meta_description, seo_og_image, metadata,
            blocks, revision_number, created_by
        ) VALUES (
            NEW.id, NEW.title, NEW.excerpt, NEW.featured_image, NEW.featured_image_alt,
            NEW.seo_meta_title, NEW.seo_meta_description, NEW.seo_og_image, NEW.metadata,
            COALESCE(blocks_snapshot, '[]'::jsonb), next_revision_number, auth.uid()
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_post_revision"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_short_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_short_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users_with_profiles"() RETURNS TABLE("id" "uuid", "email" "text", "last_sign_in_at" timestamp with time zone, "full_name" "text", "role" "text", "status" "text", "created_by_id" "uuid", "created_by_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT
    u.id,
    u.email,
    u.last_sign_in_at,
    p.full_name,
    p.role,
    p.status,
    p.created_by as created_by_id,
    creator.full_name as created_by_name
  FROM
    auth.users u
  LEFT JOIN
    public.profiles p ON u.id = p.id
  LEFT JOIN
    public.profiles creator ON p.created_by = creator.id
  ORDER BY
    u.created_at DESC;
$$;


ALTER FUNCTION "public"."get_all_users_with_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_campaign_stats"("campaign_uuid" "uuid") RETURNS TABLE("total_sent" bigint, "total_failed" bigint, "total_opened" bigint, "total_clicked" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    SELECT 
        COUNT(*) FILTER (WHERE status = 'sent') as total_sent,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked
    FROM public.newsletter_send_log
    WHERE campaign_id = campaign_uuid;
$$;


ALTER FUNCTION "public"."get_campaign_stats"("campaign_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_last_sign_in"("user_id" "uuid") RETURNS timestamp with time zone
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT last_sign_in_at 
  FROM auth.users 
  WHERE id = user_id;
$$;


ALTER FUNCTION "public"."get_user_last_sign_in"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_status_by_email"("_email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT status
    FROM public.profiles
    WHERE email = _email
  );
END;
$$;


ALTER FUNCTION "public"."get_user_status_by_email"("_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_contact_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.contact_interactions (
      contact_id,
      interaction_type,
      old_value,
      new_value,
      created_by,
      created_at
    ) VALUES (
      NEW.id,
      'status_change',
      OLD.status::text,
      NEW.status::text,
      auth.uid()::uuid,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_contact_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_contact_last_reply"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.contacts
  SET 
    last_reply_at = NEW.created_at,
    status = 'replied',
    updated_at = NOW()
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contact_last_reply"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_contacts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contacts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "target_user_id" "uuid",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "reply_message" "text" NOT NULL,
    "reply_method" "text" NOT NULL,
    "replied_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contact_replies_reply_method_check" CHECK (("reply_method" = ANY (ARRAY['in_app'::"text", 'email_client'::"text"])))
);


ALTER TABLE "public"."contact_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "contact_number" "text" NOT NULL,
    "company" "text" NOT NULL,
    "business_email" "text" NOT NULL,
    "company_size" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reply_note" "text",
    "replied_at" timestamp with time zone,
    "replied_by" "uuid",
    "last_reply_at" timestamp with time zone,
    "is_starred" boolean DEFAULT false,
    CONSTRAINT "contacts_company_size_check" CHECK (("company_size" = ANY (ARRAY['1-50'::"text", '51-200'::"text", '201-500'::"text", '501-1000'::"text", '1000-1500'::"text", '1501-2000'::"text", '2001-3000'::"text", '3000+'::"text"]))),
    CONSTRAINT "contacts_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'replied'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "preview_text" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "sent_by" "uuid" NOT NULL,
    "total_recipients" integer DEFAULT 0 NOT NULL,
    "total_sent" integer DEFAULT 0,
    "total_failed" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "newsletter_campaigns_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sending'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."newsletter_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_send_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "subscriber_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "sent_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "newsletter_send_log_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'failed'::"text", 'bounced'::"text"])))
);


ALTER TABLE "public"."newsletter_send_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "status" "public"."newsletter_status" DEFAULT 'unverified'::"public"."newsletter_status" NOT NULL,
    "verification_token" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verified_at" timestamp with time zone,
    "unsubscribe_token" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."newsletter_subscribers"."status" IS 'Status of the subscription';



COMMENT ON COLUMN "public"."newsletter_subscribers"."verification_token" IS 'Unique token sent to the user for verification';



COMMENT ON COLUMN "public"."newsletter_subscribers"."verified_at" IS 'Timestamp of when the user verified their email';



CREATE TABLE IF NOT EXISTS "public"."post_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "jsonb" NOT NULL,
    "order_index" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "post_blocks_type_check" CHECK (("type" = ANY (ARRAY['heading'::"text", 'paragraph'::"text", 'image'::"text", 'video'::"text", 'code'::"text", 'quote'::"text", 'divider'::"text", 'list'::"text"])))
);


ALTER TABLE "public"."post_blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_revisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "featured_image" "text",
    "featured_image_alt" "text",
    "seo_meta_title" "text",
    "seo_meta_description" "text",
    "seo_og_image" "text",
    "metadata" "jsonb",
    "blocks" "jsonb" NOT NULL,
    "revision_number" integer NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "change_summary" "text"
);


ALTER TABLE "public"."post_revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "featured_image" "text",
    "featured_image_alt" "text",
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "seo_meta_title" "text",
    "seo_meta_description" "text",
    "seo_og_image" "text",
    "metadata" "jsonb",
    "author_id" "uuid",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_autosaved_at" timestamp with time zone,
    "send_to_newsletter" boolean DEFAULT false,
    "newsletter_sent_at" timestamp with time zone,
    "newsletter_subject" "text",
    "newsletter_preview_text" "text",
    "short_id" "text" DEFAULT "public"."generate_short_id"(),
    CONSTRAINT "posts_category_check" CHECK (("category" = ANY (ARRAY['blog'::"text", 'development'::"text"]))),
    CONSTRAINT "posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"]))),
    CONSTRAINT "short_id_length" CHECK (("char_length"("short_id") = 8))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'admin'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))),
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_replies"
    ADD CONSTRAINT "contact_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_campaigns"
    ADD CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_send_log"
    ADD CONSTRAINT "newsletter_send_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_unsubscribe_token_key" UNIQUE ("unsubscribe_token");



ALTER TABLE ONLY "public"."post_blocks"
    ADD CONSTRAINT "post_blocks_order_unique" UNIQUE ("post_id", "order_index");



ALTER TABLE ONLY "public"."post_blocks"
    ADD CONSTRAINT "post_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_revisions"
    ADD CONSTRAINT "post_revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_revisions"
    ADD CONSTRAINT "post_revisions_unique" UNIQUE ("post_id", "revision_number");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_short_id_key" UNIQUE ("short_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_contact_replies_contact_id" ON "public"."contact_replies" USING "btree" ("contact_id");



CREATE INDEX "idx_contact_replies_created_at" ON "public"."contact_replies" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_contacts_created_at" ON "public"."contacts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_contacts_starred" ON "public"."contacts" USING "btree" ("is_starred") WHERE ("is_starred" = true);



CREATE INDEX "idx_contacts_status" ON "public"."contacts" USING "btree" ("status");



CREATE INDEX "idx_newsletter_campaigns_post_id" ON "public"."newsletter_campaigns" USING "btree" ("post_id");



CREATE INDEX "idx_newsletter_campaigns_sent_at" ON "public"."newsletter_campaigns" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_newsletter_campaigns_status" ON "public"."newsletter_campaigns" USING "btree" ("status");



CREATE INDEX "idx_newsletter_send_log_campaign_id" ON "public"."newsletter_send_log" USING "btree" ("campaign_id");



CREATE INDEX "idx_newsletter_send_log_status" ON "public"."newsletter_send_log" USING "btree" ("status");



CREATE INDEX "idx_newsletter_send_log_subscriber_id" ON "public"."newsletter_send_log" USING "btree" ("subscriber_id");



CREATE INDEX "idx_newsletter_subscribers_unsubscribe_token" ON "public"."newsletter_subscribers" USING "btree" ("unsubscribe_token");



CREATE INDEX "idx_post_blocks_post_id_order" ON "public"."post_blocks" USING "btree" ("post_id", "order_index");



CREATE INDEX "idx_post_revisions_post_id" ON "public"."post_revisions" USING "btree" ("post_id", "revision_number" DESC);



CREATE INDEX "idx_posts_author_id" ON "public"."posts" USING "btree" ("author_id");



CREATE INDEX "idx_posts_category_status" ON "public"."posts" USING "btree" ("category", "status");



CREATE INDEX "idx_posts_newsletter" ON "public"."posts" USING "btree" ("send_to_newsletter", "newsletter_sent_at") WHERE ("send_to_newsletter" = true);



CREATE INDEX "idx_posts_published_at" ON "public"."posts" USING "btree" ("published_at" DESC) WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_posts_slug" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "idx_profiles_id_status" ON "public"."profiles" USING "btree" ("id", "status");



CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("status");



CREATE UNIQUE INDEX "posts_short_id_unique" ON "public"."posts" USING "btree" ("short_id");



CREATE OR REPLACE TRIGGER "contact_reply_update_trigger" AFTER INSERT ON "public"."contact_replies" FOR EACH ROW EXECUTE FUNCTION "public"."update_contact_last_reply"();



CREATE OR REPLACE TRIGGER "contacts_updated_at_trigger" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."update_contacts_updated_at"();



CREATE OR REPLACE TRIGGER "on_post_publish" AFTER UPDATE OF "status" ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."create_post_revision"();



CREATE OR REPLACE TRIGGER "on_profile_status_change" AFTER UPDATE OF "status" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."check_user_active_status"();



CREATE OR REPLACE TRIGGER "update_post_blocks_updated_at" BEFORE UPDATE ON "public"."post_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_replies"
    ADD CONSTRAINT "contact_replies_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_replies"
    ADD CONSTRAINT "contact_replies_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."newsletter_campaigns"
    ADD CONSTRAINT "newsletter_campaigns_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."newsletter_campaigns"
    ADD CONSTRAINT "newsletter_campaigns_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."newsletter_send_log"
    ADD CONSTRAINT "newsletter_send_log_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."newsletter_send_log"
    ADD CONSTRAINT "newsletter_send_log_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_blocks"
    ADD CONSTRAINT "post_blocks_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_revisions"
    ADD CONSTRAINT "post_revisions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."post_revisions"
    ADD CONSTRAINT "post_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create campaigns" ON "public"."newsletter_campaigns" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins can manage all post blocks" ON "public"."post_blocks" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins can manage all posts" ON "public"."posts" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins can view campaigns" ON "public"."newsletter_campaigns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins can view post revisions" ON "public"."post_revisions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins can view send logs" ON "public"."newsletter_send_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Allow authenticated admins to update contacts" ON "public"."contacts" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Allow authenticated admins to view contacts" ON "public"."contacts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Allow authenticated admins to view replies" ON "public"."contact_replies" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Allow only super_admin to create replies" ON "public"."contact_replies" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Allow only super_admin to delete contacts" ON "public"."contacts" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Allow only super_admin to delete replies" ON "public"."contact_replies" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Allow public insert access" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public insert on contacts" ON "public"."contacts" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow super_admin to update own replies" ON "public"."contact_replies" FOR UPDATE TO "authenticated" USING ((("replied_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))))) WITH CHECK ((("replied_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text"))))));



CREATE POLICY "Block public delete access" ON "public"."newsletter_subscribers" FOR DELETE USING (false);



CREATE POLICY "Block public read access" ON "public"."newsletter_subscribers" FOR SELECT USING (false);



CREATE POLICY "Block public update and delete access" ON "public"."newsletter_subscribers" FOR UPDATE USING (false);



CREATE POLICY "Public can view blocks of published posts" ON "public"."post_blocks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_blocks"."post_id") AND ("posts"."status" = 'published'::"text")))));



CREATE POLICY "Public can view published posts" ON "public"."posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Super admins can delete campaigns" ON "public"."newsletter_campaigns" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can update campaigns" ON "public"."newsletter_campaigns" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."status" = 'active'::"text") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Users can update profiles based on role" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR ("public"."get_my_role"() = 'super_admin'::"text")));



CREATE POLICY "Users can view profiles based on their role" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR ("public"."get_my_role"() = 'super_admin'::"text")));



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_send_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_revisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."check_user_active_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_active_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_active_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_post_revision"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_post_revision"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_post_revision"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_short_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_short_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_short_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_users_with_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users_with_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users_with_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_last_sign_in"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_last_sign_in"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_last_sign_in"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_status_by_email"("_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_status_by_email"("_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_status_by_email"("_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_contact_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_contact_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_contact_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contact_last_reply"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contact_last_reply"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contact_last_reply"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contacts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contacts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contacts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."contact_replies" TO "anon";
GRANT ALL ON TABLE "public"."contact_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_replies" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_send_log" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_send_log" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_send_log" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."post_blocks" TO "anon";
GRANT ALL ON TABLE "public"."post_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."post_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."post_revisions" TO "anon";
GRANT ALL ON TABLE "public"."post_revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_revisions" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


  create policy "Allow authenticated admins to upload 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));



  create policy "Allow authenticated admins to upload 1hys5dx_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));



  create policy "Allow authenticated admins to upload 1hys5dx_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));




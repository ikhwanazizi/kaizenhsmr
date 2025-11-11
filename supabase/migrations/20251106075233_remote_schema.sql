drop extension if exists "pg_net";

create type "public"."newsletter_status" as enum ('subscribed', 'unverified', 'unsubscribed');


  create table "public"."admin_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid,
    "action" text not null,
    "target_user_id" uuid,
    "details" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."admin_audit_log" enable row level security;


  create table "public"."contact_replies" (
    "id" uuid not null default gen_random_uuid(),
    "contact_id" uuid not null,
    "reply_message" text not null,
    "reply_method" text not null,
    "replied_by" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."contact_replies" enable row level security;


  create table "public"."contacts" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" text not null,
    "contact_number" text not null,
    "company" text not null,
    "business_email" text not null,
    "company_size" text not null,
    "message" text not null,
    "status" text default 'new'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_reply_at" timestamp with time zone,
    "is_starred" boolean default false,
    "updated_by" uuid
      );


alter table "public"."contacts" enable row level security;


  create table "public"."email_send_log" (
    "id" uuid not null default gen_random_uuid(),
    "email_type" text not null,
    "status" text not null,
    "sent_at" timestamp with time zone default now(),
    "error_message" text
      );


alter table "public"."email_send_log" enable row level security;


  create table "public"."newsletter_campaigns" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "subject" text not null,
    "preview_text" text,
    "sent_at" timestamp with time zone default now(),
    "sent_by" uuid not null,
    "total_recipients" integer not null default 0,
    "total_sent" integer default 0,
    "total_failed" integer default 0,
    "status" text default 'pending'::text,
    "error_details" jsonb,
    "created_at" timestamp with time zone default now(),
    "completed_at" timestamp with time zone,
    "sent_count" integer default 0,
    "queued_count" integer default 0,
    "scheduled_at" timestamp with time zone
      );


alter table "public"."newsletter_campaigns" enable row level security;


  create table "public"."newsletter_send_log" (
    "id" uuid not null default gen_random_uuid(),
    "campaign_id" uuid not null,
    "subscriber_id" uuid not null,
    "email" text not null,
    "status" text default 'pending'::text,
    "sent_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "error_message" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."newsletter_send_log" enable row level security;


  create table "public"."newsletter_subscribers" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "status" public.newsletter_status not null default 'unverified'::public.newsletter_status,
    "verification_token" uuid default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "verified_at" timestamp with time zone,
    "unsubscribe_token" uuid default gen_random_uuid()
      );


alter table "public"."newsletter_subscribers" enable row level security;


  create table "public"."post_blocks" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "type" text not null,
    "content" jsonb not null,
    "order_index" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."post_blocks" enable row level security;


  create table "public"."post_revisions" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "title" text not null,
    "excerpt" text,
    "featured_image" text,
    "featured_image_alt" text,
    "seo_meta_title" text,
    "seo_meta_description" text,
    "seo_og_image" text,
    "metadata" jsonb,
    "blocks" jsonb not null,
    "revision_number" integer not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "change_summary" text
      );


alter table "public"."post_revisions" enable row level security;


  create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "excerpt" text,
    "featured_image" text,
    "featured_image_alt" text,
    "category" text not null,
    "status" text default 'draft'::text,
    "seo_meta_title" text,
    "seo_meta_description" text,
    "seo_og_image" text,
    "metadata" jsonb,
    "author_id" uuid,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_autosaved_at" timestamp with time zone,
    "newsletter_sent_at" timestamp with time zone,
    "short_id" text default public.generate_short_id(),
    "has_unpublished_changes" boolean default false,
    "draft_title" text,
    "draft_excerpt" text,
    "draft_featured_image" text,
    "draft_featured_image_alt" text,
    "draft_seo_meta_title" text,
    "draft_seo_meta_description" text,
    "draft_seo_og_image" text,
    "draft_blocks" jsonb,
    "draft_slug" text,
    "updated_by" uuid
      );


alter table "public"."posts" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "full_name" text,
    "role" text default 'admin'::text,
    "status" text default 'active'::text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."system_settings" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null,
    "updated_by" uuid,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."system_settings" enable row level security;

CREATE UNIQUE INDEX admin_audit_log_pkey ON public.admin_audit_log USING btree (id);

CREATE UNIQUE INDEX contact_replies_pkey ON public.contact_replies USING btree (id);

CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id);

CREATE UNIQUE INDEX email_send_log_pkey ON public.email_send_log USING btree (id);

CREATE INDEX idx_contact_replies_contact_id ON public.contact_replies USING btree (contact_id);

CREATE INDEX idx_contact_replies_created_at ON public.contact_replies USING btree (created_at DESC);

CREATE INDEX idx_contacts_created_at ON public.contacts USING btree (created_at DESC);

CREATE INDEX idx_contacts_starred ON public.contacts USING btree (is_starred) WHERE (is_starred = true);

CREATE INDEX idx_contacts_status ON public.contacts USING btree (status);

CREATE INDEX idx_contacts_status_created ON public.contacts USING btree (status, created_at DESC);

CREATE INDEX idx_newsletter_campaigns_post_id ON public.newsletter_campaigns USING btree (post_id);

CREATE INDEX idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns USING btree (sent_at DESC);

CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns USING btree (status);

CREATE INDEX idx_newsletter_send_log_campaign_id ON public.newsletter_send_log USING btree (campaign_id);

CREATE INDEX idx_newsletter_send_log_status ON public.newsletter_send_log USING btree (status);

CREATE INDEX idx_newsletter_send_log_subscriber_id ON public.newsletter_send_log USING btree (subscriber_id);

CREATE INDEX idx_newsletter_subscribers_status_email ON public.newsletter_subscribers USING btree (status, email);

CREATE INDEX idx_newsletter_subscribers_unsubscribe_token ON public.newsletter_subscribers USING btree (unsubscribe_token);

CREATE INDEX idx_post_blocks_post_id ON public.post_blocks USING btree (post_id, order_index);

CREATE INDEX idx_post_blocks_post_id_order ON public.post_blocks USING btree (post_id, order_index);

CREATE INDEX idx_post_revisions_post_id ON public.post_revisions USING btree (post_id, revision_number DESC);

CREATE INDEX idx_posts_author_id ON public.posts USING btree (author_id);

CREATE INDEX idx_posts_category_status ON public.posts USING btree (category, status);

CREATE INDEX idx_posts_published_at ON public.posts USING btree (published_at DESC) WHERE (status = 'published'::text);

CREATE INDEX idx_posts_slug ON public.posts USING btree (slug);

CREATE INDEX idx_posts_slug_category_status ON public.posts USING btree (slug, category, status);

CREATE INDEX idx_profiles_id_status ON public.profiles USING btree (id, status);

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);

CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (key);

CREATE UNIQUE INDEX newsletter_campaigns_pkey ON public.newsletter_campaigns USING btree (id);

CREATE UNIQUE INDEX newsletter_send_log_pkey ON public.newsletter_send_log USING btree (id);

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);

CREATE UNIQUE INDEX newsletter_subscribers_pkey ON public.newsletter_subscribers USING btree (id);

CREATE UNIQUE INDEX newsletter_subscribers_unsubscribe_token_key ON public.newsletter_subscribers USING btree (unsubscribe_token);

CREATE UNIQUE INDEX post_blocks_order_unique ON public.post_blocks USING btree (post_id, order_index);

CREATE UNIQUE INDEX post_blocks_pkey ON public.post_blocks USING btree (id);

CREATE UNIQUE INDEX post_revisions_pkey ON public.post_revisions USING btree (id);

CREATE UNIQUE INDEX post_revisions_unique ON public.post_revisions USING btree (post_id, revision_number);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX posts_short_id_key ON public.posts USING btree (short_id);

CREATE UNIQUE INDEX posts_short_id_unique ON public.posts USING btree (short_id);

CREATE UNIQUE INDEX posts_slug_key ON public.posts USING btree (slug);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);

CREATE UNIQUE INDEX system_settings_pkey ON public.system_settings USING btree (id);

alter table "public"."admin_audit_log" add constraint "admin_audit_log_pkey" PRIMARY KEY using index "admin_audit_log_pkey";

alter table "public"."contact_replies" add constraint "contact_replies_pkey" PRIMARY KEY using index "contact_replies_pkey";

alter table "public"."contacts" add constraint "contacts_pkey" PRIMARY KEY using index "contacts_pkey";

alter table "public"."email_send_log" add constraint "email_send_log_pkey" PRIMARY KEY using index "email_send_log_pkey";

alter table "public"."newsletter_campaigns" add constraint "newsletter_campaigns_pkey" PRIMARY KEY using index "newsletter_campaigns_pkey";

alter table "public"."newsletter_send_log" add constraint "newsletter_send_log_pkey" PRIMARY KEY using index "newsletter_send_log_pkey";

alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_pkey" PRIMARY KEY using index "newsletter_subscribers_pkey";

alter table "public"."post_blocks" add constraint "post_blocks_pkey" PRIMARY KEY using index "post_blocks_pkey";

alter table "public"."post_revisions" add constraint "post_revisions_pkey" PRIMARY KEY using index "post_revisions_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."system_settings" add constraint "system_settings_pkey" PRIMARY KEY using index "system_settings_pkey";

alter table "public"."admin_audit_log" add constraint "admin_audit_log_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."admin_audit_log" validate constraint "admin_audit_log_admin_id_fkey";

alter table "public"."contact_replies" add constraint "contact_replies_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_contact_id_fkey";

alter table "public"."contact_replies" add constraint "contact_replies_replied_by_fkey" FOREIGN KEY (replied_by) REFERENCES public.profiles(id) not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_replied_by_fkey";

alter table "public"."contact_replies" add constraint "contact_replies_reply_method_check" CHECK ((reply_method = ANY (ARRAY['in_app'::text, 'email_client'::text]))) not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_reply_method_check";

alter table "public"."contacts" add constraint "contacts_company_size_check" CHECK ((company_size = ANY (ARRAY['1-50'::text, '51-200'::text, '201-500'::text, '501-1000'::text, '1000-1500'::text, '1501-2000'::text, '2001-3000'::text, '3000+'::text]))) not valid;

alter table "public"."contacts" validate constraint "contacts_company_size_check";

alter table "public"."contacts" add constraint "contacts_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'replied'::text, 'closed'::text]))) not valid;

alter table "public"."contacts" validate constraint "contacts_status_check";

alter table "public"."contacts" add constraint "contacts_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."contacts" validate constraint "contacts_updated_by_fkey";

alter table "public"."email_send_log" add constraint "email_send_log_email_type_check" CHECK ((email_type = ANY (ARRAY['contact_reply'::text, 'subscriber_verification'::text]))) not valid;

alter table "public"."email_send_log" validate constraint "email_send_log_email_type_check";

alter table "public"."email_send_log" add constraint "email_send_log_status_check" CHECK ((status = ANY (ARRAY['sent'::text, 'failed'::text]))) not valid;

alter table "public"."email_send_log" validate constraint "email_send_log_status_check";

alter table "public"."newsletter_campaigns" add constraint "newsletter_campaigns_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."newsletter_campaigns" validate constraint "newsletter_campaigns_post_id_fkey";

alter table "public"."newsletter_campaigns" add constraint "newsletter_campaigns_sent_by_fkey" FOREIGN KEY (sent_by) REFERENCES public.profiles(id) not valid;

alter table "public"."newsletter_campaigns" validate constraint "newsletter_campaigns_sent_by_fkey";

alter table "public"."newsletter_campaigns" add constraint "newsletter_campaigns_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))) not valid;

alter table "public"."newsletter_campaigns" validate constraint "newsletter_campaigns_status_check";

alter table "public"."newsletter_send_log" add constraint "newsletter_send_log_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."newsletter_send_log" validate constraint "newsletter_send_log_campaign_id_fkey";

alter table "public"."newsletter_send_log" add constraint "newsletter_send_log_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'bounced'::text]))) not valid;

alter table "public"."newsletter_send_log" validate constraint "newsletter_send_log_status_check";

alter table "public"."newsletter_send_log" add constraint "newsletter_send_log_subscriber_id_fkey" FOREIGN KEY (subscriber_id) REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE not valid;

alter table "public"."newsletter_send_log" validate constraint "newsletter_send_log_subscriber_id_fkey";

alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_email_key" UNIQUE using index "newsletter_subscribers_email_key";

alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_unsubscribe_token_key" UNIQUE using index "newsletter_subscribers_unsubscribe_token_key";

alter table "public"."post_blocks" add constraint "post_blocks_order_unique" UNIQUE using index "post_blocks_order_unique";

alter table "public"."post_blocks" add constraint "post_blocks_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_blocks" validate constraint "post_blocks_post_id_fkey";

alter table "public"."post_blocks" add constraint "post_blocks_type_check" CHECK ((type = ANY (ARRAY['heading'::text, 'paragraph'::text, 'image'::text, 'video'::text, 'code'::text, 'quote'::text, 'divider'::text, 'list'::text, 'table'::text]))) not valid;

alter table "public"."post_blocks" validate constraint "post_blocks_type_check";

alter table "public"."post_revisions" add constraint "post_revisions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) not valid;

alter table "public"."post_revisions" validate constraint "post_revisions_created_by_fkey";

alter table "public"."post_revisions" add constraint "post_revisions_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_revisions" validate constraint "post_revisions_post_id_fkey";

alter table "public"."post_revisions" add constraint "post_revisions_unique" UNIQUE using index "post_revisions_unique";

alter table "public"."posts" add constraint "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."posts" validate constraint "posts_author_id_fkey";

alter table "public"."posts" add constraint "posts_category_check" CHECK ((category = ANY (ARRAY['blog'::text, 'development'::text]))) not valid;

alter table "public"."posts" validate constraint "posts_category_check";

alter table "public"."posts" add constraint "posts_short_id_key" UNIQUE using index "posts_short_id_key";

alter table "public"."posts" add constraint "posts_slug_key" UNIQUE using index "posts_slug_key";

alter table "public"."posts" add constraint "posts_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text]))) not valid;

alter table "public"."posts" validate constraint "posts_status_check";

alter table "public"."posts" add constraint "posts_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."posts" validate constraint "posts_updated_by_fkey";

alter table "public"."posts" add constraint "short_id_length" CHECK ((char_length(short_id) = 8)) not valid;

alter table "public"."posts" validate constraint "short_id_length";

alter table "public"."profiles" add constraint "profiles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) not valid;

alter table "public"."profiles" validate constraint "profiles_created_by_fkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'super_admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_status_check";

alter table "public"."system_settings" add constraint "system_settings_key_key" UNIQUE using index "system_settings_key_key";

alter table "public"."system_settings" add constraint "system_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."system_settings" validate constraint "system_settings_updated_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_active_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- When a user's status changes to inactive or suspended, ban them in auth
  IF NEW.status IN ('inactive', 'suspended') AND OLD.status = 'active' THEN
    -- Note: This requires a separate service to call the auth admin API
    -- The trigger itself cannot directly call auth.admin functions
    RAISE NOTICE 'User % status changed to %. Should be banned in auth.', NEW.id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_post_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.generate_short_id()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_users_with_profiles()
 RETURNS TABLE(id uuid, email text, last_sign_in_at timestamp with time zone, full_name text, role text, status text, created_by_id uuid, created_by_name text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_campaign_stats(campaign_uuid uuid)
 RETURNS TABLE(total_sent bigint, total_failed bigint, total_opened bigint, total_clicked bigint)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    SELECT 
        COUNT(*) FILTER (WHERE status = 'sent') as total_sent,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked
    FROM public.newsletter_send_log
    WHERE campaign_id = campaign_uuid;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_remaining_daily_email_quota()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    daily_quota INT;
    newsletter_sends INT;
    other_sends INT;
    total_sent INT;
    remaining_quota INT;
BEGIN
    -- 1. Get the daily quota from settings
    SELECT (value::jsonb->>0)::INT INTO daily_quota
    FROM public.system_settings
    WHERE key = 'newsletter_daily_limit'
    LIMIT 1;

    -- Default to 100 if not set
    IF daily_quota IS NULL THEN
        daily_quota := 100;
    END IF;

    -- 2. Count 'sent' newsletter emails from today
    SELECT COUNT(*) INTO newsletter_sends
    FROM public.newsletter_send_log
    WHERE status = 'sent'
    AND sent_at >= timezone('UTC', date_trunc('day', NOW()));

    -- 3. Count 'sent' other emails from today
    SELECT COUNT(*) INTO other_sends
    FROM public.email_send_log
    WHERE status = 'sent'
    AND sent_at >= timezone('UTC', date_trunc('day', NOW()));

    -- 4. Calculate remaining quota
    total_sent := newsletter_sends + other_sends;
    remaining_quota := daily_quota - total_sent;

    IF remaining_quota < 0 THEN
        remaining_quota := 0;
    END IF;

    RETURN remaining_quota;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_last_sign_in(user_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT last_sign_in_at 
  FROM auth.users 
  WHERE id = user_id;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_status_by_email(_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT status
    FROM public.profiles
    WHERE email = _email
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_contact_last_reply()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.contacts
  SET 
    last_reply_at = NEW.created_at,
    status = 'replied',
    updated_at = NOW()
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_audit_log" to "anon";

grant insert on table "public"."admin_audit_log" to "anon";

grant references on table "public"."admin_audit_log" to "anon";

grant select on table "public"."admin_audit_log" to "anon";

grant trigger on table "public"."admin_audit_log" to "anon";

grant truncate on table "public"."admin_audit_log" to "anon";

grant update on table "public"."admin_audit_log" to "anon";

grant delete on table "public"."admin_audit_log" to "authenticated";

grant insert on table "public"."admin_audit_log" to "authenticated";

grant references on table "public"."admin_audit_log" to "authenticated";

grant select on table "public"."admin_audit_log" to "authenticated";

grant trigger on table "public"."admin_audit_log" to "authenticated";

grant truncate on table "public"."admin_audit_log" to "authenticated";

grant update on table "public"."admin_audit_log" to "authenticated";

grant delete on table "public"."admin_audit_log" to "service_role";

grant insert on table "public"."admin_audit_log" to "service_role";

grant references on table "public"."admin_audit_log" to "service_role";

grant select on table "public"."admin_audit_log" to "service_role";

grant trigger on table "public"."admin_audit_log" to "service_role";

grant truncate on table "public"."admin_audit_log" to "service_role";

grant update on table "public"."admin_audit_log" to "service_role";

grant delete on table "public"."contact_replies" to "anon";

grant insert on table "public"."contact_replies" to "anon";

grant references on table "public"."contact_replies" to "anon";

grant select on table "public"."contact_replies" to "anon";

grant trigger on table "public"."contact_replies" to "anon";

grant truncate on table "public"."contact_replies" to "anon";

grant update on table "public"."contact_replies" to "anon";

grant delete on table "public"."contact_replies" to "authenticated";

grant insert on table "public"."contact_replies" to "authenticated";

grant references on table "public"."contact_replies" to "authenticated";

grant select on table "public"."contact_replies" to "authenticated";

grant trigger on table "public"."contact_replies" to "authenticated";

grant truncate on table "public"."contact_replies" to "authenticated";

grant update on table "public"."contact_replies" to "authenticated";

grant delete on table "public"."contact_replies" to "service_role";

grant insert on table "public"."contact_replies" to "service_role";

grant references on table "public"."contact_replies" to "service_role";

grant select on table "public"."contact_replies" to "service_role";

grant trigger on table "public"."contact_replies" to "service_role";

grant truncate on table "public"."contact_replies" to "service_role";

grant update on table "public"."contact_replies" to "service_role";

grant delete on table "public"."contacts" to "anon";

grant insert on table "public"."contacts" to "anon";

grant references on table "public"."contacts" to "anon";

grant select on table "public"."contacts" to "anon";

grant trigger on table "public"."contacts" to "anon";

grant truncate on table "public"."contacts" to "anon";

grant update on table "public"."contacts" to "anon";

grant delete on table "public"."contacts" to "authenticated";

grant insert on table "public"."contacts" to "authenticated";

grant references on table "public"."contacts" to "authenticated";

grant select on table "public"."contacts" to "authenticated";

grant trigger on table "public"."contacts" to "authenticated";

grant truncate on table "public"."contacts" to "authenticated";

grant update on table "public"."contacts" to "authenticated";

grant delete on table "public"."contacts" to "service_role";

grant insert on table "public"."contacts" to "service_role";

grant references on table "public"."contacts" to "service_role";

grant select on table "public"."contacts" to "service_role";

grant trigger on table "public"."contacts" to "service_role";

grant truncate on table "public"."contacts" to "service_role";

grant update on table "public"."contacts" to "service_role";

grant delete on table "public"."email_send_log" to "anon";

grant insert on table "public"."email_send_log" to "anon";

grant references on table "public"."email_send_log" to "anon";

grant select on table "public"."email_send_log" to "anon";

grant trigger on table "public"."email_send_log" to "anon";

grant truncate on table "public"."email_send_log" to "anon";

grant update on table "public"."email_send_log" to "anon";

grant delete on table "public"."email_send_log" to "authenticated";

grant insert on table "public"."email_send_log" to "authenticated";

grant references on table "public"."email_send_log" to "authenticated";

grant select on table "public"."email_send_log" to "authenticated";

grant trigger on table "public"."email_send_log" to "authenticated";

grant truncate on table "public"."email_send_log" to "authenticated";

grant update on table "public"."email_send_log" to "authenticated";

grant delete on table "public"."email_send_log" to "service_role";

grant insert on table "public"."email_send_log" to "service_role";

grant references on table "public"."email_send_log" to "service_role";

grant select on table "public"."email_send_log" to "service_role";

grant trigger on table "public"."email_send_log" to "service_role";

grant truncate on table "public"."email_send_log" to "service_role";

grant update on table "public"."email_send_log" to "service_role";

grant delete on table "public"."newsletter_campaigns" to "anon";

grant insert on table "public"."newsletter_campaigns" to "anon";

grant references on table "public"."newsletter_campaigns" to "anon";

grant select on table "public"."newsletter_campaigns" to "anon";

grant trigger on table "public"."newsletter_campaigns" to "anon";

grant truncate on table "public"."newsletter_campaigns" to "anon";

grant update on table "public"."newsletter_campaigns" to "anon";

grant delete on table "public"."newsletter_campaigns" to "authenticated";

grant insert on table "public"."newsletter_campaigns" to "authenticated";

grant references on table "public"."newsletter_campaigns" to "authenticated";

grant select on table "public"."newsletter_campaigns" to "authenticated";

grant trigger on table "public"."newsletter_campaigns" to "authenticated";

grant truncate on table "public"."newsletter_campaigns" to "authenticated";

grant update on table "public"."newsletter_campaigns" to "authenticated";

grant delete on table "public"."newsletter_campaigns" to "service_role";

grant insert on table "public"."newsletter_campaigns" to "service_role";

grant references on table "public"."newsletter_campaigns" to "service_role";

grant select on table "public"."newsletter_campaigns" to "service_role";

grant trigger on table "public"."newsletter_campaigns" to "service_role";

grant truncate on table "public"."newsletter_campaigns" to "service_role";

grant update on table "public"."newsletter_campaigns" to "service_role";

grant delete on table "public"."newsletter_send_log" to "anon";

grant insert on table "public"."newsletter_send_log" to "anon";

grant references on table "public"."newsletter_send_log" to "anon";

grant select on table "public"."newsletter_send_log" to "anon";

grant trigger on table "public"."newsletter_send_log" to "anon";

grant truncate on table "public"."newsletter_send_log" to "anon";

grant update on table "public"."newsletter_send_log" to "anon";

grant delete on table "public"."newsletter_send_log" to "authenticated";

grant insert on table "public"."newsletter_send_log" to "authenticated";

grant references on table "public"."newsletter_send_log" to "authenticated";

grant select on table "public"."newsletter_send_log" to "authenticated";

grant trigger on table "public"."newsletter_send_log" to "authenticated";

grant truncate on table "public"."newsletter_send_log" to "authenticated";

grant update on table "public"."newsletter_send_log" to "authenticated";

grant delete on table "public"."newsletter_send_log" to "service_role";

grant insert on table "public"."newsletter_send_log" to "service_role";

grant references on table "public"."newsletter_send_log" to "service_role";

grant select on table "public"."newsletter_send_log" to "service_role";

grant trigger on table "public"."newsletter_send_log" to "service_role";

grant truncate on table "public"."newsletter_send_log" to "service_role";

grant update on table "public"."newsletter_send_log" to "service_role";

grant delete on table "public"."newsletter_subscribers" to "anon";

grant insert on table "public"."newsletter_subscribers" to "anon";

grant references on table "public"."newsletter_subscribers" to "anon";

grant select on table "public"."newsletter_subscribers" to "anon";

grant trigger on table "public"."newsletter_subscribers" to "anon";

grant truncate on table "public"."newsletter_subscribers" to "anon";

grant update on table "public"."newsletter_subscribers" to "anon";

grant delete on table "public"."newsletter_subscribers" to "authenticated";

grant insert on table "public"."newsletter_subscribers" to "authenticated";

grant references on table "public"."newsletter_subscribers" to "authenticated";

grant select on table "public"."newsletter_subscribers" to "authenticated";

grant trigger on table "public"."newsletter_subscribers" to "authenticated";

grant truncate on table "public"."newsletter_subscribers" to "authenticated";

grant update on table "public"."newsletter_subscribers" to "authenticated";

grant delete on table "public"."newsletter_subscribers" to "service_role";

grant insert on table "public"."newsletter_subscribers" to "service_role";

grant references on table "public"."newsletter_subscribers" to "service_role";

grant select on table "public"."newsletter_subscribers" to "service_role";

grant trigger on table "public"."newsletter_subscribers" to "service_role";

grant truncate on table "public"."newsletter_subscribers" to "service_role";

grant update on table "public"."newsletter_subscribers" to "service_role";

grant delete on table "public"."post_blocks" to "anon";

grant insert on table "public"."post_blocks" to "anon";

grant references on table "public"."post_blocks" to "anon";

grant select on table "public"."post_blocks" to "anon";

grant trigger on table "public"."post_blocks" to "anon";

grant truncate on table "public"."post_blocks" to "anon";

grant update on table "public"."post_blocks" to "anon";

grant delete on table "public"."post_blocks" to "authenticated";

grant insert on table "public"."post_blocks" to "authenticated";

grant references on table "public"."post_blocks" to "authenticated";

grant select on table "public"."post_blocks" to "authenticated";

grant trigger on table "public"."post_blocks" to "authenticated";

grant truncate on table "public"."post_blocks" to "authenticated";

grant update on table "public"."post_blocks" to "authenticated";

grant delete on table "public"."post_blocks" to "service_role";

grant insert on table "public"."post_blocks" to "service_role";

grant references on table "public"."post_blocks" to "service_role";

grant select on table "public"."post_blocks" to "service_role";

grant trigger on table "public"."post_blocks" to "service_role";

grant truncate on table "public"."post_blocks" to "service_role";

grant update on table "public"."post_blocks" to "service_role";

grant delete on table "public"."post_revisions" to "anon";

grant insert on table "public"."post_revisions" to "anon";

grant references on table "public"."post_revisions" to "anon";

grant select on table "public"."post_revisions" to "anon";

grant trigger on table "public"."post_revisions" to "anon";

grant truncate on table "public"."post_revisions" to "anon";

grant update on table "public"."post_revisions" to "anon";

grant delete on table "public"."post_revisions" to "authenticated";

grant insert on table "public"."post_revisions" to "authenticated";

grant references on table "public"."post_revisions" to "authenticated";

grant select on table "public"."post_revisions" to "authenticated";

grant trigger on table "public"."post_revisions" to "authenticated";

grant truncate on table "public"."post_revisions" to "authenticated";

grant update on table "public"."post_revisions" to "authenticated";

grant delete on table "public"."post_revisions" to "service_role";

grant insert on table "public"."post_revisions" to "service_role";

grant references on table "public"."post_revisions" to "service_role";

grant select on table "public"."post_revisions" to "service_role";

grant trigger on table "public"."post_revisions" to "service_role";

grant truncate on table "public"."post_revisions" to "service_role";

grant update on table "public"."post_revisions" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."system_settings" to "anon";

grant insert on table "public"."system_settings" to "anon";

grant references on table "public"."system_settings" to "anon";

grant select on table "public"."system_settings" to "anon";

grant trigger on table "public"."system_settings" to "anon";

grant truncate on table "public"."system_settings" to "anon";

grant update on table "public"."system_settings" to "anon";

grant delete on table "public"."system_settings" to "authenticated";

grant insert on table "public"."system_settings" to "authenticated";

grant references on table "public"."system_settings" to "authenticated";

grant select on table "public"."system_settings" to "authenticated";

grant trigger on table "public"."system_settings" to "authenticated";

grant truncate on table "public"."system_settings" to "authenticated";

grant update on table "public"."system_settings" to "authenticated";

grant delete on table "public"."system_settings" to "service_role";

grant insert on table "public"."system_settings" to "service_role";

grant references on table "public"."system_settings" to "service_role";

grant select on table "public"."system_settings" to "service_role";

grant trigger on table "public"."system_settings" to "service_role";

grant truncate on table "public"."system_settings" to "service_role";

grant update on table "public"."system_settings" to "service_role";


  create policy "Admins can insert audit logs"
  on "public"."admin_audit_log"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND (profiles.status = 'active'::text)))));



  create policy "Super admins can read audit logs"
  on "public"."admin_audit_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text) AND (profiles.status = 'active'::text)))));



  create policy "Allow authenticated admins to view replies"
  on "public"."contact_replies"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Allow only super_admin to create replies"
  on "public"."contact_replies"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));



  create policy "Allow only super_admin to delete replies"
  on "public"."contact_replies"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));



  create policy "Allow super_admin to update own replies"
  on "public"."contact_replies"
  as permissive
  for update
  to authenticated
using (((replied_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text))))))
with check (((replied_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text))))));



  create policy "Allow authenticated admins to update contacts"
  on "public"."contacts"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Allow authenticated admins to view contacts"
  on "public"."contacts"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Allow only super_admin to delete contacts"
  on "public"."contacts"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));



  create policy "Allow public insert on contacts"
  on "public"."contacts"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Admins can insert email logs"
  on "public"."email_send_log"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND (profiles.status = 'active'::text)))));



  create policy "Super admins can read email logs"
  on "public"."email_send_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text) AND (profiles.status = 'active'::text)))));



  create policy "Admins can create campaigns"
  on "public"."newsletter_campaigns"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Admins can view campaigns"
  on "public"."newsletter_campaigns"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Super admins can delete campaigns"
  on "public"."newsletter_campaigns"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));



  create policy "Super admins can update campaigns"
  on "public"."newsletter_campaigns"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));



  create policy "Admins can view send logs"
  on "public"."newsletter_send_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Allow public insert access"
  on "public"."newsletter_subscribers"
  as permissive
  for insert
  to public
with check (true);



  create policy "Block public delete access"
  on "public"."newsletter_subscribers"
  as permissive
  for delete
  to public
using (false);



  create policy "Block public read access"
  on "public"."newsletter_subscribers"
  as permissive
  for select
  to public
using (false);



  create policy "Block public update and delete access"
  on "public"."newsletter_subscribers"
  as permissive
  for update
  to public
using (false);



  create policy "Admins can manage all post blocks"
  on "public"."post_blocks"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Public can view blocks of published posts"
  on "public"."post_blocks"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.posts
  WHERE ((posts.id = post_blocks.post_id) AND (posts.status = 'published'::text)))));



  create policy "Admins can view post revisions"
  on "public"."post_revisions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Admins can manage all posts"
  on "public"."posts"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "Public can view published posts"
  on "public"."posts"
  as permissive
  for select
  to public
using ((status = 'published'::text));



  create policy "Users can update profiles based on role"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR (public.get_my_role() = 'super_admin'::text)));



  create policy "Users can view profiles based on their role"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR (public.get_my_role() = 'super_admin'::text)));



  create policy "Admins can view settings"
  on "public"."system_settings"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND (profiles.status = 'active'::text)))));



  create policy "Super admins can manage settings"
  on "public"."system_settings"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text) AND (profiles.status = 'active'::text)))));


CREATE TRIGGER contact_reply_update_trigger AFTER INSERT ON public.contact_replies FOR EACH ROW EXECUTE FUNCTION public.update_contact_last_reply();

CREATE TRIGGER contacts_updated_at_trigger BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_contacts_updated_at();

CREATE TRIGGER update_post_blocks_updated_at BEFORE UPDATE ON public.post_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_post_publish AFTER UPDATE OF status ON public.posts FOR EACH ROW EXECUTE FUNCTION public.create_post_revision();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_profile_status_change AFTER UPDATE OF status ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.check_user_active_status();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow authenticated admins to upload 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));



  create policy "Allow authenticated admins to upload 1hys5dx_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));



  create policy "Allow authenticated admins to upload 1hys5dx_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'post-images'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text))))));




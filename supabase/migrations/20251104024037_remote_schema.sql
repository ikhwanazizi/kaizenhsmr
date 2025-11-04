drop extension if exists "pg_net";

alter table "public"."post_blocks" drop constraint "post_blocks_type_check";

alter table "public"."posts" add column "draft_blocks" jsonb;

alter table "public"."posts" add column "draft_excerpt" text;

alter table "public"."posts" add column "draft_featured_image" text;

alter table "public"."posts" add column "draft_featured_image_alt" text;

alter table "public"."posts" add column "draft_seo_meta_description" text;

alter table "public"."posts" add column "draft_seo_meta_title" text;

alter table "public"."posts" add column "draft_seo_og_image" text;

alter table "public"."posts" add column "draft_slug" text;

alter table "public"."posts" add column "draft_title" text;

alter table "public"."posts" add column "has_unpublished_changes" boolean default false;

alter table "public"."post_blocks" add constraint "post_blocks_type_check" CHECK ((type = ANY (ARRAY['heading'::text, 'paragraph'::text, 'image'::text, 'video'::text, 'code'::text, 'quote'::text, 'divider'::text, 'list'::text, 'table'::text]))) not valid;

alter table "public"."post_blocks" validate constraint "post_blocks_type_check";

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

CREATE OR REPLACE FUNCTION public.log_contact_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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



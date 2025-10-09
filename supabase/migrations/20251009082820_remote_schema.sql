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

create table "public"."blog_posts" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "content" text not null,
    "excerpt" text,
    "featured_image" text,
    "status" text default 'draft'::text,
    "author_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "published_at" timestamp with time zone
);


alter table "public"."blog_posts" enable row level security;

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
    "reply_note" text,
    "replied_at" timestamp with time zone,
    "replied_by" uuid,
    "last_reply_at" timestamp with time zone,
    "is_starred" boolean default false
);


alter table "public"."contacts" enable row level security;

create table "public"."newsletter_subscribers" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "status" newsletter_status not null default 'unverified'::newsletter_status,
    "verification_token" uuid default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "verified_at" timestamp with time zone
);


alter table "public"."newsletter_subscribers" enable row level security;

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

CREATE UNIQUE INDEX admin_audit_log_pkey ON public.admin_audit_log USING btree (id);

CREATE UNIQUE INDEX blog_posts_pkey ON public.blog_posts USING btree (id);

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);

CREATE UNIQUE INDEX contact_replies_pkey ON public.contact_replies USING btree (id);

CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id);

CREATE INDEX idx_contact_replies_contact_id ON public.contact_replies USING btree (contact_id);

CREATE INDEX idx_contact_replies_created_at ON public.contact_replies USING btree (created_at DESC);

CREATE INDEX idx_contacts_created_at ON public.contacts USING btree (created_at DESC);

CREATE INDEX idx_contacts_starred ON public.contacts USING btree (is_starred) WHERE (is_starred = true);

CREATE INDEX idx_contacts_status ON public.contacts USING btree (status);

CREATE INDEX idx_profiles_id_status ON public.profiles USING btree (id, status);

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);

CREATE UNIQUE INDEX newsletter_subscribers_pkey ON public.newsletter_subscribers USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."admin_audit_log" add constraint "admin_audit_log_pkey" PRIMARY KEY using index "admin_audit_log_pkey";

alter table "public"."blog_posts" add constraint "blog_posts_pkey" PRIMARY KEY using index "blog_posts_pkey";

alter table "public"."contact_replies" add constraint "contact_replies_pkey" PRIMARY KEY using index "contact_replies_pkey";

alter table "public"."contacts" add constraint "contacts_pkey" PRIMARY KEY using index "contacts_pkey";

alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_pkey" PRIMARY KEY using index "newsletter_subscribers_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."admin_audit_log" add constraint "admin_audit_log_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."admin_audit_log" validate constraint "admin_audit_log_admin_id_fkey";

alter table "public"."blog_posts" add constraint "blog_posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."blog_posts" validate constraint "blog_posts_author_id_fkey";

alter table "public"."blog_posts" add constraint "blog_posts_slug_key" UNIQUE using index "blog_posts_slug_key";

alter table "public"."blog_posts" add constraint "blog_posts_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text]))) not valid;

alter table "public"."blog_posts" validate constraint "blog_posts_status_check";

alter table "public"."contact_replies" add constraint "contact_replies_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_contact_id_fkey";

alter table "public"."contact_replies" add constraint "contact_replies_replied_by_fkey" FOREIGN KEY (replied_by) REFERENCES profiles(id) not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_replied_by_fkey";

alter table "public"."contact_replies" add constraint "contact_replies_reply_method_check" CHECK ((reply_method = ANY (ARRAY['in_app'::text, 'email_client'::text]))) not valid;

alter table "public"."contact_replies" validate constraint "contact_replies_reply_method_check";

alter table "public"."contacts" add constraint "contacts_company_size_check" CHECK ((company_size = ANY (ARRAY['1-50'::text, '51-200'::text, '201-500'::text, '501-1000'::text, '1000-1500'::text, '1501-2000'::text, '2001-3000'::text, '3000+'::text]))) not valid;

alter table "public"."contacts" validate constraint "contacts_company_size_check";

alter table "public"."contacts" add constraint "contacts_replied_by_fkey" FOREIGN KEY (replied_by) REFERENCES profiles(id) not valid;

alter table "public"."contacts" validate constraint "contacts_replied_by_fkey";

alter table "public"."contacts" add constraint "contacts_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'replied'::text, 'closed'::text]))) not valid;

alter table "public"."contacts" validate constraint "contacts_status_check";

alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_email_key" UNIQUE using index "newsletter_subscribers_email_key";

alter table "public"."profiles" add constraint "profiles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."profiles" validate constraint "profiles_created_by_fkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'super_admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_status_check";

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

create policy "Allow authenticated admins to view replies"
on "public"."contact_replies"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


create policy "Allow only super_admin to create replies"
on "public"."contact_replies"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));


create policy "Allow only super_admin to delete replies"
on "public"."contact_replies"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));


create policy "Allow super_admin to update own replies"
on "public"."contact_replies"
as permissive
for update
to authenticated
using (((replied_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text))))))
with check (((replied_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text))))));


create policy "Allow authenticated admins to update contacts"
on "public"."contacts"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


create policy "Allow authenticated admins to view contacts"
on "public"."contacts"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


create policy "Allow only super_admin to delete contacts"
on "public"."contacts"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.status = 'active'::text) AND (profiles.role = 'super_admin'::text)))));


create policy "Allow public insert on contacts"
on "public"."contacts"
as permissive
for insert
to anon
with check (true);


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


create policy "Users can update profiles based on role"
on "public"."profiles"
as permissive
for update
to public
using (((auth.uid() = id) OR (get_my_role() = 'super_admin'::text)));


create policy "Users can view profiles based on their role"
on "public"."profiles"
as permissive
for select
to public
using (((auth.uid() = id) OR (get_my_role() = 'super_admin'::text)));


CREATE TRIGGER contact_reply_update_trigger AFTER INSERT ON public.contact_replies FOR EACH ROW EXECUTE FUNCTION update_contact_last_reply();

CREATE TRIGGER contacts_updated_at_trigger BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_contacts_updated_at();

CREATE TRIGGER on_profile_status_change AFTER UPDATE OF status ON public.profiles FOR EACH ROW EXECUTE FUNCTION check_user_active_status();


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();



-- Helper function to check if prayer is public
CREATE OR REPLACE FUNCTION public.is_prayer_public(body TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF body IS NULL THEN
    RETURN FALSE;
  END IF;
  -- If it looks like JSON, try to parse it
  IF body LIKE '{%}' THEN
    BEGIN
      RETURN (body::jsonb ->> 'privacy') = 'public';
    EXCEPTION WHEN others THEN
      -- If parsing fails, fall back to string check
      RETURN body LIKE '%"privacy":"public"%' OR body LIKE '%"privacy": "public"%';
    END;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- RLS Updates for prayers
DROP POLICY IF EXISTS "Prayers self all" ON public.prayers;
CREATE POLICY "Prayers insert own" ON public.prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Prayers update own" ON public.prayers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Prayers delete own" ON public.prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Prayers select authenticated" ON public.prayers FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR public.is_prayer_public(body)
);

-- RLS Updates for activity_log
DROP POLICY IF EXISTS "Activity self all" ON public.activity_log;
CREATE POLICY "Activity select authenticated" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activity insert own" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Activity update own" ON public.activity_log FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Activity delete own" ON public.activity_log FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Profiles policy: Allow all authenticated users to read other users' profiles to show names
DROP POLICY IF EXISTS "Profiles self read" ON public.profiles;
CREATE POLICY "Profiles read all" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Walk progress policy: Allow all authenticated users to read other users' progress (needed for friends' streaks)
DROP POLICY IF EXISTS "Walk self all" ON public.walk_progress;
CREATE POLICY "Walk self all" ON public.walk_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Walk select authenticated" ON public.walk_progress FOR SELECT TO authenticated USING (true);

-- 1. Study Groups Table
CREATE TABLE IF NOT EXISTS public.comunhao_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  book TEXT NOT NULL,
  weekly_goal TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comunhao_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_groups_select" ON public.comunhao_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_groups_insert" ON public.comunhao_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_groups TO authenticated;
GRANT ALL ON public.comunhao_groups TO service_role;

-- 2. Group Members Table
CREATE TABLE IF NOT EXISTS public.comunhao_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.comunhao_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.comunhao_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_group_members_select" ON public.comunhao_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_group_members_insert" ON public.comunhao_group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comunhao_group_members_update" ON public.comunhao_group_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comunhao_group_members_delete" ON public.comunhao_group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_group_members TO authenticated;
GRANT ALL ON public.comunhao_group_members TO service_role;

-- 3. Group Messages Table
CREATE TABLE IF NOT EXISTS public.comunhao_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.comunhao_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comunhao_group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_group_messages_select" ON public.comunhao_group_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_group_messages_insert" ON public.comunhao_group_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_group_messages TO authenticated;
GRANT ALL ON public.comunhao_group_messages TO service_role;

-- 4. Group Notes Table
CREATE TABLE IF NOT EXISTS public.comunhao_group_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.comunhao_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comunhao_group_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_group_notes_select" ON public.comunhao_group_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_group_notes_insert" ON public.comunhao_group_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_group_notes TO authenticated;
GRANT ALL ON public.comunhao_group_notes TO service_role;

-- 5. Friends Table
CREATE TABLE IF NOT EXISTS public.comunhao_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);
ALTER TABLE public.comunhao_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_friends_select" ON public.comunhao_friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "comunhao_friends_insert" ON public.comunhao_friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comunhao_friends_delete" ON public.comunhao_friends FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_friends TO authenticated;
GRANT ALL ON public.comunhao_friends TO service_role;

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS public.comunhao_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activity_log(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comunhao_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_comments_select" ON public.comunhao_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_comments_insert" ON public.comunhao_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_comments TO authenticated;
GRANT ALL ON public.comunhao_comments TO service_role;

-- 7. Post Prayers Table
CREATE TABLE IF NOT EXISTS public.comunhao_post_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activity_log(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(activity_id, user_id)
);
ALTER TABLE public.comunhao_post_prayers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_post_prayers_select" ON public.comunhao_post_prayers FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_post_prayers_insert" ON public.comunhao_post_prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comunhao_post_prayers_delete" ON public.comunhao_post_prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_post_prayers TO authenticated;
GRANT ALL ON public.comunhao_post_prayers TO service_role;

-- 8. Prayer Supports Table
CREATE TABLE IF NOT EXISTS public.comunhao_prayer_supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id UUID NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(prayer_id, user_id)
);
ALTER TABLE public.comunhao_prayer_supports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comunhao_prayer_supports_select" ON public.comunhao_prayer_supports FOR SELECT TO authenticated USING (true);
CREATE POLICY "comunhao_prayer_supports_insert" ON public.comunhao_prayer_supports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comunhao_prayer_supports_delete" ON public.comunhao_prayer_supports FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunhao_prayer_supports TO authenticated;
GRANT ALL ON public.comunhao_prayer_supports TO service_role;

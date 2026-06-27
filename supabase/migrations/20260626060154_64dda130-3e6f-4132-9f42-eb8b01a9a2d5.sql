
-- ============ Roles ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ Profiles ============
CREATE SEQUENCE public.anon_number_seq START 1001;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_number INTEGER NOT NULL UNIQUE DEFAULT nextval('public.anon_number_seq'),
  is_guest BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable to authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, is_guest)
  VALUES (
    NEW.id,
    COALESCE(NEW.is_anonymous, false)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Groups ============
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE,
  icon_url TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id AND role = 'admin')
$$;

-- groups policies
CREATE POLICY "public groups visible to all auth, private to members" ON public.groups
  FOR SELECT TO authenticated USING (
    NOT is_private OR public.is_group_member(id, auth.uid()) OR creator_id = auth.uid()
  );
CREATE POLICY "auth can create groups" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "admins update groups" ON public.groups
  FOR UPDATE TO authenticated USING (public.is_group_admin(id, auth.uid()))
  WITH CHECK (public.is_group_admin(id, auth.uid()));
CREATE POLICY "admins delete groups" ON public.groups
  FOR DELETE TO authenticated USING (public.is_group_admin(id, auth.uid()));

-- group_members policies
CREATE POLICY "members visible to group members" ON public.group_members
  FOR SELECT TO authenticated USING (
    public.is_group_member(group_id, auth.uid()) OR user_id = auth.uid()
  );
CREATE POLICY "users join groups themselves" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users leave groups themselves; admins remove" ON public.group_members
  FOR DELETE TO authenticated USING (
    user_id = auth.uid() OR public.is_group_admin(group_id, auth.uid())
  );

-- ============ Confessions ============
CREATE TABLE public.confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Random',
  mood TEXT,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.confessions TO authenticated;
GRANT ALL ON public.confessions TO service_role;
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX confessions_created_idx ON public.confessions (created_at DESC);
CREATE INDEX confessions_group_idx ON public.confessions (group_id, created_at DESC);

CREATE POLICY "global confessions visible to auth; group confessions to members" ON public.confessions
  FOR SELECT TO authenticated USING (
    group_id IS NULL OR public.is_group_member(group_id, auth.uid())
  );
CREATE POLICY "auth users post confessions" ON public.confessions
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid() AND (group_id IS NULL OR public.is_group_member(group_id, auth.uid()))
  );
CREATE POLICY "authors delete own; group admins delete in group" ON public.confessions
  FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_admin(group_id, auth.uid()))
  );

-- ============ Reactions ============
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('like','funny','sad','wow','support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (confession_id, user_id, kind)
);
GRANT SELECT, INSERT, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX reactions_confession_idx ON public.reactions (confession_id);

CREATE POLICY "reactions visible to anyone who can see confession" ON public.reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = confession_id
        AND (c.group_id IS NULL OR public.is_group_member(c.group_id, auth.uid()))
    )
  );
CREATE POLICY "users add own reactions" ON public.reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users remove own reactions" ON public.reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ Bookmarks ============
CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, confession_id)
);
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own bookmarks" ON public.bookmarks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ Reports ============
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('confession','comment','message','user','group')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporters see own; mods see all" ON public.reports
  FOR SELECT TO authenticated USING (
    reporter_id = auth.uid()
    OR public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "auth users create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "mods update reports" ON public.reports
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  );

-- ============ Group comments ============
CREATE TABLE public.group_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.group_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.group_comments TO authenticated;
GRANT ALL ON public.group_comments TO service_role;
ALTER TABLE public.group_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX group_comments_confession_idx ON public.group_comments (confession_id, created_at);

CREATE POLICY "comments visible to members of confession's group" ON public.group_comments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = confession_id
        AND c.group_id IS NOT NULL
        AND public.is_group_member(c.group_id, auth.uid())
    )
  );
CREATE POLICY "group members comment" ON public.group_comments
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = confession_id
        AND c.group_id IS NOT NULL
        AND public.is_group_member(c.group_id, auth.uid())
    )
  );
CREATE POLICY "authors delete own comments; admins delete in group" ON public.group_comments
  FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = confession_id
        AND c.group_id IS NOT NULL
        AND public.is_group_admin(c.group_id, auth.uid())
    )
  );

-- ============ Chat threads / participants / messages ============
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('direct','group')),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  confession_id UUID REFERENCES public.confessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_participants (
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_participants TO authenticated;
GRANT ALL ON public.chat_participants TO service_role;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_thread_participant(_thread_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_participants WHERE thread_id = _thread_id AND user_id = _user_id)
$$;

CREATE POLICY "threads visible to participants and group members" ON public.chat_threads
  FOR SELECT TO authenticated USING (
    public.is_thread_participant(id, auth.uid())
    OR (kind = 'group' AND group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  );
CREATE POLICY "auth users create threads" ON public.chat_threads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "participants visible to thread participants" ON public.chat_participants
  FOR SELECT TO authenticated USING (
    public.is_thread_participant(thread_id, auth.uid())
  );
CREATE POLICY "users join thread for themselves" ON public.chat_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users update own last_read" ON public.chat_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users leave thread themselves" ON public.chat_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX messages_thread_idx ON public.messages (thread_id, created_at);

CREATE POLICY "messages visible to thread participants and group members" ON public.messages
  FOR SELECT TO authenticated USING (
    public.is_thread_participant(thread_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id AND t.kind = 'group' AND t.group_id IS NOT NULL
        AND public.is_group_member(t.group_id, auth.uid())
    )
  );
CREATE POLICY "participants and group members send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND (
      public.is_thread_participant(thread_id, auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.chat_threads t
        WHERE t.id = thread_id AND t.kind = 'group' AND t.group_id IS NOT NULL
          AND public.is_group_member(t.group_id, auth.uid())
      )
    )
  );
CREATE POLICY "senders delete own messages" ON public.messages
  FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- ============ Notifications ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

CREATE POLICY "users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.confessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

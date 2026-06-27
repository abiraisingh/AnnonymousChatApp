-- Create direct private reply threads atomically under a controlled
-- SECURITY DEFINER function, avoiding RLS deadlocks while keeping client
-- participant inserts locked down.
CREATE OR REPLACE FUNCTION public.open_private_reply_thread(_confession_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id UUID := auth.uid();
  _author_id UUID;
  _thread_id UUID;
BEGIN
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Sign in required';
  END IF;

  SELECT author_id INTO _author_id
  FROM public.confessions
  WHERE id = _confession_id;

  IF _author_id IS NULL THEN
    RAISE EXCEPTION 'Confession not found';
  END IF;

  IF _author_id = _caller_id THEN
    RAISE EXCEPTION 'You can''t privately reply to yourself.';
  END IF;

  SELECT cp1.thread_id INTO _thread_id
  FROM public.chat_participants cp1
  JOIN public.chat_participants cp2 ON cp2.thread_id = cp1.thread_id
  JOIN public.chat_threads ct ON ct.id = cp1.thread_id
  WHERE cp1.user_id = _caller_id
    AND cp2.user_id = _author_id
    AND ct.kind = 'direct'
  LIMIT 1;

  IF _thread_id IS NOT NULL THEN
    RETURN _thread_id;
  END IF;

  INSERT INTO public.chat_threads (kind, confession_id)
  VALUES ('direct', _confession_id)
  RETURNING id INTO _thread_id;

  INSERT INTO public.chat_participants (thread_id, user_id)
  VALUES
    (_thread_id, _caller_id),
    (_thread_id, _author_id);

  INSERT INTO public.notifications (user_id, kind, payload)
  VALUES (
    _author_id,
    'private_reply',
    jsonb_build_object('thread_id', _thread_id, 'confession_id', _confession_id)
  );

  RETURN _thread_id;
END;
$$;

REVOKE ALL ON FUNCTION public.open_private_reply_thread(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_private_reply_thread(UUID) TO authenticated;

-- Ask PostgREST to reload its schema cache after the function is created.
NOTIFY pgrst, 'reload schema';

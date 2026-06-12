-- Global group chat for all students
CREATE TABLE IF NOT EXISTS public.student_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text        NOT NULL,
  content     text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can read student messages"
  ON public.student_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated can insert own message"
  ON public.student_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_student_messages_created_at
  ON public.student_messages(created_at ASC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.student_messages;

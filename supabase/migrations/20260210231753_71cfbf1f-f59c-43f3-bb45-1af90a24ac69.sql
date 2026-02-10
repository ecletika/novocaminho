
CREATE TABLE public.user_ministries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ministry_id uuid NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ministry_id)
);

ALTER TABLE public.user_ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage user_ministries"
ON public.user_ministries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own ministries"
ON public.user_ministries FOR SELECT
USING (auth.uid() = user_id);

CREATE TABLE public.restaurant_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL CHECK (submission_type IN ('reservation', 'contact')),
  name text NOT NULL,
  email text,
  phone text,
  reservation_date date,
  reservation_time time,
  guests integer,
  message text,
  source text NOT NULL DEFAULT 'restaurant-concierge',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.restaurant_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_submissions TO authenticated;
GRANT ALL ON public.restaurant_submissions TO service_role;

ALTER TABLE public.restaurant_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit restaurant enquiries"
  ON public.restaurant_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in users can review restaurant enquiries"
  ON public.restaurant_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX restaurant_submissions_created_at_idx
  ON public.restaurant_submissions (created_at DESC);

CREATE INDEX restaurant_submissions_type_idx
  ON public.restaurant_submissions (submission_type, status);
CREATE TABLE public.login_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  codigo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL,
  usado boolean NOT NULL DEFAULT false,
  tentativas integer NOT NULL DEFAULT 0
);

GRANT ALL ON public.login_otps TO service_role;

ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

CREATE INDEX login_otps_email_idx ON public.login_otps (lower(email), criado_em DESC);
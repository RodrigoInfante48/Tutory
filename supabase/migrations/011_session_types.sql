-- CFI session types: Precision Sprint, Culture Club, Professional Lab, Standard
CREATE TYPE public.session_type AS ENUM (
  'precision_sprint',
  'culture_club',
  'professional_lab',
  'standard'
);

ALTER TABLE public.class_sessions
  ADD COLUMN session_type public.session_type NOT NULL DEFAULT 'standard';

COMMENT ON COLUMN public.class_sessions.session_type IS
  'CFI methodology session type: precision_sprint | culture_club | professional_lab | standard';

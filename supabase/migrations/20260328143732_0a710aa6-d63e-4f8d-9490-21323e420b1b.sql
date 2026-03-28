
-- Custom roles table
CREATE TABLE public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom evaluation competencies table
CREATE TABLE public.custom_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_competencies ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (demo tool, no auth)
CREATE POLICY "Allow public read on custom_roles" ON public.custom_roles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert on custom_roles" ON public.custom_roles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public delete on custom_roles" ON public.custom_roles FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public read on custom_competencies" ON public.custom_competencies FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert on custom_competencies" ON public.custom_competencies FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public delete on custom_competencies" ON public.custom_competencies FOR DELETE TO anon USING (true);

-- Seed with defaults
INSERT INTO public.custom_roles (name) VALUES
  ('Chief Executive Officer'),
  ('Chief Operating Officer'),
  ('Chief Technology Officer'),
  ('Chief Financial Officer'),
  ('Chief Commercial Officer'),
  ('VP of Engineering'),
  ('Head of Strategy'),
  ('Head of Transformation');

INSERT INTO public.custom_competencies (name) VALUES
  ('Strategic Vision & Industry Foresight'),
  ('Transformation & Change Leadership'),
  ('Electric Vehicle & New Technology Expertise'),
  ('Financial Acumen & Capital Allocation'),
  ('Stakeholder Management & Board Relations'),
  ('Large Organisation Leadership'),
  ('Innovation & Emerging Technology Adoption'),
  ('Talent Development & Culture Building'),
  ('Crisis Management & Risk Mitigation'),
  ('Global Market Understanding'),
  ('Regulatory & Policy Navigation'),
  ('Cross-Functional Collaboration');

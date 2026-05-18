
-- Short slug for share links
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS short_slug text UNIQUE;

CREATE OR REPLACE FUNCTION public.gen_short_slug()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  alphabet text := 'abcdefghijkmnpqrstuvwxyz23456789';
  result text;
  i int;
  attempt int := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.files WHERE short_slug = result) THEN
      RETURN result;
    END IF;
    attempt := attempt + 1;
    IF attempt > 8 THEN
      RETURN result || substr(md5(random()::text), 1, 4);
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.files_set_short_slug()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.short_slug IS NULL THEN
    NEW.short_slug := public.gen_short_slug();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_files_short_slug ON public.files;
CREATE TRIGGER trg_files_short_slug
BEFORE INSERT ON public.files
FOR EACH ROW EXECUTE FUNCTION public.files_set_short_slug();

-- Backfill existing rows
UPDATE public.files SET short_slug = public.gen_short_slug() WHERE short_slug IS NULL;

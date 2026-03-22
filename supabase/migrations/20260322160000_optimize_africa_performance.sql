-- Index to speed up sorting in Africa content
CREATE INDEX IF NOT EXISTS idx_africa_content_sort_order ON public.africa_content(sort_order ASC);

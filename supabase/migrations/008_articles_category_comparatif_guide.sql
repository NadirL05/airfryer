-- Allow French display values 'Comparatif' and 'Guide' in articles.category
-- (keeps existing: guide, recipe, comparison, news)
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE articles ADD CONSTRAINT articles_category_check
  CHECK (category IN ('guide', 'recipe', 'comparison', 'news', 'Comparatif', 'Guide'));

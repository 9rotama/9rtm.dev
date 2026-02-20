INSERT INTO likes (slug, count) VALUES (?, 1)
ON CONFLICT(slug) DO UPDATE SET count = count + 1
RETURNING count

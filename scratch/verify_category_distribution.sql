-- VERIFICATION QUERY: CATEGORY DISTRIBUTION AUDIT
-- Run before and after executing migrations to verify counts across canonical categories.

SELECT 
    category, 
    COUNT(*) as article_count 
FROM articles 
GROUP BY category 
ORDER BY article_count DESC;

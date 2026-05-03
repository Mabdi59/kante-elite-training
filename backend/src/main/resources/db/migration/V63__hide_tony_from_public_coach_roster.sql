UPDATE coach_profiles
SET
    active = FALSE,
    featured = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(display_name) LIKE '%tony%';

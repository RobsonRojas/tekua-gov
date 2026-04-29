-- Migration: Fix activities descriptions that are stored as strings instead of JSONB objects
-- Date: 2026-04-29

DO $$ 
BEGIN
    -- Update activities where description is just a string (not a JSON object with 'pt' key)
    -- We use jsonb_typeof to check if it's a string, or check if it's missing the 'pt' key
    UPDATE activities
    SET description = jsonb_build_object('pt', description #>> '{}', 'en', description #>> '{}')
    WHERE jsonb_typeof(description) = 'string'
       OR (jsonb_typeof(description) = 'object' AND NOT (description ? 'pt'));
END $$;

-- Change default min_confirmations from 3 to 1
ALTER TABLE activities ALTER COLUMN min_confirmations SET DEFAULT 1;

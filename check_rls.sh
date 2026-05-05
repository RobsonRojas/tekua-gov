#!/bin/bash
# Find all CREATE TABLE statements and check if they have a corresponding ENABLE ROW LEVEL SECURITY
# in ANY migration file.

echo "Running comprehensive RLS audit..."

# Get unique table names from CREATE TABLE statements
grep -rhioP 'CREATE TABLE (IF NOT EXISTS )?\K[\w.]+' supabase/migrations/*.sql | sed 's/public\.//' | sort | uniq > tables.txt

missing=0
while read table; do
    # Skip partition tables that might be created dynamically
    if [[ $table == *"%"* ]]; then continue; fi
    
    # Check if this table is EVER enabled for RLS in any file
    if ! grep -rqi "ALTER TABLE .*$table.* ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql; then
        echo "FAIL: Table '$table' is missing RLS enablement in all migration files!"
        missing=$((missing + 1))
    else
        echo "OK: Table '$table' has RLS enablement."
    fi
done < tables.txt

if [ $missing -eq 0 ]; then
    echo "SUCCESS: All tables created in migrations have RLS enabled."
    exit 0
else
    echo "ERROR: $missing tables are missing RLS enablement."
    exit 1
fi

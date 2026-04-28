#!/bin/bash
# Find all CREATE TABLE statements and check if they have a corresponding ENABLE ROW LEVEL SECURITY
# This is a heuristic as it only checks the same file.

for file in supabase/migrations/*.sql; do
    tables=$(grep "CREATE TABLE" "$file" | sed -E 's/.*CREATE TABLE (IF NOT EXISTS )?([a-zA-Z0-9_\.]+).*/\2/' | sed 's/public\.//' | sed 's/(.*//' | tr -d '[:space:]')
    for table in $tables; do
        if ! grep -q "ENABLE ROW LEVEL SECURITY" "$file"; then
             echo "Possible missing RLS for table: $table in $file"
        else
            if ! grep -q "ALTER TABLE .*$table.* ENABLE ROW LEVEL SECURITY" "$file" && ! grep -q "ALTER TABLE (public\.)?$table ENABLE ROW LEVEL SECURITY" "$file"; then
                 # Check if maybe it's just ALTER TABLE table ENABLE ...
                 if ! grep -q "ALTER TABLE $table ENABLE ROW LEVEL SECURITY" "$file"; then
                    echo "Table $table created in $file but RLS enablement not found in the same file."
                 fi
            fi
        fi
    done
done

#!/bin/bash
# Grant privileges for Prisma shadow database creation
# This script runs during MySQL initialization (only when volume is empty)

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    GRANT CREATE, DROP, ALTER, INDEX, REFERENCES ON *.* TO '$MYSQL_USER'@'%';
    FLUSH PRIVILEGES;
EOSQL

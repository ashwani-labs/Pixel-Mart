# TiDB Cloud — run all bootstrap SQL in order via TiDB Cloud SQL Editor or mysql CLI
# Connection: mysql -h <TIDB_HOST> -P 4000 -u <USERNAME> -p --ssl-mode=VERIFY_IDENTITY
#
# Run each file in order:
#   01-schemas.sql
#   02-auth-service.sql
#   03-catalog-service.sql
#   04-order-service.sql
#   05-notification-service.sql
#
# Or paste the contents of each file sequentially into the TiDB Cloud SQL Editor.

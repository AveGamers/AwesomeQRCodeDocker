#!/bin/sh
set -eu

if [ "${DATABASE_DIALECT:-sqlite}" = "sqlite" ]; then
  db_url="${DATABASE_URL:-file:./data/awesome-qr.db}"
  db_path="${db_url#file:}"

  case "$db_path" in
    /*)
      db_file="$db_path"
      ;;
    *)
      db_file="/app/${db_path#./}"
      ;;
  esac

  db_dir="$(dirname "$db_file")"
  mkdir -p "$db_dir"
  chown -R nextjs:nodejs "$db_dir"
fi

exec gosu nextjs:nodejs "$@"
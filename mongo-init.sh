#!/bin/bash
set -e

if [ "$MONGO_INITDB_ROOT_USERNAME" ] && [ "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  rootAuthDatabase="$MONGO_INITDB_DATABASE"
  "${mongo[@]}" "$rootAuthDatabase" <<-EOJS
  db.auth("$MONGO_INITDB_ROOT_USERNAME", "$MONGO_INITDB_ROOT_PASSWORD")
  db.createUser({
    user:  "$MONGO_USERNAME",
    pwd: "$MONGO_PASSWORD",
    roles: [{
      role: 'readWrite',
      db: "$MONGO_DB"
    }]
  })
  EOJS
fi

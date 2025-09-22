#!/bin/sh

echo "Running Prisma migrations..."
#npx prisma migrate deploy --schema=./libs/database/prisma/schema.prisma
npm run prisma:migrate:deploy

echo "Starting application..."
exec node dist/apps/api/main.js

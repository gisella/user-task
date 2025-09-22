#!/bin/sh

npm run prisma:migrate:deploy

echo "Starting application..."
node dist/apps/api/main.js

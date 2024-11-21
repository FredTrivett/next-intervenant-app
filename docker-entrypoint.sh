#!/bin/sh

# Generate Prisma Client
npx prisma generate

# Execute the main command
exec "$@" 
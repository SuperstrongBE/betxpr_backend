#!/bin/bash

# Start infrastructure services
docker-compose -f docker-compose.infra.yml up -d

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z localhost 6379; do   
  sleep 0.1
done
echo "Redis is ready!"

# Build shared package
echo "Building shared package..."
npm run build:shared

# Start all Nest.js applications in parallel
echo "Starting Nest.js applications..."
cd apps/data-processor && npm run start:dev &
cd ../eth-listener && npm run start:dev &
cd ../xpr-listener && npm run start:dev &

# Wait for all background processes
wait
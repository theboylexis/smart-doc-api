#!/bin/sh
npx prisma migrate deploy
node src/server.js

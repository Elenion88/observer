#!/bin/bash
cd "$(dirname "$0")/.."
npx tsx prisma/seed.ts

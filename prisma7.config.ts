import 'dotenv/config'  // Must be on the first line
import { defineConfig, env } from '@prisma/prisma7/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'), // Read from .env
  },
})
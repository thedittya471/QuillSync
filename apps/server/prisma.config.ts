import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/quillsync',
  },
})

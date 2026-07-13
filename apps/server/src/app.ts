import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import workspaceRouter from './routes/workspace.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/workspaces', workspaceRouter)

app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  })
})

export default app

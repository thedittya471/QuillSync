import { Router } from 'express'
import { WorkspaceController } from '../controllers/workspace.controller.js'
import { authenticateJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Apply authenticateJWT middleware to all workspace endpoints
router.use(authenticateJWT as any)

router.post('/', WorkspaceController.createWorkspace)
router.get('/', WorkspaceController.listWorkspaces)
router.get('/:workspaceId', WorkspaceController.getWorkspace)
router.patch('/:workspaceId', WorkspaceController.updateWorkspace)
router.delete('/:workspaceId', WorkspaceController.deleteWorkspace)

export default router
